import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { CamState, EnvState, QualityTier, SceneBeat, WebglStatus } from '@/types/scene';
import { hexToRgb } from '@/utils/math';

/**
 * Bridge between the DOM world (Liquid sections, GSAP master timeline) and
 * the R3F world. Two kinds of state live here:
 *
 *  - Reactive state (tier, status, stage, beats): changed rarely, read via
 *    selectors, drives React re-renders.
 *  - Frame state (`env`, `cam`): mutated by GSAP every scrolled frame and
 *    read inside useFrame. Deliberately NOT reactive — the object identity
 *    never changes, so scrolling causes zero React work.
 */

export const createInitialEnv = (): EnvState => ({
  sunElevation: 8,
  sunAzimuth: 115,
  sunIntensity: 1.35,
  sunColor: hexToRgb('#ffd9a0'),
  skyZenith: hexToRgb('#3a6ea5'),
  skyHorizon: hexToRgb('#f7c98b'),
  sunGlow: 0.85,
  starIntensity: 0,
  cloudDensity: 0.35,
  fogColor: hexToRgb('#e8c9a8'),
  fogDensity: 0.016,
  exposure: 1.0,
  wind: 0.55,
  pollen: 0.65,
  fireflies: 0,
  butterflies: 0.4,
  waterColor: hexToRgb('#3f6f66'),
  waterGlint: 0.7,
  bloom: 0.55,
});

interface SceneStore {
  /* ---- frame state (mutable, non-reactive) ---- */
  env: EnvState;
  cam: CamState;
  /** Pointer parallax (-1..1), written by bootstrap, read by the camera rig. */
  pointer: { x: number; y: number };

  /* ---- reactive state ---- */
  tier: QualityTier;
  webglStatus: WebglStatus;
  /** Progressive mount stage: 0 placeholder → 1 ground → 2 flora → 3 water/trees → 4 particles+post. */
  stage: number;
  beats: SceneBeat[];
  mobileCamera: boolean;
  /** Merchant/theme-editor toggles (from Liquid settings). */
  particlesEnabled: boolean;
  intensity: number;

  setTier: (tier: QualityTier) => void;
  setWebglStatus: (status: WebglStatus) => void;
  setStage: (stage: number) => void;
  setBeats: (beats: SceneBeat[]) => void;
  setMobileCamera: (mobile: boolean) => void;
  setExperienceSettings: (settings: { particlesEnabled: boolean; intensity: number }) => void;
}

export const useSceneStore = create<SceneStore>()(
  subscribeWithSelector((set) => ({
    env: createInitialEnv(),
    cam: { u: 0 },
    pointer: { x: 0, y: 0 },

    tier: 'medium',
    webglStatus: 'idle',
    stage: 0,
    beats: [],
    mobileCamera: false,
    particlesEnabled: true,
    intensity: 1,

    setTier: (tier) => set({ tier }),
    setWebglStatus: (webglStatus) => set({ webglStatus }),
    setStage: (stage) => set({ stage }),
    setBeats: (beats) => set({ beats }),
    setMobileCamera: (mobileCamera) => set({ mobileCamera }),
    setExperienceSettings: ({ particlesEnabled, intensity }) => set({ particlesEnabled, intensity }),
  })),
);

/** Direct (non-hook) accessors for the imperative GSAP side. */
export const sceneStore = useSceneStore;
