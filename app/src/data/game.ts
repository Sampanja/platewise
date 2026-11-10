import { useMemo } from 'react';

import { computeGame, type GameState } from '@/domain/gamification';
import { today } from '@/lib/dates';

import { FOODS_BY_ID } from './catalog';
import { useCustomFoodsStore } from './stores/customFoods';
import { useDiaryStore } from './stores/diary';
import { useMyMealsStore } from './stores/myMeals';
import { usePlansStore } from './stores/plans';
import { useProfileStore } from './stores/profile';
import { useWaterGoalFor } from './hooks';
import { useWaterStore } from './stores/water';
import { useWeightStore } from './stores/weight';

/** Gamification state derived from the local repositories. Null when turned off. */
export function useGame(): GameState | null {
  const enabled = useProfileStore((s) => s.gamificationEnabled);
  const entries = useDiaryStore((s) => s.entries);
  const water = useWaterStore((s) => s.byDate);
  const waterGoalFor = useWaterGoalFor();
  const goals = useProfileStore((s) => s.goals);
  const hasGoal = useProfileStore((s) => s.hasCalorieGoal);
  const weights = useWeightStore((s) => s.entries);
  const plans = usePlansStore((s) => s.plans);
  const savedMeals = useMyMealsStore((s) => s.meals.length);
  const ownRecipes = useMyMealsStore((s) => s.recipes.length);
  const customFoods = useCustomFoodsStore((s) => s.foods);
  const day = today();

  return useMemo(() => {
    if (!enabled) return null;
    return computeGame({
      entries,
      waterByDate: water,
      waterGoalFor: (date: string) => waterGoalFor(date).totalMl,
      proteinGoalG: hasGoal ? goals.proteinG : null,
      weighInDates: weights.map((w) => w.date),
      categoryOf: (foodId) => FOODS_BY_ID[foodId]?.category ?? customFoods.find((f) => f.id === foodId)?.category,
      today: day,
      plans: plans.map((p) => ({ acceptedAt: p.acceptedAt, underBudget: p.estimatedTotalCents <= p.budgetCents })),
      savedMeals,
      ownRecipes,
      barcodeFoods: customFoods.filter((f) => f.source === 'barcode').length,
    });
  }, [enabled, entries, water, waterGoalFor, goals.proteinG, hasGoal, weights, plans, savedMeals, ownRecipes, customFoods, day]);
}
