"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { palette } from "@/lib/palette";
import { scrollState, PHASES, phase } from "@/lib/scroll";

// ————————————————————————————————————————————— deterministic layout ————
// Seeded RNG so the manifold is identical across reloads and hot refreshes.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInCubic = (x: number) => x * x * x;
// Slight overshoot past the grid pose then settle — this is the "snap".
const easeOutBack = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

// Per-instance stagger window: instances start snapping at different times,
// all landed by morph = 1.
const STAGGER_SPAN = 0.35;
const localMorph = (morph: number, stagger: number) =>
  clamp01(morph * (1 + STAGGER_SPAN) - stagger);

type Pose = {
  pos: THREE.Vector3;
  quat: THREE.Quaternion;
  scale: THREE.Vector3;
};
type DualPose = { chaos: Pose; grid: Pose; stagger: number };

const GRID_Z = -1.4;
const GRID_XS = [-2.7, -1.8, -0.9, 0, 0.9, 1.8, 2.7];
const GRID_YS = [-1.8, -0.9, 0, 0.9, 1.8];

const AXIS_QUATS = {
  x: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -Math.PI / 2)),
  y: new THREE.Quaternion(),
  z: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)),
};

function randomChaosPose(rand: () => number, scale: THREE.Vector3): Pose {
  return {
    pos: new THREE.Vector3(
      (rand() - 0.5) * 6.4,
      (rand() - 0.5) * 4.2,
      (rand() - 0.5) * 5.0,
    ),
    quat: new THREE.Quaternion()
      .setFromEuler(
        new THREE.Euler(
          rand() * Math.PI * 2,
          rand() * Math.PI * 2,
          rand() * Math.PI * 2,
        ),
      )
      .normalize(),
    scale,
  };
}

