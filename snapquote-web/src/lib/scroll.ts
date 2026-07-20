// Shared scroll state: written once per scroll tick by ScrollManager's
// ScrollTrigger, read in useFrame by every canvas component. Mutable object on
// purpose — no React state churn at 60fps.
export const scrollState = {
  /** Raw master ScrollTrigger progress, 0..1 over the whole page. */
  progress: 0,
  /** Frame-damped copy of progress; canvas animation reads this. */
  smooth: 0,
  /** Set once on mount from prefers-reduced-motion. */
  reducedMotion: false,
};

/** Master narrative beats, as fractions of total page scroll. */
export const PHASES = {
  dive: [0, 0.33],
  morph: [0.33, 0.66],
  fracture: [0.66, 1],
} as const;

/** Remap master progress into a 0..1 local phase progress. */
export function phase(p: number, [from, to]: readonly [number, number]) {
  return Math.min(1, Math.max(0, (p - from) / (to - from)));
}
