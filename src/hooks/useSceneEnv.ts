import { useSceneStore } from '@/stores/sceneStore';
import type { CamState, EnvState } from '@/types/scene';

/**
 * The mutable frame-state objects. Object identity is stable for the whole
 * session — read fields inside useFrame, never in render bodies.
 */
export function useSceneEnv(): { env: EnvState; cam: CamState; pointer: { x: number; y: number } } {
  const env = useSceneStore((state) => state.env);
  const cam = useSceneStore((state) => state.cam);
  const pointer = useSceneStore((state) => state.pointer);
  return { env, cam, pointer };
}
