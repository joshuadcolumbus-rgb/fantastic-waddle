import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BUDGETS, lowerTier } from '@/app/quality';
import { useSceneStore } from '@/stores/sceneStore';

/**
 * Runtime FPS governor. Static detection guesses the tier; this measures
 * reality. If the rolling average sits well under the tier's target for two
 * consecutive windows, the tier steps down (never up — no oscillation) and
 * every budgeted system rebuilds to the smaller counts.
 */
const WINDOW_SECONDS = 2.5;
const GRACE_SECONDS = 5; // ignore the load-in period
const TOLERANCE = 12; // fps below target before we react

export function PerfGovernor(): null {
  const frames = useRef(0);
  const elapsed = useRef(0);
  const runtime = useRef(0);
  const badWindows = useRef(0);
  const cooldown = useRef(0);

  useFrame((_, delta) => {
    runtime.current += delta;
    if (runtime.current < GRACE_SECONDS) return;
    if (cooldown.current > 0) {
      cooldown.current -= delta;
      return;
    }

    frames.current += 1;
    elapsed.current += delta;
    if (elapsed.current < WINDOW_SECONDS) return;

    const fps = frames.current / elapsed.current;
    frames.current = 0;
    elapsed.current = 0;

    const { tier, setTier, stage } = useSceneStore.getState();
    if (stage < 4) return; // wait until the full world is mounted

    if (fps < BUDGETS[tier].targetFps - TOLERANCE) {
      badWindows.current += 1;
      if (badWindows.current >= 2 && tier !== 'low') {
        setTier(lowerTier(tier));
        badWindows.current = 0;
        cooldown.current = 6; // let the rebuild settle before measuring again
      }
    } else {
      badWindows.current = 0;
    }
  });

  return null;
}
