import { CatmullRomCurve3, Vector3 } from 'three';
import { clamp01, fbm2D, makeNoise2D } from '@/utils/math';

/**
 * The static garden world. Geometry is fixed (terrain can't morph when a
 * merchant reorders sections) — only the camera spline follows section
 * order. Everything here is deterministic so layouts are identical on
 * every load.
 */

export const WORLD = {
  minX: -80,
  maxX: 80,
  minZ: -170,
  maxZ: 30,
} as const;

export const WORLD_WIDTH = WORLD.maxX - WORLD.minX;
export const WORLD_DEPTH = WORLD.maxZ - WORLD.minZ;

/** Ground track of the stone path — the walk the whole journey follows. */
export const PATH_POINTS: Vector3[] = [
  new Vector3(0, 0, 14),
  new Vector3(0.6, 0, 2),
  new Vector3(-1.2, 0, -8),
  new Vector3(1.8, 0, -18),
  new Vector3(4.5, 0, -28),
  new Vector3(-2.0, 0, -40),
  new Vector3(1.2, 0, -52),
  new Vector3(-1.5, 0, -62),
  new Vector3(-2.5, 0, -72),
  new Vector3(0.2, 0, -84),
  new Vector3(1.2, 0, -96),
  new Vector3(-1.0, 0, -108),
  new Vector3(0.6, 0, -118),
  new Vector3(0, 0, -128),
  new Vector3(0, 0, -142),
];

export const groundPath = new CatmullRomCurve3(PATH_POINTS, false, 'catmullrom', 0.5);

export interface Pond {
  x: number;
  z: number;
  r: number;
}
export const PONDS: Pond[] = [
  { x: -8, z: -46, r: 6 },
  { x: 0, z: -136, r: 8.5 },
];

/** Set-piece anchors used by SetPieces + placement exclusion. */
export const PERGOLA = { x: 10, z: -36, rotation: -0.35 };
export const TERRACE = { x: -5, z: -78 };
export const HEDGES = { x: 2.5, z: -88 };

/* ------------------------------------------------------------------ */
/* Path / pond mask — rendered once to an offscreen canvas, sampled on  */
/* the CPU for placement + terrain shaping, uploaded as a texture for   */
/* the terrain albedo.                                                  */
/* ------------------------------------------------------------------ */

export const MASK_SIZE = 512;

export interface WorldMask {
  canvas: HTMLCanvasElement;
  /** path coverage 0..1 */
  path: (x: number, z: number) => number;
  /** pond coverage 0..1 */
  pond: (x: number, z: number) => number;
}

let maskSingleton: WorldMask | null = null;

const worldToMask = (x: number, z: number): [number, number] => [
  ((x - WORLD.minX) / WORLD_WIDTH) * MASK_SIZE,
  ((z - WORLD.minZ) / WORLD_DEPTH) * MASK_SIZE,
];

export function getWorldMask(): WorldMask {
  if (maskSingleton) return maskSingleton;

  const canvas = document.createElement('canvas');
  canvas.width = MASK_SIZE;
  canvas.height = MASK_SIZE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('2d context unavailable');

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, MASK_SIZE, MASK_SIZE);

  // Path → red channel, drawn as a soft-edged stroke along the spline.
  const points = groundPath.getPoints(400);
  const pxPerUnitX = MASK_SIZE / WORLD_WIDTH;
  for (const [width, alpha] of [
    [3.6, 0.45],
    [2.6, 0.75],
    [1.9, 1.0],
  ] as const) {
    ctx.strokeStyle = `rgba(255,0,0,${alpha})`;
    ctx.lineWidth = width * pxPerUnitX;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    points.forEach((p, i) => {
      const [mx, my] = worldToMask(p.x, p.z);
      if (i === 0) ctx.moveTo(mx, my);
      else ctx.lineTo(mx, my);
    });
    ctx.stroke();
  }

  // Ponds → green channel, soft radial fill.
  for (const pond of PONDS) {
    const [mx, my] = worldToMask(pond.x, pond.z);
    const radius = pond.r * pxPerUnitX;
    const gradient = ctx.createRadialGradient(mx, my, radius * 0.55, mx, my, radius * 1.15);
    gradient.addColorStop(0, 'rgba(0,255,0,1)');
    gradient.addColorStop(1, 'rgba(0,255,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(mx, my, radius * 1.15, 0, Math.PI * 2);
    ctx.fill();
  }

  const data = ctx.getImageData(0, 0, MASK_SIZE, MASK_SIZE).data;
  const sample = (x: number, z: number, channel: 0 | 1): number => {
    const [mx, my] = worldToMask(x, z);
    const ix = Math.round(clamp01(mx / MASK_SIZE) * (MASK_SIZE - 1));
    const iy = Math.round(clamp01(my / MASK_SIZE) * (MASK_SIZE - 1));
    return (data[(iy * MASK_SIZE + ix) * 4 + channel] ?? 0) / 255;
  };

  maskSingleton = {
    canvas,
    path: (x, z) => sample(x, z, 0),
    pond: (x, z) => sample(x, z, 1),
  };
  return maskSingleton;
}

/* ------------------------------------------------------------------ */
/* Terrain height                                                       */
/* ------------------------------------------------------------------ */

const terrainNoise = makeNoise2D(20260713);

/** Gentle rolling meadow, flattened along the path, dipped under ponds. */
export function terrainHeight(x: number, z: number, mask: WorldMask = getWorldMask()): number {
  let h = fbm2D(terrainNoise, x * 0.02, z * 0.02, 4) * 2.6;
  // The land rises softly away from the walk — a valley garden.
  const lateral = Math.min(1, Math.abs(x) / 60);
  h += lateral * lateral * 4.5;

  const path = mask.path(x, z);
  h *= 1 - path * 0.92;

  const pond = mask.pond(x, z);
  h -= pond * 1.4;
  return h;
}

/** Horizontal distance to the camera walk — used to keep tall flora clear. */
let pathSamples: Vector3[] | null = null;
export function distanceToPath(x: number, z: number): number {
  if (!pathSamples) pathSamples = groundPath.getPoints(220);
  let min = Infinity;
  for (const p of pathSamples) {
    const dx = p.x - x;
    const dz = p.z - z;
    const d = dx * dx + dz * dz;
    if (d < min) min = d;
  }
  return Math.sqrt(min);
}

/** True where flora may grow (off the path, out of the water, clear of builds). */
export function isPlantable(x: number, z: number, mask: WorldMask = getWorldMask()): boolean {
  if (x < WORLD.minX + 4 || x > WORLD.maxX - 4 || z < WORLD.minZ + 4 || z > WORLD.maxZ - 4) return false;
  if (mask.path(x, z) > 0.28) return false;
  if (mask.pond(x, z) > 0.12) return false;
  const dxP = x - PERGOLA.x;
  const dzP = z - PERGOLA.z;
  if (dxP * dxP + dzP * dzP < 28) return false;
  const dxT = x - TERRACE.x;
  const dzT = z - TERRACE.z;
  if (dxT * dxT + dzT * dzT < 24) return false;
  return true;
}
