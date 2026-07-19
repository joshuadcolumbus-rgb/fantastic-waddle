import type { SceneBeat } from '@/types/scene';
import { BEAT_PRESETS, FALLBACK_BEAT } from '@/animations/presets';

/** Global config emitted by layout/theme.liquid as a JSON script tag. */
export interface ThemeConfig {
  assetsBase: string;
  webglEnabled: boolean;
  particlesEnabled: boolean;
  intensity: number;
  brand: string;
}

const DEFAULTS: ThemeConfig = {
  assetsBase: '/',
  webglEnabled: true,
  particlesEnabled: true,
  intensity: 1,
  brand: 'Terra & Stone',
};

export function readThemeConfig(): ThemeConfig {
  const el = document.getElementById('ts-config');
  if (!el?.textContent) return DEFAULTS;
  try {
    return { ...DEFAULTS, ...(JSON.parse(el.textContent) as Partial<ThemeConfig>) };
  } catch {
    return DEFAULTS;
  }
}

/**
 * Measure every `[data-scene-anchor]` section and normalize its trigger
 * position against total scrollable height. Called at boot and again on
 * resize / Theme Editor section reorder.
 */
export function measureSceneBeats(): SceneBeat[] {
  const anchors = Array.from(document.querySelectorAll<HTMLElement>('[data-scene-anchor]'));
  const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

  const beats = anchors.map((element, index) => {
    const requested = element.dataset.beat ?? '';
    const beat = requested in BEAT_PRESETS ? requested : FALLBACK_BEAT;
    const rect = element.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    // A beat "lands" when the section's upper third reaches mid-viewport.
    const trigger = top + rect.height * 0.33 - window.innerHeight * 0.5;
    return {
      id: element.id || `beat-${index}`,
      beat,
      element,
      progress: Math.min(1, Math.max(0, trigger / scrollable)),
    };
  });

  // Progress must be strictly increasing for timeline construction.
  for (let i = 1; i < beats.length; i++) {
    const prev = beats[i - 1];
    const current = beats[i];
    if (prev && current && current.progress <= prev.progress) {
      current.progress = Math.min(1, prev.progress + 0.001);
    }
  }
  return beats;
}
