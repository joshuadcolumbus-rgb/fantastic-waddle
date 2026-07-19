import { BUDGETS } from '@/app/quality';
import { useSceneStore } from '@/stores/sceneStore';
import type { QualityBudget, QualityTier } from '@/types/scene';

/** Current tier + its hard budgets. Re-renders only when the tier changes. */
export function useQualityTier(): { tier: QualityTier; budget: QualityBudget } {
  const tier = useSceneStore((state) => state.tier);
  return { tier, budget: BUDGETS[tier] };
}
