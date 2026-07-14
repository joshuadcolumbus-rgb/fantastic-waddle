import { DefaultLoadingManager } from 'three';
import { sceneStore } from '@/stores/sceneStore';

/**
 * Progressive world assembly. The placeholder environment (sky + terrain)
 * renders on the very first frame; heavier layers mount in stages during
 * idle time so the main thread never stalls:
 *
 *   stage 1 — sky, lighting, terrain (placeholder environment; veil lifts)
 *   stage 2 — grass + flowers (hero comes alive)
 *   stage 3 — trees, water, set pieces
 *   stage 4 — particles + post-processing
 *
 * Any external assets (models/textures added later) route through
 * DefaultLoadingManager; a stage only advances once in-flight loads settle.
 */
const STAGE_MAX = 4;
let pendingLoads = 0;
let started = false;

DefaultLoadingManager.onStart = () => {
  pendingLoads += 1;
};
DefaultLoadingManager.onLoad = () => {
  pendingLoads = 0;
};
DefaultLoadingManager.onError = () => {
  pendingLoads = Math.max(0, pendingLoads - 1);
};

const idle = (callback: () => void, timeout = 350): void => {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(() => callback(), { timeout });
  } else {
    window.setTimeout(callback, 120);
  }
};

/** Called by the scene after its first rendered frame. */
export function beginStaging(): void {
  if (started) return;
  started = true;

  const advance = (): void => {
    const { stage, setStage } = sceneStore.getState();
    if (stage >= STAGE_MAX) return;
    if (pendingLoads > 0) {
      window.setTimeout(advance, 180);
      return;
    }
    setStage(stage + 1);
    if (stage + 1 < STAGE_MAX) idle(advance);
  };

  sceneStore.getState().setStage(1);
  idle(advance);
}
