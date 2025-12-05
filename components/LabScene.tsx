import React from 'react';
import { GridHelper, Color } from 'three';
import { Text } from '@react-three/drei';

export const LabScene: React.FC = () => {
  return (
    <>
      <color attach="background" args={['#1e1e24']} />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4ade80" />
      <spotLight 
        position={[0, 50, 0]} 
        angle={0.3} 
        penumbra={1} 
        intensity={0.8} 
        castShadow 
      />

      <group position={[0, -20, 0]} rotation={[0, 0, 0]}>
         {/* Lab Bench Grid */}
         <gridHelper args={[100, 50, 0x444444, 0x222222]} />
         
         {/* Subtle Background Text */}
         <Text
            position={[-15, 0.1, -15]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={2}
            color="#333333"
            anchorX="left"
            anchorY="top"
         >
            GEN-LAB MODEL 01
         </Text>
         <Text
            position={[15, 0.1, 15]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={1}
            color="#333333"
            anchorX="right"
            anchorY="bottom"
         >
            PROJ: ALPHA-HELIX
         </Text>
      </group>

      <fog attach="fog" args={['#1e1e24', 20, 90]} />
    </>
  );
};