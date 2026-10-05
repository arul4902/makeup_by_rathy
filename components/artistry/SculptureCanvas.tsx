"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function MinimalSculpture() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.18;
      meshRef.current.rotation.y += delta * 0.25;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.12;
      ringRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer flowing champagne Möbius-like ring */}
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1.35, 0.18, 128, 32, 2, 3]} />
        <meshPhysicalMaterial
          color="#DEC59F"
          metalness={0.88}
          roughness={0.22}
          clearcoat={0.9}
          clearcoatRoughness={0.15}
          reflectivity={0.9}
        />
      </mesh>

      {/* Delicate inner orbit ring */}
      <group ref={ringRef} scale={1.85}>
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[1.1, 0.02, 16, 80]} />
          <meshStandardMaterial color="#E8D6BA" metalness={0.92} roughness={0.18} />
        </mesh>
      </group>
    </group>
  );
}

export default function SculptureCanvas() {
  return (
    <div className="sculpture-canvas-wrap" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5.2], fov: 42 }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      >
        <ambientLight intensity={1.4} color="#FFF8F0" />
        <directionalLight position={[4, 5, 3]} intensity={2.2} color="#FFF2DF" />
        <directionalLight position={[-4, -3, -2]} intensity={0.9} color="#E8D6BA" />
        <pointLight position={[0, 2, 3]} intensity={1.8} color="#FFFBF7" />
        <Suspense fallback={null}>
          <MinimalSculpture />
        </Suspense>
      </Canvas>
    </div>
  );
}
