import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Sphere, Box, Cylinder } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function StudentAvatar() {
  const headRef = useRef();
  const bodyRef = useRef();

  useFrame((state) => {
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      headRef.current.position.y = Math.sin(state.clock.elapsedTime * 1) * 0.05;
    }
    if (bodyRef.current) {
      bodyRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group>
      {/* Body */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.3}>
        <group ref={bodyRef}>
          {/* Torso */}
          <Cylinder args={[0.6, 0.7, 1.2, 8]} position={[0, -0.8, 0]}>
            <MeshTransmissionMaterial
              backside
              thickness={0.5}
              roughness={0.1}
              transmission={0.9}
              ior={1.5}
              chromaticAberration={0.05}
              color="#e67028"
            />
          </Cylinder>
          
          {/* Head */}
          <group ref={headRef} position={[0, 0.6, 0]}>
            <Sphere args={[0.5, 16, 16]}>
              <MeshTransmissionMaterial
                backside
                thickness={0.4}
                roughness={0.1}
                transmission={0.95}
                ior={1.5}
                chromaticAberration={0.03}
                color="#ffb37a"
              />
            </Sphere>
            {/* Graduation cap */}
            <Box args={[0.8, 0.05, 0.8]} position={[0, 0.5, 0]}>
              <MeshTransmissionMaterial
                backside
                thickness={0.3}
                roughness={0.1}
                transmission={0.9}
                ior={1.5}
                color="#151515"
              />
            </Box>
            <Cylinder args={[0.05, 0.05, 0.3, 8]} position={[0, 0.35, 0]}>
              <MeshTransmissionMaterial
                backside
                thickness={0.3}
                roughness={0.1}
                transmission={0.9}
                ior={1.5}
                color="#151515"
              />
            </Cylinder>
          </group>
          
          {/* Arms */}
          <Cylinder args={[0.15, 0.15, 0.8, 8]} position={[0.8, -0.6, 0]} rotation={[0, 0, 0.3]}>
            <MeshTransmissionMaterial
              backside
              thickness={0.3}
              roughness={0.1}
              transmission={0.9}
              ior={1.5}
              color="#e67028"
            />
          </Cylinder>
          <Cylinder args={[0.15, 0.15, 0.8, 8]} position={[-0.8, -0.6, 0]} rotation={[0, 0, -0.3]}>
            <MeshTransmissionMaterial
              backside
              thickness={0.3}
              roughness={0.1}
              transmission={0.9}
              ior={1.5}
              color="#e67028"
            />
          </Cylinder>
        </group>
      </Float>
    </group>
  );
}

export default function StudentAvatar3D() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#ffb37a" />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#e67028" />
        <StudentAvatar />
      </Canvas>
    </div>
  );
}
