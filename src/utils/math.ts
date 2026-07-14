export const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));
export const clamp01 = (v: number): number => clamp(v, 0, 1);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Frame-rate independent exponential smoothing (Freya Holmér's damp). */
export const damp = (current: number, target: number, lambda: number, dt: number): number =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

export const degToRad = (deg: number): number => (deg * Math.PI) / 180;

/** Deterministic seeded PRNG — instancing layouts must be stable across loads. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 2D value noise (CPU) for terrain shaping — cheap and smooth enough. */
export function makeNoise2D(seed = 1): (x: number, y: number) => number {
  const rand = mulberry32(seed);
  const perm = new Uint8Array(512);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const pi = p[i] as number;
    p[i] = p[j] as number;
    p[j] = pi;
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255] as number;

  const grad = (hash: number, x: number, y: number): number => {
    switch (hash & 3) {
      case 0: return x + y;
      case 1: return -x + y;
      case 2: return x - y;
      default: return -x - y;
    }
  };
  const fade = (t: number): number => t * t * t * (t * (t * 6 - 15) + 10);

  return (x: number, y: number): number => {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);
    const aa = perm[(perm[xi] as number) + yi] as number;
    const ab = perm[(perm[xi] as number) + yi + 1] as number;
    const ba = perm[(perm[xi + 1] as number) + yi] as number;
    const bb = perm[(perm[xi + 1] as number) + yi + 1] as number;
    const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
    const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
    return lerp(x1, x2, v) * 0.7071;
  };
}

/** Fractional Brownian motion over a 2D noise function. */
export function fbm2D(noise: (x: number, y: number) => number, x: number, y: number, octaves = 4): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise(x * frequency, y * frequency);
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
}

/** Parse "#rrggbb" into 0–1 floats. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}
