"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import type { Mesh } from "three";

function HeroMesh() {
  const mesh = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.x += delta * 0.15;
    mesh.current.rotation.y += delta * 0.2;
    // Tie rotation to page scroll so the object turns as the user moves
    // through the marketing sections.
    mesh.current.rotation.z = window.scrollY * 0.0005;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.4, 0]} />
        <meshStandardMaterial
          color="#d4ff3f"
          metalness={0.85}
          roughness={0.25}
          wireframe
        />
      </mesh>
    </Float>
  );
}

export default function Experience() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} />
        <HeroMesh />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
