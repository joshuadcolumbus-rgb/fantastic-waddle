import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { EnvState, SceneBeat } from '@/types/scene';
import { BEAT_PRESETS } from '@/animations/presets';
import { sceneStore } from '@/stores/sceneStore';
import { hexToRgb } from '@/utils/math';

/**
 * THE single owner of scene state over scroll.
 *
 * One scrubbed timeline (duration = 1, positions = normalized scroll
 * progress) drives:
 *   - camera progress along the journey spline (cam.u)
 *   - lighting (sun position / color / intensity, exposure)
 *   - atmosphere (sky gradient, fog, clouds, stars)
 *   - particle weights (pollen ↔ fireflies ↔ butterflies)
 *   - shader uniforms fed from env (wind, water tint/glint, bloom)
 *
 * Sections never own scene ScrollTriggers — they register beats (via
 * data-scene-anchor) and this module lays tweens between consecutive beats.
 * Section-local DOM effects (text reveals, pins) live in their own
 * lightweight triggers and never touch `env`.
 */

let master: gsap.core.Timeline | null = null;
let trigger: ScrollTrigger | null = null;

const COLOR_KEYS = ['sunColor', 'skyZenith', 'skyHorizon', 'fogColor', 'waterColor'] as const;

function addBeatTweens(
  tl: gsap.core.Timeline,
  env: EnvState,
  beat: SceneBeat,
  position: number,
  duration: number,
): void {
  const preset = BEAT_PRESETS[beat.beat];
  if (!preset) return;

  const scalars: Record<string, number> = {};
  for (const [key, value] of Object.entries(preset.env)) {
    if (typeof value === 'number') scalars[key] = value;
  }

  const common = { duration: Math.max(duration, 0.0001), ease: 'none' } as const;
  if (Object.keys(scalars).length > 0) {
    tl.to(env, { ...scalars, ...common }, position);
  }
  for (const key of COLOR_KEYS) {
    const hex = preset.env[key];
    if (typeof hex === 'string') {
      tl.to(env[key], { ...hexToRgb(hex), ...common }, position);
    }
  }
}

/** (Re)build the master timeline from measured beats. Idempotent. */
export function buildMasterTimeline(beats: SceneBeat[]): void {
  destroyMasterTimeline();
  if (beats.length === 0) return;

  const { env, cam } = sceneStore.getState();
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

  const first = beats[0];
  if (first) {
    // Beat 0 defines the resting state — applied almost instantly at t=0.
    addBeatTweens(tl, env, first, 0, 0.0001);
    tl.set(cam, { u: 0 }, 0);
  }

  const lastIndex = Math.max(1, beats.length - 1);
  for (let i = 1; i < beats.length; i++) {
    const prev = beats[i - 1];
    const current = beats[i];
    if (!prev || !current) continue;
    const start = prev.progress;
    const duration = current.progress - prev.progress;
    addBeatTweens(tl, env, current, start, duration);
    // sine.inOut settles the camera at each chapter — the walk pauses where
    // the story pauses. Scrub smoothing keeps transitions continuous.
    tl.to(cam, { u: i / lastIndex, duration, ease: 'sine.inOut' }, start);
  }

  // Normalize to duration 1 so ScrollTrigger progress maps 1:1.
  tl.duration(1);

  trigger = ScrollTrigger.create({
    animation: tl,
    trigger: document.documentElement,
    start: 0,
    end: () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight),
    scrub: 0.9,
  });
  master = tl;
}

export function destroyMasterTimeline(): void {
  trigger?.kill();
  trigger = null;
  master?.kill();
  master = null;
}

export const getMasterTimeline = (): gsap.core.Timeline | null => master;
