import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { DirectionalLight, HemisphereLight, Object3D, Vector3 } from 'three';
import { useQualityTier } from '@/hooks/useQualityTier';
import { useSceneEnv } from '@/hooks/useSceneEnv';
import { sunDirection } from '@/scenes/sky/SkyDome';

/**
 * One sun (or moon — same light, night presets recolor and dim it), one
 * hemisphere fill. The shadow frustum follows the camera down the garden
 * walk so a modest shadow map stays sharp for the visible pocket of world.
 */
export function Lights(): React.JSX.Element {
  const { env } = useSceneEnv();
  const { budget, tier } = useQualityTier();
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);

  const sunRef = useRef<DirectionalLight>(null);
  const hemiRef = useRef<HemisphereLight>(null);
  const target = useRef(new Object3D());
  const dir = useRef(new Vector3());
  const forward = useRef(new Vector3());

  useEffect(() => {
    const t = target.current;
    scene.add(t);
    return () => {
      scene.remove(t);
    };
  }, [scene]);

  useFrame(() => {
    const sun = sunRef.current;
    const hemi = hemiRef.current;
    if (!sun || !hemi) return;

    // Keep the shadow light a few degrees up even when the "sun" has set —
    // night presets already dim/recolor it into moonlight.
    const elevation = Math.max(env.sunElevation, 5);
    sunDirection(dir.current, elevation, env.sunAzimuth);

    camera.getWorldDirection(forward.current);
    const focus = target.current.position;
    focus.copy(camera.position).addScaledVector(forward.current, 9);
    focus.y = Math.max(0, focus.y - 2);
    target.current.updateMatrixWorld();

    sun.position.copy(focus).addScaledVector(dir.current, 46);
    sun.color.setRGB(env.sunColor.r, env.sunColor.g, env.sunColor.b);
    sun.intensity = env.sunIntensity * env.exposure * 2.1;

    hemi.color.setRGB(env.skyZenith.r, env.skyZenith.g, env.skyZenith.b);
    hemi.groundColor.setRGB(env.fogColor.r * 0.55, env.fogColor.g * 0.5, env.fogColor.b * 0.45);
    hemi.intensity = (0.55 + env.sunGlow * 0.15) * env.exposure;
  });

  const shadows = tier !== 'low';

  return (
    <>
      <hemisphereLight ref={hemiRef} intensity={0.6} />
      <directionalLight
        ref={sunRef}
        castShadow={shadows}
        intensity={2}
        target={target.current}
        shadow-mapSize-width={budget.shadowMapSize}
        shadow-mapSize-height={budget.shadowMapSize}
        shadow-camera-near={4}
        shadow-camera-far={110}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
    </>
  );
}