export default function ChaosManifold() {
  // All geometry, materials, and dual poses are built once — scroll only
  // lerps transforms; nothing is regenerated per frame.
  const built = useMemo(() => {
    const rand = mulberry32(20260719);

    // — chaotic pipes: catmull-rom tubes through random points —
    const pipes: {
      geometry: THREE.TubeGeometry;
      material: THREE.MeshPhysicalMaterial;
      stagger: number;
    }[] = [];
    const curves: THREE.CatmullRomCurve3[] = [];
    for (let i = 0; i < 12; i++) {
      const points: THREE.Vector3[] = [];
      const n = 4 + Math.floor(rand() * 3);
      for (let j = 0; j < n; j++) {
        points.push(
          new THREE.Vector3(
            (rand() - 0.5) * 6.4,
            (rand() - 0.5) * 4.2,
            (rand() - 0.5) * 5.0,
          ),
        );
      }
      const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.8);
      curves.push(curve);
      pipes.push({
        geometry: new THREE.TubeGeometry(curve, 72, 0.07 + rand() * 0.07, 10, false),
        material: new THREE.MeshPhysicalMaterial({
          color: "#34343a",
          metalness: 1,
          roughness: 0.15 + rand() * 0.3,
          clearcoat: 0.6,
          clearcoatRoughness: 0.3,
          transparent: true,
        }),
        stagger: rand() * STAGGER_SPAN,
      });
    }

    // — grid members: straight lattice the chaos snaps into —
    const memberPoses: DualPose[] = [];
    const addMember = (pos: THREE.Vector3, axis: "x" | "y" | "z", len: number) => {
      memberPoses.push({
        chaos: randomChaosPose(rand, new THREE.Vector3(0.6, len * 0.5, 0.6)),
        grid: {
          pos,
          quat: AXIS_QUATS[axis].clone(),
          scale: new THREE.Vector3(1, len, 1),
        },
        stagger: rand() * STAGGER_SPAN,
      });
    };
    for (const x of GRID_XS) addMember(new THREE.Vector3(x, 0, GRID_Z), "y", 3.6);
    for (const y of GRID_YS) addMember(new THREE.Vector3(0, y, GRID_Z), "x", 5.4);
    for (let i = 0; i < GRID_XS.length; i += 2) {
      for (let j = 0; j < GRID_YS.length; j += 2) {
        addMember(
          new THREE.Vector3(GRID_XS[i], GRID_YS[j], GRID_Z + 0.18),
          "z",
          0.36,
        );
      }
    }

    // — flanges: torus rings scattered along pipes → grid intersections —
    const flangePoses: DualPose[] = [];
    for (const x of GRID_XS) {
      for (const y of GRID_YS) {
        const curve = curves[Math.floor(rand() * curves.length)];
        const chaos = randomChaosPose(rand, new THREE.Vector3(1, 1, 1));
        chaos.pos.copy(curve.getPoint(rand()));
        flangePoses.push({
          chaos,
          grid: {
            pos: new THREE.Vector3(x, y, GRID_Z + 0.03),
            quat: new THREE.Quaternion(),
            scale: new THREE.Vector3(1, 1, 1),
          },
          stagger: rand() * STAGGER_SPAN,
        });
      }
    }

    // — valves: stubby fittings that dock onto the lattice bays —
    const valvePoses: DualPose[] = [];
    for (let i = 0; i < 14; i++) {
      const x = GRID_XS[Math.floor(rand() * (GRID_XS.length - 1))] + 0.45;
      const y = GRID_YS[Math.floor(rand() * GRID_YS.length)];
      valvePoses.push({
        chaos: randomChaosPose(rand, new THREE.Vector3(1.4, 1.4, 1.4)),
        grid: {
          pos: new THREE.Vector3(x, y, GRID_Z + 0.12),
          quat: AXIS_QUATS.z.clone(),
          scale: new THREE.Vector3(1, 1, 1),
        },
        stagger: rand() * STAGGER_SPAN,
      });
    }

    return {
      pipes,
      memberPoses,
      flangePoses,
      valvePoses,
      memberGeometry: new THREE.CylinderGeometry(0.045, 0.045, 1, 12),
      memberMaterial: new THREE.MeshPhysicalMaterial({
        color: "#4a4a52",
        metalness: 1,
        roughness: 0.22,
        clearcoat: 0.5,
        clearcoatRoughness: 0.25,
        emissive: new THREE.Color(palette.amber),
        emissiveIntensity: 0,
      }),
      flangeGeometry: new THREE.TorusGeometry(0.09, 0.028, 8, 24),
      flangeMaterial: new THREE.MeshPhysicalMaterial({
        color: "#52525b",
        metalness: 1,
        roughness: 0.3,
        clearcoat: 0.4,
      }),
      valveGeometry: new THREE.CylinderGeometry(0.06, 0.06, 0.14, 12),
      valveMaterial: new THREE.MeshPhysicalMaterial({
        color: "#26262b",
        metalness: 1,
        roughness: 0.38,
        clearcoat: 0.5,
      }),
    };
  }, []);

  const pipeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const membersRef = useRef<THREE.InstancedMesh>(null);
  const flangesRef = useRef<THREE.InstancedMesh>(null);
  const valvesRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const writeInstances = (
    mesh: THREE.InstancedMesh | null,
    poses: DualPose[],
    morph: number,
  ) => {
    if (!mesh) return;
    for (let i = 0; i < poses.length; i++) {
      const { chaos, grid, stagger } = poses[i];
      const l = localMorph(morph, stagger);
      const tPos = easeOutBack(l);
      const tRot = easeOutCubic(l);
      dummy.position.lerpVectors(chaos.pos, grid.pos, tPos);
      dummy.quaternion.slerpQuaternions(chaos.quat, grid.quat, tRot);
      dummy.scale.lerpVectors(chaos.scale, grid.scale, tRot);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  useFrame(({ clock }) => {
    const morph = phase(scrollState.smooth, PHASES.morph);

    // Chaos pipes collapse toward center and fade as their grid counterparts
    // snap in — the crossfade hides behind the camera pull-back.
    for (let i = 0; i < built.pipes.length; i++) {
      const mesh = pipeRefs.current[i];
      if (!mesh) continue;
      const l = localMorph(morph, built.pipes[i].stagger);
      mesh.scale.setScalar(Math.max(0.001, 1 - easeInCubic(l)));
      built.pipes[i].material.opacity = 1 - easeOutCubic(l);
      mesh.visible = l < 0.98;
    }

    writeInstances(membersRef.current, built.memberPoses, morph);
    writeInstances(flangesRef.current, built.flangePoses, morph);
    writeInstances(valvesRef.current, built.valvePoses, morph);

    // Weld glow ramps up as the lattice locks in — kept low so the members
    // still read as gunmetal steel with hot edges, not solid amber.
    built.memberMaterial.emissiveIntensity =
      easeOutCubic(morph) * (0.14 + 0.04 * Math.sin(clock.elapsedTime * 2));
  });

  return (
    <group>
      {built.pipes.map((pipe, i) => (
        <mesh
          key={i}
          ref={(el) => {
            pipeRefs.current[i] = el;
          }}
          geometry={pipe.geometry}
          material={pipe.material}
          frustumCulled={false}
        />
      ))}
      <instancedMesh
        ref={membersRef}
        args={[built.memberGeometry, built.memberMaterial, built.memberPoses.length]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={flangesRef}
        args={[built.flangeGeometry, built.flangeMaterial, built.flangePoses.length]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={valvesRef}
        args={[built.valveGeometry, built.valveMaterial, built.valvePoses.length]}
        frustumCulled={false}
      />
    </group>
  );
}
