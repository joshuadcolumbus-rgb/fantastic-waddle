import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture, Color, MeshStandardMaterial, PlaneGeometry } from 'three';

/** Structural type for onBeforeCompile's shader argument (three ≥ r152). */
interface ShaderLike {
  uniforms: Record<string, { value: unknown }>;
  vertexShader: string;
  fragmentShader: string;
}
import { useQualityTier } from '@/hooks/useQualityTier';
import { useSceneEnv } from '@/hooks/useSceneEnv';
import { getWorldMask, terrainHeight, WORLD, WORLD_DEPTH, WORLD_WIDTH } from '@/scenes/environment/world';

/**
 * The ground: a CPU-displaced plane (rolling meadow, flattened walk, pond
 * basins) with a standard PBR material whose albedo is procedurally split
 * into meadow / stone path / pond-earth via the world mask texture. Receives
 * the sun's shadows; grass instancing sits on top.
 */
export function Terrain(): React.JSX.Element {
  const { tier } = useQualityTier();
  const { env } = useSceneEnv();

  const geometry = useMemo(() => {
    const mask = getWorldMask();
    const segments = tier === 'high' ? [140, 170] : tier === 'medium' ? [100, 124] : [64, 84];
    const geo = new PlaneGeometry(WORLD_WIDTH, WORLD_DEPTH, segments[0] ?? 100, segments[1] ?? 124);
    geo.rotateX(-Math.PI / 2);
    // Plane XY → world XZ; translate so it spans WORLD exactly.
    geo.translate((WORLD.minX + WORLD.maxX) / 2, 0, (WORLD.minZ + WORLD.maxZ) / 2);

    const positions = geo.attributes.position;
    if (positions) {
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        positions.setY(i, terrainHeight(x, z, mask));
      }
      positions.needsUpdate = true;
    }
    geo.computeVertexNormals();
    return geo;
  }, [tier]);

  const material = useMemo(() => {
    const mask = getWorldMask();
    const maskTexture = new CanvasTexture(mask.canvas);
    maskTexture.flipY = false;

    const mat = new MeshStandardMaterial({
      color: new Color('#5b8250'),
      roughness: 0.95,
      metalness: 0,
    });
    // Force vUv so the mask can be sampled without a base map.
    (mat as MeshStandardMaterial & { defines: Record<string, string> }).defines = { USE_UV: '' };
    mat.onBeforeCompile = (shader: ShaderLike) => {
      shader.uniforms.uMask = { value: maskTexture };
      shader.uniforms.uSunWarm = { value: 0 };
      mat.userData.shader = shader;
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          /* glsl */ `#include <common>
          uniform sampler2D uMask;
          uniform float uSunWarm;
          float tsHash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }`,
        )
        .replace(
          '#include <color_fragment>',
          /* glsl */ `#include <color_fragment>
          {
            vec3 mask = texture2D(uMask, vUv).rgb;
            // Meadow: two greens drifting at landscape scale + dry patches.
            float drift = tsHash(floor(vUv * 90.0)) * 0.5 + tsHash(floor(vUv * 22.0)) * 0.5;
            vec3 meadow = mix(vec3(0.28, 0.42, 0.23), vec3(0.38, 0.53, 0.28), drift);
            meadow = mix(meadow, vec3(0.52, 0.5, 0.32), smoothstep(0.72, 0.95, drift) * 0.5);
            meadow *= 0.95 + uSunWarm * 0.1;
            // Stone walk: warm pavers with grout variation.
            float cobble = tsHash(floor(vUv * 260.0));
            vec3 stone = mix(vec3(0.62, 0.58, 0.52), vec3(0.72, 0.69, 0.63), cobble);
            stone *= 0.86 + 0.14 * smoothstep(0.2, 0.8, tsHash(floor(vUv * 130.0)));
            // Pond basin earth.
            vec3 basin = vec3(0.23, 0.2, 0.16);
            vec3 albedo = mix(meadow, stone, smoothstep(0.25, 0.75, mask.r));
            albedo = mix(albedo, basin, smoothstep(0.1, 0.7, mask.g));
            diffuseColor.rgb *= albedo / 0.36; // normalize against base color
          }`,
        );
    };
    return mat;
  }, []);

  // Warm the meadow slightly under low golden sun.
  useFrame(() => {
    const shader = material.userData.shader as ShaderLike | undefined;
    if (shader?.uniforms.uSunWarm) {
      const warmth = env.sunElevation > 0 && env.sunElevation < 25 ? 1 - env.sunElevation / 25 : 0;
      shader.uniforms.uSunWarm.value = warmth;
    }
  });

  return <mesh geometry={geometry} material={material} receiveShadow frustumCulled={false} />;
}
