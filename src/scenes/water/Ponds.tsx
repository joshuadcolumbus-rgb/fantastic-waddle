import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, ShaderMaterial, Vector3 } from 'three';
import { useSceneEnv } from '@/hooks/useSceneEnv';
import { sunDirection } from '@/scenes/sky/SkyDome';
import { PONDS } from '@/scenes/environment/world';
import waterFrag from '@/shaders/water.frag.glsl';
import waterVert from '@/shaders/water.vert.glsl';

/**
 * Reflective garden ponds. The surface is an analytic-reflection shader
 * (fresnel-mixed sky gradient + sun/moon glint over drifting ripple
 * normals) — it reads as a true reflection at a fraction of the cost of a
 * planar reflection pass, which would re-render ~100k grass instances twice.
 */
export function Ponds(): React.JSX.Element {
  const { env } = useSceneEnv();

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: waterVert,
        fragmentShader: waterFrag,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uWaterColor: { value: new Color('#3f6f66') },
          uZenith: { value: new Color('#3a6ea5') },
          uHorizon: { value: new Color('#f7c98b') },
          uSunColor: { value: new Color('#ffd9a0') },
          uSunDir: { value: new Vector3(0, 0.5, -1) },
          uGlint: { value: 0.7 },
          uExposure: { value: 1 },
          uFogColor: { value: new Color('#e8c9a8') },
          uFogDensity: { value: 0.012 },
          uWind: { value: 0.5 },
        },
      }),
    [],
  );

  useFrame((state) => {
    const u = material.uniforms;
    u.uTime!.value = state.clock.elapsedTime;
    (u.uWaterColor!.value as Color).setRGB(env.waterColor.r, env.waterColor.g, env.waterColor.b);
    (u.uZenith!.value as Color).setRGB(env.skyZenith.r, env.skyZenith.g, env.skyZenith.b);
    (u.uHorizon!.value as Color).setRGB(env.skyHorizon.r, env.skyHorizon.g, env.skyHorizon.b);
    (u.uSunColor!.value as Color).setRGB(env.sunColor.r, env.sunColor.g, env.sunColor.b);
    sunDirection(u.uSunDir!.value as Vector3, Math.max(env.sunElevation, 2), env.sunAzimuth);
    u.uGlint!.value = env.waterGlint;
    u.uExposure!.value = env.exposure;
    (u.uFogColor!.value as Color).setRGB(env.fogColor.r, env.fogColor.g, env.fogColor.b);
    u.uFogDensity!.value = env.fogDensity;
    u.uWind!.value = env.wind;
  });

  return (
    <group>
      {PONDS.map((pond, index) => (
        <mesh
          key={index}
          material={material}
          position={[pond.x, -0.22, pond.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[pond.r, 48]} />
        </mesh>
      ))}
    </group>
  );
}
