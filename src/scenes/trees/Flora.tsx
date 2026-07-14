import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  DynamicDrawUsage,
  IcosahedronGeometry,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  PlaneGeometry,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useQualityTier } from '@/hooks/useQualityTier';
import { useSceneEnv } from '@/hooks/useSceneEnv';
import { getWorldMask, isPlantable, terrainHeight } from '@/scenes/environment/world';
import { mulberry32 } from '@/utils/math';
import flowerFrag from '@/shaders/flower.frag.glsl';
import flowerVert from '@/shaders/flower.vert.glsl';

/**
 * Trees, shrubs and flowers. Three procedural low-poly tree varieties are
 * built once (vertex-colored, merged geometry) and instanced; a wind sway is
 * injected into the standard material so foliage keeps full PBR lighting and
 * cast shadows. Flowers are a lighter instanced shader like the grass.
 */

interface Placement {
  matrices: Matrix4[];
}

function paintVertexColors(geo: BufferGeometry, color: Color, jitter: number, rng: () => number): void {
  const count = geo.attributes.position?.count ?? 0;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const v = 1 - jitter / 2 + rng() * jitter;
    colors[i * 3] = color.r * v;
    colors[i * 3 + 1] = color.g * v;
    colors[i * 3 + 2] = color.b * v;
  }
  geo.setAttribute('color', new BufferAttribute(colors, 3));
}

function jitterVertices(geo: BufferGeometry, amount: number, rng: () => number): void {
  const positions = geo.attributes.position;
  if (!positions) return;
  for (let i = 0; i < positions.count; i++) {
    positions.setXYZ(
      i,
      positions.getX(i) + (rng() - 0.5) * amount,
      positions.getY(i) + (rng() - 0.5) * amount,
      positions.getZ(i) + (rng() - 0.5) * amount,
    );
  }
  geo.computeVertexNormals();
}

/** Broadleaf: trunk + three foliage lobes. */
function canopyTree(rng: () => number): BufferGeometry {
  const trunk = new CylinderGeometry(0.1, 0.19, 1.9, 6);
  trunk.translate(0, 0.95, 0);
  paintVertexColors(trunk, new Color('#5d4534'), 0.15, rng);

  const lobes: BufferGeometry[] = [];
  const greens = ['#3d6b33', '#48793a', '#2f5a2a'];
  for (let i = 0; i < 3; i++) {
    const lobe = new IcosahedronGeometry(0.85 + rng() * 0.5, 1);
    jitterVertices(lobe, 0.24, rng);
    lobe.translate((rng() - 0.5) * 1.1, 2.1 + i * 0.55 + rng() * 0.3, (rng() - 0.5) * 1.1);
    paintVertexColors(lobe, new Color(greens[i % 3]), 0.3, rng);
    lobes.push(lobe);
  }
  return mergeGeometries([trunk, ...lobes]) ?? trunk;
}

/** Column cypress: three stacked, jittered cones. */
function cypress(rng: () => number): BufferGeometry {
  const parts: BufferGeometry[] = [];
  const trunk = new CylinderGeometry(0.06, 0.1, 0.5, 5);
  trunk.translate(0, 0.25, 0);
  paintVertexColors(trunk, new Color('#54402f'), 0.15, rng);
  parts.push(trunk);
  for (let i = 0; i < 3; i++) {
    const cone = new ConeGeometry(0.62 - i * 0.16, 1.5 - i * 0.2, 7);
    jitterVertices(cone, 0.1, rng);
    cone.translate(0, 0.9 + i * 0.85, 0);
    paintVertexColors(cone, new Color(i % 2 ? '#2c4f28' : '#35592e'), 0.22, rng);
    parts.push(cone);
  }
  return mergeGeometries(parts) ?? parts[0]!;
}

/** Clipped ornamental shrub. */
function shrub(rng: () => number): BufferGeometry {
  const blob = new IcosahedronGeometry(0.55 + rng() * 0.3, 1);
  jitterVertices(blob, 0.12, rng);
  blob.scale(1, 0.82, 1);
  blob.translate(0, 0.45, 0);
  paintVertexColors(blob, new Color('#3a5f31'), 0.25, rng);
  return blob;
}

function placeInstances(
  count: number,
  rng: () => number,
  minDist: number,
  maxDist: number,
  scaleRange: [number, number],
): Placement {
  const mask = getWorldMask();
  const matrices: Matrix4[] = [];
  const pos = new Vector3();
  const scale = new Vector3();
  const quat = new Quaternion();
  const up = new Vector3(0, 1, 0);
  let attempts = 0;
  while (matrices.length < count && attempts < count * 14) {
    attempts++;
    const z = 24 - rng() * 178;
    const side = rng() > 0.5 ? 1 : -1;
    const x = side * (minDist + rng() * (maxDist - minDist)) + (rng() - 0.5) * 4;
    if (!isPlantable(x, z, mask)) continue;
    const y = terrainHeight(x, z, mask);
    pos.set(x, y - 0.05, z);
    const s = scaleRange[0] + rng() * (scaleRange[1] - scaleRange[0]);
    scale.set(s, s * (0.92 + rng() * 0.16), s);
    quat.setFromAxisAngle(up, rng() * Math.PI * 2);
    matrices.push(new Matrix4().compose(pos.clone(), quat.clone(), scale.clone()));
  }
  return { matrices };
}

