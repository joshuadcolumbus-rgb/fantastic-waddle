import type { BeatPreset } from '@/types/scene';

/**
 * The scroll journey: one beat per chapter, walked from a dawn garden to a
 * still midnight pond. Each Liquid section binds to a beat by name via
 * `data-beat` (exposed as a Theme Editor select), and the master timeline
 * interpolates between consecutive beats in DOM order — so merchants can
 * reorder or remove chapters and the camera path + lighting rebuild
 * automatically.
 *
 * World layout: the garden runs along -Z (~140 m). Set pieces the beats
 * frame: pergola court at (10,-36), main pond at (-8,-46), turf lawn at
 * (0,-58), stone terrace at (-5,-78), reflection pond at (0,-136).
 *
 * Mobile spline: independent framing for tall/narrow viewports — pulled
 * back, recentered on the path, less lateral drift.
 */
export const BEAT_PRESETS: Record<string, BeatPreset> = {
  'dawn-garden': {
    env: {
      sunElevation: 8, sunAzimuth: 115, sunIntensity: 1.35, sunColor: '#ffd9a0',
      skyZenith: '#3a6ea5', skyHorizon: '#f7c98b', sunGlow: 0.85, starIntensity: 0,
      cloudDensity: 0.35, fogColor: '#e8c9a8', fogDensity: 0.016, exposure: 1.0,
      wind: 0.55, pollen: 0.65, fireflies: 0, butterflies: 0.4,
      waterColor: '#4a7a70', waterGlint: 0.7, bloom: 0.55,
    },
    cam: [0, 2.3, 9], look: [0.5, 1.6, -6],
    camMobile: [0, 2.6, 12], lookMobile: [0, 1.8, -6],
  },
  'morning-meadow': {
    env: {
      sunElevation: 21, sunAzimuth: 122, sunIntensity: 1.6, sunColor: '#fff1cf',
      skyZenith: '#3f7ab8', skyHorizon: '#cfe3ef', sunGlow: 0.55, cloudDensity: 0.4,
      fogColor: '#d8e2df', fogDensity: 0.011, exposure: 1.05, wind: 0.65,
      pollen: 0.8, butterflies: 0.8, waterColor: '#48796d', bloom: 0.4,
    },
    cam: [2.6, 2.1, -1.5], look: [-1.5, 1.4, -14],
    camMobile: [1.2, 2.4, 0.5], lookMobile: [-0.5, 1.6, -14],
  },
  'stone-path': {
    env: {
      sunElevation: 33, sunAzimuth: 132, sunIntensity: 1.75, sunColor: '#fff7e2',
      skyZenith: '#3e7fc0', skyHorizon: '#c4dcee', sunGlow: 0.42, cloudDensity: 0.45,
      fogColor: '#d5e0dc', fogDensity: 0.009, exposure: 1.08, wind: 0.6,
      pollen: 0.6, butterflies: 0.65, bloom: 0.35,
    },
    cam: [-2.7, 2.2, -11.5], look: [2, 1.1, -24],
    camMobile: [-1.2, 2.5, -9.5], lookMobile: [0.8, 1.3, -24],
  },
  'pergola-court': {
    env: {
      sunElevation: 46, sunAzimuth: 145, sunIntensity: 1.85, sunColor: '#fffbee',
      skyZenith: '#3b82c9', skyHorizon: '#bdd9ec', sunGlow: 0.38, cloudDensity: 0.5,
      fogColor: '#d2dfda', fogDensity: 0.008, exposure: 1.1, wind: 0.5,
      pollen: 0.5, butterflies: 0.5, bloom: 0.32,
    },
    cam: [3.6, 2.1, -22], look: [9.5, 1.8, -34.5],
    camMobile: [2.2, 2.4, -20], lookMobile: [8.5, 2.0, -35],
  },
  'water-garden': {
    env: {
      sunElevation: 58, sunAzimuth: 160, sunIntensity: 1.9, sunColor: '#ffffff',
      skyZenith: '#3a86d1', skyHorizon: '#b8d7ec', sunGlow: 0.35, cloudDensity: 0.42,
      fogColor: '#d0decf', fogDensity: 0.007, exposure: 1.12, wind: 0.45,
      pollen: 0.45, butterflies: 0.6, waterColor: '#3d7f8c', waterGlint: 1.0, bloom: 0.35,
    },
    cam: [-1.4, 2.5, -32], look: [-8.5, 0.9, -45],
    camMobile: [-2.5, 2.8, -30], lookMobile: [-8, 1.1, -45.5],
  },
  'emerald-lawn': {
    env: {
      sunElevation: 52, sunAzimuth: 178, sunIntensity: 1.85, sunColor: '#fffdf4',
      skyZenith: '#3a83c9', skyHorizon: '#bcd8e9', sunGlow: 0.36, cloudDensity: 0.38,
      fogColor: '#cfdccb', fogDensity: 0.0075, exposure: 1.1, wind: 0.55,
      pollen: 0.5, butterflies: 0.45, bloom: 0.33,
    },
    cam: [4.2, 2.7, -44], look: [0, 0.7, -57],
    camMobile: [2.6, 3.0, -42], lookMobile: [0.5, 0.9, -57],
  },
  'dusk-glow': {
    env: {
      sunElevation: 17, sunAzimuth: 226, sunIntensity: 1.5, sunColor: '#ffc37e',
      skyZenith: '#40679c', skyHorizon: '#f4b06b', sunGlow: 0.8, starIntensity: 0,
      cloudDensity: 0.4, fogColor: '#e3b48c', fogDensity: 0.011, exposure: 1.02,
      wind: 0.45, pollen: 0.25, fireflies: 0.15, butterflies: 0.25,
      waterColor: '#4c6f6b', bloom: 0.55,
    },
    cam: [-3.1, 2.3, -54], look: [1.5, 1.5, -66],
    camMobile: [-1.6, 2.6, -52], lookMobile: [0.8, 1.7, -66],
  },
  'stone-twilight': {
    env: {
      sunElevation: 7, sunAzimuth: 242, sunIntensity: 1.15, sunColor: '#ff9e63',
      skyZenith: '#35507f', skyHorizon: '#ef9560', sunGlow: 0.95, starIntensity: 0.06,
      cloudDensity: 0.35, fogColor: '#c99277', fogDensity: 0.013, exposure: 0.98,
      wind: 0.4, pollen: 0.1, fireflies: 0.35, butterflies: 0.1, bloom: 0.65,
    },
    cam: [2.2, 2.5, -64], look: [-4.5, 1.1, -77],
    camMobile: [1.0, 2.8, -62], lookMobile: [-4, 1.3, -77.5],
  },
  'estate-blue': {
    env: {
      sunElevation: -2, sunAzimuth: 256, sunIntensity: 0.55, sunColor: '#9fb6de',
      skyZenith: '#22375c', skyHorizon: '#7f8fc0', sunGlow: 0.5, starIntensity: 0.22,
      cloudDensity: 0.28, fogColor: '#5f6d95', fogDensity: 0.012, exposure: 0.94,
      wind: 0.35, pollen: 0, fireflies: 0.55, butterflies: 0,
      waterColor: '#2e4a5e', bloom: 0.75,
    },
    cam: [-4.2, 3.3, -74], look: [2, 1.9, -88],
    camMobile: [-2.4, 3.6, -72], lookMobile: [1.2, 2.1, -88],
  },
  'twilight-gallery': {
    env: {
      sunElevation: -6, sunAzimuth: 262, sunIntensity: 0.4, sunColor: '#8ea4d4',
      skyZenith: '#1a2a4a', skyHorizon: '#5b6a9e', sunGlow: 0.35, starIntensity: 0.42,
      cloudDensity: 0.22, fogColor: '#465379', fogDensity: 0.013, exposure: 0.9,
      wind: 0.3, fireflies: 0.7, bloom: 0.85,
    },
    cam: [0.2, 2.5, -84], look: [0, 1.7, -96],
    camMobile: [0, 2.8, -82], lookMobile: [0, 1.9, -96],
  },
  'firefly-night': {
    env: {
      sunElevation: -11, sunAzimuth: 268, sunIntensity: 0.3, sunColor: '#7d94c9',
      skyZenith: '#101d38', skyHorizon: '#3d4a78', sunGlow: 0.22, starIntensity: 0.68,
      cloudDensity: 0.16, fogColor: '#333f63', fogDensity: 0.014, exposure: 0.88,
      wind: 0.28, fireflies: 1.0, waterColor: '#22374a', bloom: 1.0,
    },
    cam: [3.2, 2.1, -94], look: [-2, 1.3, -106],
    camMobile: [1.6, 2.4, -92], lookMobile: [-1, 1.5, -106],
  },
  'moonlit-path': {
    env: {
      sunElevation: -14, sunAzimuth: 274, sunIntensity: 0.34, sunColor: '#8fa6d6',
      skyZenith: '#0d1930', skyHorizon: '#35426d', sunGlow: 0.18, starIntensity: 0.8,
      cloudDensity: 0.14, fogColor: '#2c3757', fogDensity: 0.014, exposure: 0.87,
      wind: 0.25, fireflies: 0.85, bloom: 0.95,
    },
    cam: [-3.2, 2.3, -104], look: [2, 1.5, -116],
    camMobile: [-1.6, 2.6, -102], lookMobile: [1, 1.7, -116],
  },
  'lantern-walk': {
    env: {
      sunElevation: -16, sunAzimuth: 280, sunIntensity: 0.3, sunColor: '#8fa6d6',
      skyZenith: '#0b1529', skyHorizon: '#2e3a61', sunGlow: 0.15, starIntensity: 0.9,
      cloudDensity: 0.12, fogColor: '#27314e', fogDensity: 0.015, exposure: 0.86,
      wind: 0.22, fireflies: 0.7, bloom: 0.9,
    },
    cam: [2.4, 2.5, -114], look: [0, 1.6, -126],
    camMobile: [1.2, 2.8, -112], lookMobile: [0, 1.8, -126],
  },
  'still-water': {
    env: {
      sunElevation: -18, sunAzimuth: 286, sunIntensity: 0.32, sunColor: '#93aade',
      skyZenith: '#0a1326', skyHorizon: '#2a3459', sunGlow: 0.14, starIntensity: 1.0,
      cloudDensity: 0.1, fogColor: '#232c47', fogDensity: 0.013, exposure: 0.88,
      wind: 0.15, pollen: 0, fireflies: 0.6, butterflies: 0,
      waterColor: '#1d3040', waterGlint: 0.85, bloom: 1.05,
    },
    cam: [0, 2.7, -124], look: [0, 0.9, -138],
    camMobile: [0, 3.0, -121], lookMobile: [0, 1.1, -138],
  },
};

/** Journey order used when a section doesn't specify a beat (fallback). */
export const DEFAULT_BEAT_ORDER = Object.keys(BEAT_PRESETS);

export const FALLBACK_BEAT = 'morning-meadow';
