/** Plain RGB triple (0–1 floats) — kept as an object so GSAP can tween each channel. */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * The single source of truth for everything the master timeline animates in
 * the WebGL world. GSAP mutates this object; the render loop reads it every
 * frame. It never passes through React state, so scroll never causes renders.
 */
export interface EnvState {
  /** Sun position in degrees. Negative elevation = below horizon (night). */
  sunElevation: number;
  sunAzimuth: number;
  sunIntensity: number;
  sunColor: RGB;
  /** Sky gradient + atmosphere. */
  skyZenith: RGB;
  skyHorizon: RGB;
  sunGlow: number;
  starIntensity: number;
  cloudDensity: number;
  fogColor: RGB;
  fogDensity: number;
  /** Renderer tone-mapping exposure. */
  exposure: number;
  /** Wind strength shared by grass / trees / flowers / particles. */
  wind: number;
  /** Particle system weights (0 = hidden). */
  pollen: number;
  fireflies: number;
  butterflies: number;
  /** Water surface. */
  waterColor: RGB;
  waterGlint: number;
  /** Post-processing. */
  bloom: number;
}

/** Camera state driven by the master timeline (u = position along spline). */
export interface CamState {
  u: number;
}

export type QualityTier = 'high' | 'medium' | 'low';

/** Hard per-tier budgets — see docs/performance.md. */
export interface QualityBudget {
  grassInstances: number;
  flowerInstances: number;
  treeInstances: number;
  particleBudget: number;
  shadowMapSize: number;
  maxDpr: number;
  postFx: 'full' | 'lite' | 'none';
  antialias: boolean;
  targetFps: number;
}

export interface Vec3Tuple {
  0: number;
  1: number;
  2: number;
  length: 3;
}

/** A named scene "beat" — one chapter of the scroll journey. */
export interface BeatPreset {
  /** Partial env target; unspecified fields carry over from the previous beat. */
  env: Partial<Omit<EnvState, 'sunColor' | 'skyZenith' | 'skyHorizon' | 'fogColor' | 'waterColor'>> & {
    sunColor?: string;
    skyZenith?: string;
    skyHorizon?: string;
    fogColor?: string;
    waterColor?: string;
  };
  /** Desktop camera position / look-at target. */
  cam: [number, number, number];
  look: [number, number, number];
  /** Mobile camera overrides (narrow viewports need their own framing). */
  camMobile?: [number, number, number];
  lookMobile?: [number, number, number];
}

export type WebglStatus = 'idle' | 'loading' | 'running' | 'failed' | 'disabled';

/** A measured scene anchor: a DOM section bound to a beat preset. */
export interface SceneBeat {
  id: string;
  beat: string;
  element: HTMLElement;
  /** Normalized page-scroll position of the anchor (0..1). */
  progress: number;
}
