"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { palette } from "@/lib/palette";
import { scrollState, PHASES, phase } from "@/lib/scroll";

function scatter(count: number, spread: [number, number, number], z = 0) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread[0];
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread[1];
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread[2] + z;
  }
  return positions;
}

/**
 * Two points systems: drifting steel dust (fog handles the depth fade) and
 * additive weld sparks that flare up while the grid is being "welded" into
 * place. Counts are halved on coarse-pointer (mobile) devices.
 */
export default function Particles() {
  const coarse = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches,
    [],
  );

  const dustPositions = useMemo(
    () => scatter(coarse ? 300 : 600, [18, 10, 20], 1),
    [coarse],
  );
  const sparkPositions = useMemo(
    () => scatter(coarse ? 90 : 180, [7, 5, 6], -0.5),
    [coarse],
  );

  const dustRef = useRef<THREE.Points>(null);
  const sparksRef = useRef<THREE.Points>(null);
  const sparkMatRef = useRef<THREE.PointsMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (dustRef.current) dustRef.current.rotation.y = t * 0.008;
    if (sparksRef.current) sparksRef.current.rotation.y = -t * 0.02;
    if (sparkMatRef.current) {
      const morph = phase(scrollState.smooth, PHASES.morph);
      const weld = Math.min(1, morph * 1.5);
      sparkMatRef.current.opacity =
        (0.3 + 0.6 * weld) * (0.82 + 0.18 * Math.sin(t * 7));
    }
  });

  return (
    <>
      <points ref={dustRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color={palette.steel}
          transparent
          opacity={0.28}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
      <points ref={sparksRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparkPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={sparkMatRef}
          size={0.035}
          color={palette.amber}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </>
  );
}
