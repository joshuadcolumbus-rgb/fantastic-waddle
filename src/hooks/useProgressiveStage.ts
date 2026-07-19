import { useSceneStore } from '@/stores/sceneStore';

/** True once the progressive loader has reached the given stage. */
export function useProgressiveStage(stage: number): boolean {
  return useSceneStore((state) => state.stage >= stage);
}
