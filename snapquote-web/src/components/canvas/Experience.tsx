"use client";

import { useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import Lighting from "./Lighting";
import ChaosManifold from "./ChaosManifold";
import InvoicePane from "./InvoicePane";
import Particles from "./Particles";
import ScrollManager from "./ScrollManager";
import { palette } from "@/lib/palette";

/**
 * The single fixed WebGL layer. Sits behind the HTML overlay (-z-10),
 * never intercepts pointer events, and degrades dpr under load instead of
 * dropping frames.
 */
export default function Experience() {
  const [dpr, setDpr] = useState(1.5);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0.5, 14], fov: 42, near: 0.1, far: 60 }}
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          powerPreference: "high-performance",
        }}
      >
        <color attach="background" args={[palette.carbon]} />
        <fog attach="fog" args={[palette.carbon, 10, 26]} />
        <PerformanceMonitor
          onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
          onIncline={() => setDpr((d) => Math.min(2, d + 0.25))}
        >
          <Lighting />
          <ChaosManifold />
          <InvoicePane />
          <Particles />
          <ScrollManager />
        </PerformanceMonitor>
      </Canvas>
    </div>
  );
}
