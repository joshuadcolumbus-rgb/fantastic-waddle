import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide, ShaderMaterial, Vector3 } from 'three';
import { useSceneEnv } from '@/hooks/useSceneEnv';
import { degToRad } from '@/utils/math';
import skyFrag from '@/shaders/sky.frag.glsl';
import skyVert from '@/shaders/sky.vert.glsl';

/** Direction TO the sun/moon from elevation + azimuth (degrees). */
export function sunDirection(target: Vector3, elevation: number, azimuth: number): Vector3 {
  const el = degToRad(elevation);
  const az = degToRad(azimuth);
  return target.set(Math.cos(el) * Math.sin(az), Math.sin(el), -Math.cos(el) * Math.cos(az)).normalize();
}

/**
 * Procedural atmosphere dome: gradient sky, sun disc + glow, drifting fbm
 * clouds, twinkling stars — every uniform owned by the master timeline's
 * env state, so dawn → dusk → night is one continuous scrolled transition.
 */
export function SkyDome(): React.JSX.Element {
  const { env } = useSceneEnv();
  const sunDir = useRef(new Vector3());

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: skyVert,
        fragmentShader: skyFrag,
        side: BackSide,
        depthWrite: false,
        uniforms: {
          uZenith: { value: new Vector3(0.23, 0.43, 0.65) },
          uHorizon: { value: new Vector3(0.97, 0.79, 0.55) },
          uSunDir: { value: new Vector3(0, 0.3, -1) },
          uSunColor: { value: new Vector3(1, 0.85, 0.63) },
          uSunGlow: { value: 0.8 },
          uStarIntensity: { value: 0 },
          uCloudDensity: { value: 0.35 },
          uExposure: { value: 1 },
          uTime: { value: 0 },
        },
      }),
    [],
  );

  useFrame((state) => {
    const u = material.uniforms;
    u.uTime!.value = state.clock.elapsedTime;
    (u.uZenith!.value as Vector3).set(env.skyZenith.r, env.skyZenith.g, env.skyZenith.b);
    (u.uHorizon!.value as Vector3).set(env.skyHorizon.r, env.skyHorizon.g, env.skyHorizon.b);
    (u.uSunColor!.value as Vector3).set(env.sunColor.r, env.sunColor.g, env.sunColor.b);
    (u.uSunDir!.value as Vector3).copy(sunDirection(sunDir.current, env.sunElevation, env.sunAzimuth));
    u.uSunGlow!.value = env.sunGlow;
    u.uStarIntensity!.value = env.starIntensity;
    u.uCloudDensity!.value = env.cloudDensity;
    u.uExposure!.value = env.exposure;
  });

  return (
    <mesh material={material} frustumCulled={false} renderOrder={-10}>
      <sphereGeometry args={[320, 32, 20]} />
    </mesh>
  );
}
