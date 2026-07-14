import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  ShaderMaterial,
  Sphere,
  Vector3,
} from 'three';
import { useQualityTier } from '@/hooks/useQualityTier';
import { useSceneEnv } from '@/hooks/useSceneEnv';
import { sunDirection } from '@/scenes/sky/SkyDome';
import { getWorldMask, groundPath, isPlantable, terrainHeight } from '@/scenes/environment/world';
import { mulberry32 } from '@/utils/math';
import grassFrag from '@/shaders/grass.frag.glsl';
import grassVert from '@/shaders/grass.vert.glsl';

/**
 * GPU-instanced meadow. Blades are distributed in chunks strung along the
 * garden walk; each chunk is its own InstancedBufferGeometry with a tight
 * bounding sphere, so three.js frustum-culls whole chunks as the camera
 * moves — typically only ~35–45% of blades are ever on screen.
 *
 * One blade = 5 vertices / 3 triangles, bent and gusted in the vertex
 * shader. All chunks share one ShaderMaterial (a single program).
 */

const CHUNK_SPACING = 8;
const CHUNK_RADIUS = 11;

function bladeGeometry(): BufferGeometry {
  const geo = new BufferGeometry();
  const positions = new Float32Array([
    -0.024, 0, 0,
    0.024, 0, 0,
    -0.016, 0.46, 0,
    0.016, 0.46, 0,
    0, 1, 0,
  ]);
  geo.setAttribute('position', new BufferAttribute(positions, 3));
  geo.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4]);
  return geo;
}

interface Chunk {
  geometry: InstancedBufferGeometry;
  center: Vector3;
}

function buildChunks(totalInstances: number): Chunk[] {
  const mask = getWorldMask();
  const base = bladeGeometry();
  const rng = mulberry32(910117);

  const samples = Math.ceil(groundPath.getLength() / CHUNK_SPACING);
  const centers: Vector3[] = [];
  for (let i = 0; i <= samples; i++) {
    centers.push(groundPath.getPointAt(Math.min(i / samples, 1)));
  }

  const perChunk = Math.floor(totalInstances / centers.length);
  const chunks: Chunk[] = [];

  for (const center of centers) {
    const offsets: number[] = [];
    const scales: number[] = [];
    const angles: number[] = [];
    const jitters: number[] = [];
    let placed = 0;
    let attempts = 0;
    while (placed < perChunk && attempts < perChunk * 3) {
      attempts++;
      const angle = rng() * Math.PI * 2;
      // sqrt keeps density even; slight center bias hugs the walk edges.
      const radius = Math.sqrt(rng()) * CHUNK_RADIUS;
      const x = center.x + Math.cos(angle) * radius;
      const z = center.z + Math.sin(angle) * radius;
      if (!isPlantable(x, z, mask)) continue;
      const y = terrainHeight(x, z, mask);
      offsets.push(x, y, z);
      scales.push(0.55 + rng() * 0.75);
      angles.push(rng() * Math.PI * 2);
      jitters.push(rng());
      placed++;
    }
    if (placed === 0) continue;

    const geo = new InstancedBufferGeometry();
    geo.index = base.index;
    geo.attributes.position = base.attributes.position as BufferAttribute;
    geo.instanceCount = placed;
    geo.setAttribute('aOffset', new InstancedBufferAttribute(new Float32Array(offsets), 3));
    geo.setAttribute('aScale', new InstancedBufferAttribute(new Float32Array(scales), 1));
    geo.setAttribute('aAngle', new InstancedBufferAttribute(new Float32Array(angles), 1));
    geo.setAttribute('aJitter', new InstancedBufferAttribute(new Float32Array(jitters), 1));
    geo.boundingSphere = new Sphere(
      new Vector3(center.x, 1, center.z),
      CHUNK_RADIUS + 2.5,
    );
    chunks.push({ geometry: geo, center: center.clone() });
  }
  return chunks;
}

export function GrassField(): React.JSX.Element {
  const { budget } = useQualityTier();
  const { env } = useSceneEnv();

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: grassVert,
        fragmentShader: grassFrag,
        side: DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uWind: { value: 0.5 },
          uBaseColor: { value: new Color('#2e4c22') },
          uTipColor: { value: new Color('#7ba24a') },
          uDryColor: { value: new Color('#a89a55') },
          uSunColor: { value: new Color('#ffffff') },
          uSunDir: { value: new Vector3(0, 1, 0) },
          uSunIntensity: { value: 1 },
          uExposure: { value: 1 },
          uFogColor: { value: new Color('#dccbb2') },
          uFogDensity: { value: 0.012 },
        },
      }),
    [],
  );

  const chunks = useMemo(() => buildChunks(budget.grassInstances), [budget.grassInstances]);

  useFrame((state) => {
    const u = material.uniforms;
    u.uTime!.value = state.clock.elapsedTime;
    u.uWind!.value = env.wind;
    (u.uSunColor!.value as Color).setRGB(env.sunColor.r, env.sunColor.g, env.sunColor.b);
    sunDirection(u.uSunDir!.value as Vector3, Math.max(env.sunElevation, 4), env.sunAzimuth);
    u.uSunIntensity!.value = env.sunIntensity;
    u.uExposure!.value = env.exposure;
    (u.uFogColor!.value as Color).setRGB(env.fogColor.r, env.fogColor.g, env.fogColor.b);
    u.uFogDensity!.value = env.fogDensity;
  });

  return (
    <group>
      {chunks.map((chunk, index) => (
        <mesh
          key={index}
          geometry={chunk.geometry}
          material={material}
          frustumCulled
          position={[0, 0, 0]}
        />
      ))}
    </group>
  );
}