/** Shared foliage material with injected wind sway (keeps PBR + shadows). */
function makeFoliageMaterial(): MeshStandardMaterial {
  const mat = new MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0 });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.uniforms.uWind = { value: 0.5 };
    mat.userData.shader = shader;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        /* glsl */ `#include <common>
        uniform float uTime;
        uniform float uWind;`,
      )
      .replace(
        '#include <begin_vertex>',
        /* glsl */ `#include <begin_vertex>
        #ifdef USE_INSTANCING
          float tsPhase = instanceMatrix[3].x * 0.31 + instanceMatrix[3].z * 0.17;
          float tsHeight = max(transformed.y, 0.0);
          float tsSway = sin(uTime * 1.1 + tsPhase) * uWind * 0.05 * tsHeight * tsHeight;
          transformed.x += tsSway;
          transformed.z += tsSway * 0.65;
        #endif`,
      );
  };
  return mat;
}

interface TreeLayerProps {
  build: (rng: () => number) => BufferGeometry;
  seed: number;
  count: number;
  minDist: number;
  maxDist: number;
  scaleRange: [number, number];
  material: MeshStandardMaterial;
}

function TreeLayer({ build, seed, count, minDist, maxDist, scaleRange, material }: TreeLayerProps) {
  const mesh = useMemo(() => {
    const rng = mulberry32(seed);
    const geometry = build(rng);
    const { matrices } = placeInstances(count, rng, minDist, maxDist, scaleRange);
    const instanced = new InstancedMesh(geometry, material, matrices.length);
    matrices.forEach((m, i) => instanced.setMatrixAt(i, m));
    instanced.instanceMatrix.needsUpdate = true;
    instanced.castShadow = true;
    instanced.receiveShadow = false;
    instanced.frustumCulled = false; // spans the full corridor; cheap either way
    return instanced;
  }, [build, seed, count, minDist, maxDist, scaleRange, material]);

  return <primitive object={mesh} />;
}

function Flowers({ count }: { count: number }) {
  const { env } = useSceneEnv();

  const geometry = useMemo(() => {
    const mask = getWorldMask();
    const rng = mulberry32(550771);
    // Crossed quads, 0.06 wide stem zone up to a 0.22 bloom head.
    const quad = new PlaneGeometry(0.16, 0.42, 1, 2);
    quad.translate(0, 0.21, 0);
    const cross = quad.clone().rotateY(Math.PI / 2);
    const base = mergeGeometries([quad, cross])!;

    const offsets: number[] = [];
    const scales: number[] = [];
    const angles: number[] = [];
    const jitters: number[] = [];
    let placed = 0;
    let attempts = 0;
    while (placed < count && attempts < count * 12) {
      attempts++;
      const z = 20 - rng() * 168;
      const side = rng() > 0.5 ? 1 : -1;
      const x = side * (2.2 + rng() * 5.5);
      if (!isPlantable(x, z, mask)) continue;
      offsets.push(x, terrainHeight(x, z, mask), z);
      scales.push(0.7 + rng() * 0.7);
      angles.push(rng() * Math.PI * 2);
      jitters.push(rng());
      placed++;
    }

    const geo = new InstancedBufferGeometry();
    geo.index = base.index;
    geo.attributes.position = base.attributes.position as BufferAttribute;
    geo.attributes.uv = base.attributes.uv as BufferAttribute;
    geo.instanceCount = placed;
    geo.setAttribute('aOffset', new InstancedBufferAttribute(new Float32Array(offsets), 3));
    geo.setAttribute('aScale', new InstancedBufferAttribute(new Float32Array(scales), 1));
    geo.setAttribute('aAngle', new InstancedBufferAttribute(new Float32Array(angles), 1));
    geo.setAttribute('aJitter', new InstancedBufferAttribute(new Float32Array(jitters), 1));
    return geo;
  }, [count]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: flowerVert,
        fragmentShader: flowerFrag,
        side: DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uWind: { value: 0.5 },
          uStem: { value: new Color('#39602f') },
          uPetalA: { value: new Color('#f3e6c8') },
          uPetalB: { value: new Color('#d78ba4') },
          uExposure: { value: 1 },
          uFogColor: { value: new Color('#dccbb2') },
          uFogDensity: { value: 0.012 },
        },
      }),
    [],
  );

  useFrame((state) => {
    const u = material.uniforms;
    u.uTime!.value = state.clock.elapsedTime;
    u.uWind!.value = env.wind;
    u.uExposure!.value = env.exposure * (0.35 + env.sunIntensity * 0.4);
    (u.uFogColor!.value as Color).setRGB(env.fogColor.r, env.fogColor.g, env.fogColor.b);
    u.uFogDensity!.value = env.fogDensity;
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
}

export function Flora(): React.JSX.Element {
  const { budget } = useQualityTier();
  const { env } = useSceneEnv();

  const foliageMaterial = useMemo(() => makeFoliageMaterial(), []);

  useFrame((state) => {
    const shader = foliageMaterial.userData.shader as
      | { uniforms: { uTime: { value: number }; uWind: { value: number } } }
      | undefined;
    if (shader) {
      shader.uniforms.uTime.value = state.clock.elapsedTime;
      shader.uniforms.uWind.value = env.wind;
    }
  });

  const trees = budget.treeInstances;
  return (
    <group>
      <TreeLayer build={canopyTree} seed={101} count={Math.round(trees * 0.42)} minDist={7} maxDist={26} scaleRange={[1.1, 2.3]} material={foliageMaterial} />
      <TreeLayer build={cypress} seed={202} count={Math.round(trees * 0.26)} minDist={5} maxDist={20} scaleRange={[0.9, 1.7]} material={foliageMaterial} />
      <TreeLayer build={shrub} seed={303} count={Math.round(trees * 0.32)} minDist={2.5} maxDist={12} scaleRange={[0.8, 1.6]} material={foliageMaterial} />
      <Flowers count={budget.flowerInstances} />
    </group>
  );
}

/** Kept for future premium assets: instanced meshes want dynamic usage. */
export const INSTANCE_USAGE = DynamicDrawUsage;
