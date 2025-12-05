import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, OrbitControlsProps } from '@react-three/drei';
import { Group, MathUtils } from 'three';
import { DNAHelix } from './components/DNAHelix';
import { LabScene } from './components/LabScene';
import { Controls } from './components/Controls';
import { DNAState, DNAPair } from './types';
import { BASES, PAIRS } from './constants';
import { v4 as uuidv4 } from 'uuid'; // Actually we don't have 'uuid' installed in this prompt environment usually. Using simple random ID.

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

const generateRandomPair = (): DNAPair => {
  const left = BASES[Math.floor(Math.random() * BASES.length)];
  return {
    id: generateId(),
    left,
    right: PAIRS[left],
  };
};

const generateSequence = (length: number): DNAPair[] => {
  return Array.from({ length }, () => generateRandomPair());
};

const Rotator = ({ speed, active, children }: { speed: number, active: boolean, children?: React.ReactNode }) => {
    const groupRef = useRef<Group>(null);
    useFrame((_, delta) => {
        if (active && groupRef.current) {
            groupRef.current.rotation.y += speed * delta;
        }
    });
    return <group ref={groupRef}>{children}</group>;
};

const App: React.FC = () => {
  // State
  const [dnaState, setDnaState] = useState<DNAState>({
    length: 20,
    twist: 34.0,
    autoSpin: true,
    spinSpeed: 0.5,
  });

  const [data, setData] = useState<DNAPair[]>(() => generateSequence(dnaState.length));
  
  // Controls ref to reset camera
  const controlsRef = useRef<any>(null);

  // Handle Length Change
  useEffect(() => {
    setData(prev => {
      if (prev.length === dnaState.length) return prev;
      if (prev.length < dnaState.length) {
        // Add new pairs
        const newPairs = generateSequence(dnaState.length - prev.length);
        return [...prev, ...newPairs];
      } else {
        // Trim
        return prev.slice(0, dnaState.length);
      }
    });
  }, [dnaState.length]);

  // Handle Mutation
  const handleMutate = useCallback(() => {
    setData(prev => {
      // Pick 10% of indices to mutate (min 1)
      const numMutations = Math.max(1, Math.floor(prev.length * 0.1));
      const newPairs = [...prev];
      
      for (let k = 0; k < numMutations; k++) {
        const idx = Math.floor(Math.random() * prev.length);
        newPairs[idx] = {
            ...generateRandomPair(),
            id: newPairs[idx].id, // Keep ID stable if preferred, or change it. Keeping ID helps React not unmount if we were using components, but here we use InstancedMesh so it's fine.
            mutationTime: Date.now()
        };
      }
      return newPairs;
    });
  }, []);

  const handleResetCam = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      // Look at center from side
      controlsRef.current.object.position.set(0, 0, 40);
      controlsRef.current.object.lookAt(0, 0, 0);
    }
  }, []);

  return (
    <div className="w-full h-screen relative bg-black">
      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 5, 30], fov: 45 }}
        dpr={[1, 2]} // Clamp DPR for performance
        shadows
      >
        <LabScene />
        
        <Rotator active={dnaState.autoSpin} speed={dnaState.spinSpeed}>
            {/* Center the helix vertically based on length */}
            <group position={[0, 0, 0]}>
                <DNAHelix data={data} twist={dnaState.twist} />
            </group>
        </Rotator>

        <OrbitControls 
            ref={controlsRef} 
            makeDefault 
            enableDamping 
            dampingFactor={0.05}
            minDistance={10}
            maxDistance={100}
        />
      </Canvas>

      {/* Overlay UI */}
      <Controls 
        state={dnaState} 
        onChange={(updates) => setDnaState(prev => ({ ...prev, ...updates }))}
        onMutate={handleMutate}
        onResetCam={handleResetCam}
      />
    </div>
  );
};

export default App;