"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { palette } from "@/lib/palette";
import { scrollState, PHASES, phase } from "@/lib/scroll";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const easeOutBack = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

// The invoice materializes during the back half of the morph phase…
const MATERIALIZE: readonly [number, number] = [0.45, 0.68];

const PANE_W = 2.3;
const PANE_H = 0.78;
const PANE_T = 0.05;

type PaneSpec = {
  /** local pose while the invoice reads as one sheet */
  assembled: { pos: THREE.Vector3; rot: THREE.Euler };
  /** local pose once fractured out into its feature position */
  fractured: { pos: THREE.Vector3; rot: THREE.Euler };
  stagger: number;
  /** abstract "text line" bar widths */
  bars: number[];
};

const HEADER: PaneSpec = {
  assembled: { pos: new THREE.Vector3(0, 1.16, 0), rot: new THREE.Euler() },
  fractured: {
    pos: new THREE.Vector3(0, 1.55, 0.15),
    rot: new THREE.Euler(0, 0, 0),
  },
  stagger: 0,
  bars: [0.9],
};

// One pane per feature: Instant Quoting / Multi-Trade Templates / Automated
// Billing — fanned left, center, right to sit beside the Features copy.
const PANES: PaneSpec[] = [
  {
    assembled: { pos: new THREE.Vector3(0, 0.58, 0), rot: new THREE.Euler() },
    fractured: {
      pos: new THREE.Vector3(-2.55, 0.55, 0.35),
      rot: new THREE.Euler(0, 0.38, 0.02),
    },
    stagger: 0,
    bars: [1.5, 1.1, 1.3],
  },
  {
    assembled: { pos: new THREE.Vector3(0, -0.28, 0), rot: new THREE.Euler() },
    fractured: {
      pos: new THREE.Vector3(0, -0.28, 0.75),
      rot: new THREE.Euler(-0.06, 0, 0),
    },
    stagger: 0.09,
    bars: [1.3, 1.5, 0.9],
  },
  {
    assembled: { pos: new THREE.Vector3(0, -1.14, 0), rot: new THREE.Euler() },
    fractured: {
      pos: new THREE.Vector3(2.55, -1.05, 0.35),
      rot: new THREE.Euler(0, -0.38, -0.02),
    },
    stagger: 0.18,
    bars: [1.1, 1.4, 1.2],
  },
];

function PaneBars({ bars, amber }: { bars: number[]; amber?: boolean }) {
  return (
    <>
      {/* amber emissive edge strip along the left rail */}
      <mesh position={[-PANE_W / 2 + 0.09, 0, PANE_T / 2 + 0.012]}>
        <boxGeometry args={[0.035, PANE_H * 0.72, 0.02]} />
        <meshBasicMaterial color={palette.amber} toneMapped={false} />
      </mesh>
      {bars.map((w, i) => (
        <mesh
          key={i}
          position={[
            -PANE_W / 2 + 0.24 + w / 2,
            (bars.length - 1) * 0.11 - i * 0.22,
            PANE_T / 2 + 0.012,
          ]}
        >
          <boxGeometry args={[w, 0.045, 0.02]} />
          <meshBasicMaterial
            color={amber && i === 0 ? palette.amber : palette.steel}
            toneMapped={amber && i === 0 ? false : true}
            transparent
            opacity={amber && i === 0 ? 1 : 0.55}
          />
        </mesh>
      ))}
    </>
  );
}

/**
 * The glass invoice: materializes as one transmission sheet once the grid has
 * snapped, then fractures into three feature panes that fan out beside the
 * Features copy.
 */
export default function InvoicePane() {
  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#e8e8ec",
        metalness: 0,
        roughness: 0.08,
        transmission: 1,
        thickness: 0.35,
        ior: 1.45,
        attenuationColor: new THREE.Color(palette.amber),
        attenuationDistance: 4,
      }),
    [],
  );

  const groupRef = useRef<THREE.Group>(null);
  const paneRefs = useRef<(THREE.Group | null)[]>([]);
  const headerRef = useRef<THREE.Group>(null);

  const applyPose = (group: THREE.Group | null, spec: PaneSpec, frac: number) => {
    if (!group) return;
    const l = easeInOutCubic(clamp01(frac * 1.25 - spec.stagger));
    group.position.lerpVectors(spec.assembled.pos, spec.fractured.pos, l);
    group.rotation.set(
      THREE.MathUtils.lerp(spec.assembled.rot.x, spec.fractured.rot.x, l),
      THREE.MathUtils.lerp(spec.assembled.rot.y, spec.fractured.rot.y, l),
      THREE.MathUtils.lerp(spec.assembled.rot.z, spec.fractured.rot.z, l),
    );
  };

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    const p = scrollState.smooth;
    const mat = phase(p, MATERIALIZE);
    const frac = phase(p, PHASES.fracture);

    // …scaling in with a snap-settle, drifting forward off the grid plane.
    group.visible = mat > 0.001;
    if (!group.visible) return;
    const s = Math.max(0.001, easeOutBack(mat));
    group.scale.setScalar(s);
    group.position.set(0, 0.05, 0.2 + 0.7 * easeOutCubic(mat));
    group.rotation.y = (1 - easeOutCubic(mat)) * 0.6;

    applyPose(headerRef.current, HEADER, frac);
    PANES.forEach((spec, i) => applyPose(paneRefs.current[i], spec, frac));
  });

  return (
    <group ref={groupRef} visible={false}>
      <group ref={headerRef}>
        <RoundedBox args={[PANE_W, 0.44, PANE_T]} radius={0.05} smoothness={3} material={glass} />
        {/* logo bar + amber underline: the "SNAPQUOTE" letterhead */}
        <mesh position={[-PANE_W / 2 + 0.69, 0.05, PANE_T / 2 + 0.012]}>
          <boxGeometry args={[0.9, 0.07, 0.02]} />
          <meshBasicMaterial color={palette.steel} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, -0.16, PANE_T / 2 + 0.012]}>
          <boxGeometry args={[PANE_W * 0.86, 0.028, 0.02]} />
          <meshBasicMaterial color={palette.amber} toneMapped={false} />
        </mesh>
      </group>
      {PANES.map((spec, i) => (
        <group
          key={i}
          ref={(el) => {
            paneRefs.current[i] = el;
          }}
        >
          <RoundedBox
            args={[PANE_W, PANE_H, PANE_T]}
            radius={0.05}
            smoothness={3}
            material={glass}
          />
          <PaneBars bars={spec.bars} amber={i === 0} />
        </group>
      ))}
    </group>
  );
}
