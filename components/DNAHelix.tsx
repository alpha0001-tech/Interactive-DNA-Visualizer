import React, { useRef, useLayoutEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Vector3, Quaternion, Color, Group, Matrix4 } from 'three';
import { COLORS, CONFIG, PAIRS } from '../constants';
import { DNAPair } from '../types';

interface DNAHelixProps {
  data: DNAPair[];
  twist: number; // Degrees per base
}

const tempObject = new Object3D();
const tempColor = new Color();
const matrix = new Matrix4();

export const DNAHelix: React.FC<DNAHelixProps> = ({ data, twist }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const backboneRef = useRef<InstancedMesh>(null);
  const groupRef = useRef<Group>(null);
  
  // We use a separate geometry for bonds to handle the dashed look or just thin lines
  // Since lines are hard to instance with thickness, we use thin cylinders for bonds
  const bondsRef = useRef<InstancedMesh>(null);

  const count = data.length;
  
  // Convert twist to radians
  const twistRad = (twist * Math.PI) / 180;

  useLayoutEffect(() => {
    if (!meshRef.current || !backboneRef.current || !bondsRef.current) return;

    // 1. Bases (BoxGeometry)
    // 2 instances per base pair (Left + Right)
    // Total instances = count * 2
    
    // 2. Backbone (SphereGeometry)
    // 2 instances per base pair (Left + Right)
    // Total instances = count * 2

    // 3. Hydrogen Bonds (CylinderGeometry)
    // We will draw 1, 2, or 3 bonds per pair depending on type.
    // For simplicity in this "Instanced" setup, let's just draw 2 lines for all, 
    // or we can strictly follow A-T=2, G-C=3 by managing instance counts dynamically.
    // To keep it performant and simple: 2 bonds for A-T, 3 for G-C.
    // Max bonds = count * 3. 
    
    let bondIndex = 0;

    data.forEach((pair, i) => {
      const y = (i - count / 2) * CONFIG.RISE;
      const angle = i * twistRad;

      // --- BACKBONE ---
      const backboneLeftPos = new Vector3(Math.cos(angle) * CONFIG.RADIUS, y, Math.sin(angle) * CONFIG.RADIUS);
      const backboneRightPos = new Vector3(Math.cos(angle + Math.PI) * CONFIG.RADIUS, y, Math.sin(angle + Math.PI) * CONFIG.RADIUS);

      // Left Backbone
      tempObject.position.copy(backboneLeftPos);
      tempObject.rotation.set(0, 0, 0);
      tempObject.scale.set(1, 1, 1);
      tempObject.updateMatrix();
      backboneRef.current!.setMatrixAt(i * 2, tempObject.matrix);
      backboneRef.current!.setColorAt(i * 2, COLORS.BACKBONE);

      // Right Backbone
      tempObject.position.copy(backboneRightPos);
      tempObject.updateMatrix();
      backboneRef.current!.setMatrixAt(i * 2 + 1, tempObject.matrix);
      backboneRef.current!.setColorAt(i * 2 + 1, COLORS.BACKBONE);

      // --- BASES ---
      // Left Base (extends from Backbone towards center)
      // Center point of Left Base should be: (backbone + center) / 2 roughly?
      // No, let's position it at radius/2 and rotate it.
      
      const baseRadius = CONFIG.RADIUS * 0.5; 
      
      // Left Base
      const leftBasePos = new Vector3(Math.cos(angle) * baseRadius, y, Math.sin(angle) * baseRadius);
      tempObject.position.copy(leftBasePos);
      tempObject.lookAt(new Vector3(0, y, 0)); // Look at center
      tempObject.scale.set(1, 1, 1);
      tempObject.updateMatrix();
      
      const leftIdx = i * 2;
      meshRef.current!.setMatrixAt(leftIdx, tempObject.matrix);
      
      // Determine color based on mutation flash
      const isMutated = pair.mutationTime && (Date.now() - pair.mutationTime < 500);
      const baseColor = isMutated ? COLORS.HIGHLIGHT : COLORS[pair.left];
      meshRef.current!.setColorAt(leftIdx, baseColor);

      // Right Base
      const rightBasePos = new Vector3(Math.cos(angle + Math.PI) * baseRadius, y, Math.sin(angle + Math.PI) * baseRadius);
      tempObject.position.copy(rightBasePos);
      tempObject.lookAt(new Vector3(0, y, 0));
      tempObject.updateMatrix();

      const rightIdx = i * 2 + 1;
      meshRef.current!.setMatrixAt(rightIdx, tempObject.matrix);
      const rightColor = isMutated ? COLORS.HIGHLIGHT : COLORS[pair.right];
      meshRef.current!.setColorAt(rightIdx, rightColor);

      // --- HYDROGEN BONDS ---
      // A-T: 2 bonds, G-C: 3 bonds
      const bondsCount = (pair.left === 'G' || pair.left === 'C') ? 3 : 2;
      const bondSpacing = 0.2;
      
      // Vector perpendicular to the radius (tangent) for bond offset
      // Radius vector: (cos a, 0, sin a)
      // Tangent: (-sin a, 0, cos a)
      const tangent = new Vector3(-Math.sin(angle), 0, Math.cos(angle));
      
      for (let b = 0; b < bondsCount; b++) {
         // Calculate offset from center
         // If 2 bonds: -0.5*spacing, +0.5*spacing
         // If 3 bonds: -spacing, 0, +spacing
         let offsetScale = 0;
         if (bondsCount === 2) offsetScale = (b === 0 ? -0.5 : 0.5);
         if (bondsCount === 3) offsetScale = (b - 1);

         const bondOffset = tangent.clone().multiplyScalar(offsetScale * bondSpacing);
         const bondPos = new Vector3(0, y, 0).add(bondOffset);
         
         tempObject.position.copy(bondPos);
         tempObject.lookAt(leftBasePos); // Align with pair direction
         tempObject.rotateX(Math.PI / 2); // Cylinder is Y-up, we need it horizontal between bases? 
         // Actually lookAt aligns Z. If cylinder is default Y aligned, rotate X 90 to align with Z?
         // Let's assume cylinder aligns Y. If we want it to point from left to right.
         // Vector L->R is through center.
         // Let's just align it with the radial vector.
         
         tempObject.lookAt(new Vector3(Math.cos(angle), y, Math.sin(angle)).add(bondPos)); // look outward
         tempObject.rotateZ(Math.PI / 2); // Align cylinder Y (height) with the radial vector
         
         // Scale X/Z for thickness, Y for length
         // Length should cover the gap. Base width is 1.2. Radius 2.
         // Gap is roughly 2*RADIUS - 2*BASE_WIDTH = 4 - 2.4 = 1.6?
         // But we positioned bases at RADIUS * 0.5 = 1.
         // The box is at 1. It has width.
         // Let's just make the bond length 0.5 to bridge the visual gap.
         tempObject.scale.set(1, 0.5, 1);
         
         tempObject.updateMatrix();
         bondsRef.current!.setMatrixAt(bondIndex, tempObject.matrix);
         bondsRef.current!.setColorAt(bondIndex, COLORS.BOND);
         bondIndex++;
      }
    });

    // Hide unused bond instances (move to infinity)
    for (let j = bondIndex; j < count * 3; j++) {
       tempObject.position.set(10000, 0, 0);
       tempObject.updateMatrix();
       bondsRef.current!.setMatrixAt(j, tempObject.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    
    backboneRef.current.instanceMatrix.needsUpdate = true;
    if (backboneRef.current.instanceColor) backboneRef.current.instanceColor.needsUpdate = true;

    bondsRef.current.instanceMatrix.needsUpdate = true;
    // Bonds don't need color update strictly if they are all white, but good practice
    if (bondsRef.current.instanceColor) bondsRef.current.instanceColor.needsUpdate = true;

  }, [data, twist, twistRad, count]);

  // Animation loop for highlights decay (optional, but cleaner than forcing re-render)
  useFrame(() => {
    if (!meshRef.current) return;
    
    let needsUpdate = false;
    const now = Date.now();

    data.forEach((pair, i) => {
        if (pair.mutationTime && now - pair.mutationTime < 600) {
            // Re-apply highlight color logic here if we wanted smooth fade
            // For now, the layoutEffect handles the 'flash' state change via React render cycle
            // because `data` changes when we click mutate.
            // If we want smooth fade, we'd do it here.
            // Let's stick to simple state updates for robustness.
        }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Bases: A, T, C, G */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, count * 2]}
        frustumCulled={false}
      >
        <boxGeometry args={[CONFIG.BASE_WIDTH, CONFIG.BASE_HEIGHT, CONFIG.BASE_DEPTH]} />
        <meshStandardMaterial roughness={0.3} metalness={0.1} />
      </instancedMesh>

      {/* Backbone: Sugar-Phosphate */}
      <instancedMesh
        ref={backboneRef}
        args={[undefined, undefined, count * 2]}
        frustumCulled={false}
      >
        <sphereGeometry args={[CONFIG.BACKBONE_RADIUS, 16, 16]} />
        <meshStandardMaterial color={COLORS.BACKBONE} roughness={0.2} metalness={0.5} />
      </instancedMesh>

      {/* Hydrogen Bonds */}
      <instancedMesh
        ref={bondsRef}
        args={[undefined, undefined, count * 3]} // Max 3 bonds per pair
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshBasicMaterial color={COLORS.BOND} transparent opacity={0.4} />
      </instancedMesh>
    </group>
  );
};