import type { QualityBudget, QualityTier } from '@/types/scene';
import { gpuRendererString, isTouchPrimary } from '@/utils/device';

/**
 * Hard per-tier performance budgets. These are the contract the scene
 * components build against — see docs/performance.md before changing.
 *
 * Triangle budget context: grass blades are 3 tris, so 90k high-tier blades
 * ≈ 135k tris before trees/terrain — comfortably inside the 200k/100k/50k
 * visible-triangle envelope once distance culling removes off-screen chunks.
 */
export const BUDGETS: Record<QualityTier, QualityBudget> = {
  high: {
    grassInstances: 90_000,
    flowerInstances: 2_400,
    treeInstances: 110,
    particleBudget: 3_000,
    shadowMapSize: 2048,
    maxDpr: 2,
    postFx: 'full',
    antialias: true,
    targetFps: 60,
  },
  medium: {
    grassInstances: 42_000,
    flowerInstances: 1_200,
    treeInstances: 70,
    particleBudget: 1_200,
    shadowMapSize: 1024,
    maxDpr: 1.5,
    postFx: 'lite',
    antialias: true,
    targetFps: 55,
  },
  low: {
    grassInstances: 14_000,
    flowerInstances: 500,
    treeInstances: 40,
    particleBudget: 400,
    shadowMapSize: 512,
    maxDpr: 1.25,
    postFx: 'none',
    antialias: false,
    targetFps: 45,
  },
};

const WEAK_GPU = /(mali-[gt]?[0-7]\d\b|adreno \(tm\) [0-5]|adreno [0-5]|intel.*(hd|uhd) graphics ([0-5]\d\d)?$|swiftshader|llvmpipe|softpipe|apple gpu)/i;
const STRONG_GPU = /(rtx|radeon rx|geforce gtx 1[6-9]|geforce gtx [2-9]|apple m[1-9]|adreno \(tm\) [7-9]|mali-g7[8-9]|mali-g[8-9]|immortalis)/i;

/**
 * Initial tier from static signals; the FPS governor (PerfGovernor) can only
 * ever step the tier DOWN at runtime, so guessing slightly high is safe.
 */
export function detectQualityTier(): QualityTier {
  const dm = (navigator as { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 4;
  const gpu = gpuRendererString();
  const touch = isTouchPrimary();

  if (WEAK_GPU.test(gpu)) return 'low';
  if (dm !== undefined && dm <= 4) return touch ? 'low' : 'medium';

  if (!touch) {
    if (STRONG_GPU.test(gpu)) return 'high';
    if (cores >= 8) return 'high';
    return 'medium';
  }

  // Touch devices: modern flagships handle "medium" well; only strong,
  // explicitly recognized GPUs get "high".
  if (STRONG_GPU.test(gpu) && cores >= 6) return 'high';
  return cores >= 6 ? 'medium' : 'low';
}

export const lowerTier = (tier: QualityTier): QualityTier =>
  tier === 'high' ? 'medium' : 'low';
