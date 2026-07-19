import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  PlaneGeometry,
  Points,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useQualityTier } from '@/hooks/useQualityTier';
import { useSceneEnv } from '@/hooks/useSceneEnv';
import { useSceneStore } from '@/stores/sceneStore';
import { groundPath, terrainHeight } from '@/scenes/environment/world';
import { mulberry32 } from '@/utils/math';
import pointsFrag from '@/shaders/points.frag.glsl';
import pointsVert from '@/shaders/points.vert.glsl';
import wingsFrag from '@/shaders/wings.frag.glsl';
import wingsVert from '@/shaders/wings.vert.glsl';

/**
 * Atmospheric life, all weighted by the master timeline:
 *  - pollen motes glinting in daylight sun shafts
 *  - fireflies blinking near the ground from dusk onward
 *  - butterflies over the flower borders by day; distant birds high up
 * Point systems drift entirely in the vertex shader; only the handful of
 * butterfly/bird instance matrices are touched by the CPU each frame.
 */

function corridorPoints(count: number, seed: number, yMin: number, yMax: number): Float32Array {
  const rng = mulberry32(seed);
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const p = groundPath.getPointAt(rng());
    const x = p.x + (rng() - 0.5) * 16;
    const z = p.z + (rng() - 0.5) * 12;
    const ground = terrainHeight(x, z);
    positions[i * 3] = x;
    positions[i * 3 + 1] = ground + yMin + rng() * (yMax - yMin);
    positions[i * 3 + 2] = z;
  }
  return positions;
}

interface PointSystemProps {
  count: number;
  seed: number;
  yMin: number;
  yMax: number;
  color: string;
  sizeRange: [number, number];
  rise: number;
  drift: number;
  twinkleMix: number;
  weight: () => number;
}

function PointSystem({ count, seed, yMin, yMax, color, sizeRange, rise, drift, twinkleMix, weight }: PointSystemProps) {
  const points = useMemo(() => {
    const rng = mulberry32(seed * 7 + 1);
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(corridorPoints(count, seed, yMin, yMax), 3));
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      seeds[i] = rng();
      sizes[i] = sizeRange[0] + rng() * (sizeRange[1] - sizeRange[0]);
    }
    geo.setAttribute('aSeed', new BufferAttribute(seeds, 1));
    geo.setAttribute('aSize', new BufferAttribute(sizes, 1));

    const material = new ShaderMaterial({
      vertexShader: pointsVert,
      fragmentShader: pointsFrag,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uWind: { value: 0.5 },
        uRise: { value: rise },
        uDrift: { value: drift },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uColor: { value: new Color(color) },
        uOpacity: { value: 0 },
        uTwinkleMix: { value: twinkleMix },
      },
    });
    const p = new Points(geo, material);
    p.frustumCulled = false;
    return p;
  }, [count, seed, yMin, yMax, color, sizeRange, rise, drift, twinkleMix]);

  const { env } = useSceneEnv();
  useFrame((state) => {
    const material = points.material as ShaderMaterial;
    material.uniforms.uTime!.value = state.clock.elapsedTime;
    material.uniforms.uWind!.value = env.wind;
    material.uniforms.uOpacity!.value = weight();
  });

  return <primitive object={points} />;
}

interface WingFlockProps {
  count: number;
  seed: number;
  wingScale: number;
  altitude: [number, number];
  range: number;
  speed: number;
  flapSpeed: number;
  color: string;
  accent: string;
  weight: () => number;
}

