import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Color, FogExp2 } from 'three';
import { useProgressiveStage } from '@/hooks/useProgressiveStage';
import { useSceneEnv } from '@/hooks/useSceneEnv';
import { beginStaging } from '@/loaders/progressiveLoader';
import { CameraRig } from '@/scenes/camera/CameraRig';
import { SetPieces } from '@/scenes/environment/SetPieces';
import { Terrain } from '@/scenes/environment/Terrain';
import { GrassField } from '@/scenes/grass/GrassField';
import { Lights } from '@/scenes/lighting/Lights';
import { Particles } from '@/scenes/particles/Particles';
import { PerfGovernor } from '@/scenes/PerfGovernor';
import { PostFx } from '@/scenes/PostFx';
import { SkyDome } from '@/scenes/sky/SkyDome';
import { Flora } from '@/scenes/trees/Flora';
import { Ponds } from '@/scenes/water/Ponds';

/**
 * The whole garden, assembled progressively:
 *   stage 1 — placeholder environment: sky, light, terrain (first frame)
 *   stage 2 — grass + flowers
 *   stage 3 — trees, water, set pieces
 *   stage 4 — particles + post-processing
 * Staging starts after the first rendered frame so the veil lifts onto a
 * live (if minimal) world, never a blank canvas.
 */
export function LandscapeScene(): React.JSX.Element {
  const { env } = useSceneEnv();
  const scene = useThree((state) => state.scene);
  const fog = useRef(new FogExp2(new Color('#e8c9a8'), 0.016));

  const flora = useProgressiveStage(2);
  const builds = useProgressiveStage(3);
  const life = useProgressiveStage(4);

  useEffect(() => {
    scene.fog = fog.current;
    beginStaging();
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useFrame(() => {
    fog.current.color.setRGB(env.fogColor.r, env.fogColor.g, env.fogColor.b);
    fog.current.density = env.fogDensity;
  });

  return (
    <>
      <CameraRig />
      <PerfGovernor />
      <Lights />
      <SkyDome />
      <Terrain />
      {flora && <GrassField />}
      {flora && <Flora />}
      {builds && <Ponds />}
      {builds && <SetPieces />}
      {life && <Particles />}
      {life && <PostFx />}
    </>
  );
}