function WingFlock({ count, seed, wingScale, altitude, range, speed, flapSpeed, color, accent, weight }: WingFlockProps) {
  const meshRef = useRef<InstancedMesh>(null);

  const { mesh, paths } = useMemo(() => {
    const rng = mulberry32(seed);
    const wing = new PlaneGeometry(0.26, 0.18, 1, 1);
    wing.translate(0.13, 0, 0);
    const left = wing.clone();
    left.scale(-1, 1, 1);
    const merged = mergeGeometries([wing, left])!;
    merged.scale(wingScale, wingScale, wingScale);
    merged.rotateX(-Math.PI / 2.6);

    const geo = merged;
    const phaseAttr = new Float32Array(count);
    for (let i = 0; i < count; i++) phaseAttr[i] = rng();

    const material = new ShaderMaterial({
      vertexShader: wingsVert,
      fragmentShader: wingsFrag,
      side: DoubleSide,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uFlapSpeed: { value: flapSpeed },
        uColor: { value: new Color(color) },
        uAccent: { value: new Color(accent) },
        uOpacity: { value: 0 },
      },
    });

    const instanced = new InstancedMesh(geo, material, count);
    instanced.geometry.setAttribute('aPhase', new InstancedBufferAttribute(phaseAttr, 1));
    instanced.frustumCulled = false;

    const flightPaths = Array.from({ length: count }, () => {
      const anchor = groundPath.getPointAt(rng());
      return {
        cx: anchor.x + (rng() - 0.5) * range,
        cz: anchor.z + (rng() - 0.5) * range,
        y: altitude[0] + rng() * (altitude[1] - altitude[0]),
        rx: 1.5 + rng() * range * 0.5,
        rz: 1.5 + rng() * range * 0.5,
        offset: rng() * Math.PI * 2,
        rate: (0.5 + rng() * 0.5) * speed,
      };
    });

    return { mesh: instanced, paths: flightPaths };
  }, [count, seed, wingScale, altitude, range, speed, flapSpeed, color, accent]);

  const matrix = useMemo(() => new Matrix4(), []);
  const pos = useMemo(() => new Vector3(), []);
  const quat = useMemo(() => new Quaternion(), []);
  const scale = useMemo(() => new Vector3(1, 1, 1), []);
  const up = useMemo(() => new Vector3(0, 1, 0), []);

  useFrame((state) => {
    const instanced = meshRef.current;
    if (!instanced) return;
    const material = instanced.material as ShaderMaterial;
    const w = weight();
    material.uniforms.uTime!.value = state.clock.elapsedTime;
    material.uniforms.uOpacity!.value = w;
    if (w < 0.01) return; // frozen while invisible

    const t = state.clock.elapsedTime;
    paths.forEach((p, i) => {
      const a = p.offset + t * p.rate;
      const x = p.cx + Math.cos(a) * p.rx;
      const z = p.cz + Math.sin(a * 1.3) * p.rz;
      const y = p.y + Math.sin(a * 2.1) * 0.4 + Math.max(terrainHeight(p.cx, p.cz), 0);
      // Face the direction of travel.
      const heading = Math.atan2(Math.cos(a * 1.3) * 1.3 * p.rz, -Math.sin(a) * p.rx);
      quat.setFromAxisAngle(up, heading);
      matrix.compose(pos.set(x, y, z), quat, scale);
      instanced.setMatrixAt(i, matrix);
    });
    instanced.instanceMatrix.needsUpdate = true;
  });

  return <primitive object={mesh} ref={meshRef} />;
}

export function Particles(): React.JSX.Element | null {
  const { budget } = useQualityTier();
  const { env } = useSceneEnv();
  const particlesEnabled = useSceneStore((state) => state.particlesEnabled);
  const intensity = useSceneStore((state) => state.intensity);

  if (!particlesEnabled) return null;

  const pollenCount = Math.round(budget.particleBudget * 0.55);
  const fireflyCount = Math.round(budget.particleBudget * 0.45);
  const butterflyCount = budget.particleBudget >= 3000 ? 12 : budget.particleBudget >= 1200 ? 8 : 5;

  return (
    <group>
      <PointSystem
        count={pollenCount}
        seed={41113}
        yMin={0.4}
        yMax={3.4}
        color="#ffe9b8"
        sizeRange={[0.7, 1.6]}
        rise={0.5}
        drift={0.9}
        twinkleMix={0.25}
        weight={() => env.pollen * env.sunGlow * intensity * 0.9}
      />
      <PointSystem
        count={fireflyCount}
        seed={92201}
        yMin={0.25}
        yMax={1.6}
        color="#d8ff9e"
        sizeRange={[1.1, 2.2]}
        rise={0.35}
        drift={1.4}
        twinkleMix={1}
        weight={() => env.fireflies * intensity}
      />
      <WingFlock
        count={butterflyCount}
        seed={30303}
        wingScale={1}
        altitude={[0.7, 1.8]}
        range={7}
        speed={0.5}
        flapSpeed={9}
        color="#f0e3c0"
        accent="#d98e5f"
        weight={() => env.butterflies * intensity}
      />
      {budget.particleBudget >= 1200 && (
        <WingFlock
          count={5}
          seed={70707}
          wingScale={3.2}
          altitude={[22, 34]}
          range={50}
          speed={0.22}
          flapSpeed={3.2}
          color="#2c3138"
          accent="#4a5058"
          weight={() => Math.max(0, 1 - env.starIntensity * 2) * env.butterflies * intensity}
        />
      )}
    </group>
  );
}
