import { useEffect, useMemo, useState } from 'react';


import { goalsForDate } from '@/domain/dailyGoals';
import { repairProposal } from '@/domain/generate';
import { manualWaterGoal, NO_EXTRAS, recommendedWaterGoal, type HydrationProfile, type WaterGoal } from '@/domain/hydration';
import { entriesOn, sumEntries } from '@/domain/diary';
import { lastDinnerDate, savingsCents } from '@/domain/plan';
import { isRecipeAllowed, recipeCostCents } from '@/domain/recipes';
import { buildShoppingList, type ListEntry, type ShoppingList } from '@/domain/shoppingList';
import { parseLocalDate, today, type LocalDate } from '@/lib/dates';

import { CHAINS_BY_CODE, INGREDIENTS_BY_ID, RECIPES, RECIPES_BY_ID } from './catalog';
import { useDiaryStore } from './stores/diary';
import { useFavoritesStore } from './stores/favorites';
import { usePlansStore, shoppingStateOf, STANDALONE_LIST, type ShoppingState } from './stores/plans';
import { useProfileStore } from './stores/profile';
import { useChatStore } from './stores/chat';
import { useCustomFoodsStore } from './stores/customFoods';
import { useGameStore } from './stores/game';
import { useMyMealsStore } from './stores/myMeals';
import { useRemindersStore } from './stores/reminders';
import { useWaterStore } from './stores/water';
import { useWeightStore } from './stores/weight';
import type { DayNutrition, MealPlan, NutritionGoals, Recipe, RecipeSource, StoreChain } from './types';

/**
 * Hooks that combine the local repositories with the catalog. Screens use
 * these instead of reaching into stores, so switching to Supabase changes
 * this layer, not the screens.
 */

export const PERSISTED = [
  useProfileStore,
  useFavoritesStore,
  usePlansStore,
  useDiaryStore,
  useWeightStore,
  useCustomFoodsStore,
  useMyMealsStore,
  useWaterStore,
  useRemindersStore,
  useGameStore,
  useChatStore,
] as const;

/** True once every persisted store has been read from device storage. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => PERSISTED.every((s) => s.persist.hasHydrated()));
  useEffect(() => {
    if (hydrated) return;
    const check = () => {
      if (PERSISTED.every((s) => s.persist.hasHydrated())) setHydrated(true);
    };
    const unsubscribers = PERSISTED.map((s) => s.persist.onFinishHydration(check));
    check();
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [hydrated]);
  return hydrated;
}

/** The profile's allergies, diets and pantry, as the plan generator and checks expect them. */
export function useUserRules() {
  const allergens = useProfileStore((s) => s.allergens);
  const diets = useProfileStore((s) => s.diets);
  const pantryList = useProfileStore((s) => s.pantry);
  return useMemo(
    () => ({ allergens, diets, pantry: new Set(pantryList) as ReadonlySet<string> }),
    [allergens, diets, pantryList],
  );
}

/**
 * The one strict allergy and diet gate as a predicate for screens: every list,
 * search, recommendation, swap alternative and chat suggestion goes through
 * it. Unsuitable recipes are never shown, counted or offered.
 */
export function useRecipeAllowed(): (recipe: RecipeSource) => boolean {
  const allergens = useProfileStore((s) => s.allergens);
  const diets = useProfileStore((s) => s.diets);
  return useMemo(() => {
    const rules = { allergens, diets };
    return (recipe: RecipeSource) => isRecipeAllowed(recipe, rules, INGREDIENTS_BY_ID);
  }, [allergens, diets]);
}

/**
 * Mounted once in the root layout: when allergies or diets change, a pending
 * proposal is repaired at once so no screen ever shows an unsuitable dinner
 * or "Vaihda" alternative from it.
 */
export function useKeepProposalSuitable(): void {
  const proposal = usePlansStore((s) => s.proposal);
  const rules = useUserRules();
  useEffect(() => {
    if (!proposal) return;
    const repaired = repairProposal(proposal, RECIPES, INGREDIENTS_BY_ID, rules);
    if (repaired !== proposal) usePlansStore.getState().setProposal(repaired);
  }, [proposal, rules]);
}

/** The person's data the water recommendation uses; the latest weigh-in wins over the calculator weight. */
function useHydrationProfile(): HydrationProfile {
  const body = useProfileStore((s) => s.body);
  const weighIns = useWeightStore((s) => s.entries);
  const latest = weighIns.length > 0 ? weighIns[weighIns.length - 1].kg : null;
  return useMemo(
    () => ({ weightKg: latest ?? body.weightKg, sex: body.sex, activity: body.activity, pregnancy: body.pregnancy }),
    [latest, body.weightKg, body.sex, body.activity, body.pregnancy],
  );
}

/** Goal for any date: automatic (personal) or manual, plus that day's exercise and heat. */
export function useWaterGoalFor(): (date: string) => WaterGoal {
  const profile = useHydrationProfile();
  const mode = useWaterStore((s) => s.goalMode);
  const manualMl = useWaterStore((s) => s.manualGoalMl);
  const extras = useWaterStore((s) => s.dayExtras);
  return useMemo(
    () => (date: string) => {
      const day = extras[date] ?? NO_EXTRAS;
      return mode === 'manual' ? manualWaterGoal(manualMl, day) : recommendedWaterGoal(profile, day);
    },
    [profile, mode, manualMl, extras],
  );
}

export function useWaterGoal(date: string): WaterGoal {
  const goalFor = useWaterGoalFor();
  return useMemo(() => goalFor(date), [goalFor, date]);
}

/** The recommendation without day extras, shown next to a manual goal. */
export function useRecommendedWaterGoal(): WaterGoal {
  const profile = useHydrationProfile();
  return useMemo(() => recommendedWaterGoal(profile), [profile]);
}

export function useChain(): StoreChain {
  const code = useProfileStore((s) => s.chainCode);
  return CHAINS_BY_CODE[code];
}

/** Price estimate per serving at the user's store, without their pantry staples. */
export function useServingPrice(): (recipe: Recipe, servings?: number) => number {
  const { pantry } = useUserRules();
  const chain = useChain();
  return useMemo(
    () => (recipe: Recipe, servings = 1) =>
      recipeCostCents(recipe, INGREDIENTS_BY_ID, pantry, chain.priceMultiplier, servings),
    [pantry, chain],
  );
}

/** The latest accepted plan that still has dinners today or later. */
export function activePlanOf(plans: readonly MealPlan[], now = today()): MealPlan | null {
  const current = plans
    .filter((plan) => plan.status === 'accepted' && lastDinnerDate(plan) >= now)
    .sort((a, b) => (a.acceptedAt ?? '').localeCompare(b.acceptedAt ?? ''));
  return current.at(-1) ?? null;
}

export function useActivePlan(): MealPlan | null {
  const plans = usePlansStore((s) => s.plans);
  return useMemo(() => activePlanOf(plans), [plans]);
}

/** "Säästöt": how far this month's accepted plans stayed under their budgets. */
export function useMonthSavingsCents(): number {
  const plans = usePlansStore((s) => s.plans);
  return useMemo(() => {
    const month = today().slice(0, 7);
    return savingsCents(plans.filter((plan) => plan.acceptedAt?.slice(0, 7) === month));
  }, [plans]);
}

export type CurrentShoppingList = {
  listId: string;
  plan: MealPlan | null;
  state: ShoppingState;
  list: ShoppingList;
  /** Number of extra recipes added with "Lisää ostoslistaan". */
  extraCount: number;
};

/** The active plan's shopping list (or the standalone list) with ticks and extras. */
export function useCurrentShoppingList(): CurrentShoppingList {
  const plan = useActivePlan();
  const shopping = usePlansStore((s) => s.shopping);
  const { pantry } = useUserRules();
  const listId = plan?.id ?? STANDALONE_LIST;
  const state = shoppingStateOf(shopping, listId);

  const list = useMemo(() => {
    const entries: ListEntry[] = [];
    if (plan) {
      for (const meal of plan.meals) {
        if (meal.slot === 'dinner' && RECIPES_BY_ID[meal.recipeId]) {
          entries.push({ recipe: RECIPES_BY_ID[meal.recipeId], servings: meal.servings });
        }
      }
    }
    for (const extra of state.extras) {
      if (RECIPES_BY_ID[extra.recipeId]) {
        entries.push({ recipe: RECIPES_BY_ID[extra.recipeId], servings: extra.servings });
      }
    }
    const multiplier = CHAINS_BY_CODE[plan?.chainCode ?? useProfileStore.getState().chainCode].priceMultiplier;
    return buildShoppingList(entries, INGREDIENTS_BY_ID, pantry, multiplier);
  }, [plan, state.extras, pantry]);

  return { listId, plan, state, list, extraCount: state.extras.length };
}


/** The day's goals: the profile's goals, adjusted for calorie cycling. */
export function useGoalsFor(date: LocalDate): NutritionGoals {
  const goals = useProfileStore((s) => s.goals);
  const cycling = useProfileStore((s) => s.weightGoal.cycling);
  const sex = useProfileStore((s) => s.body.sex);
  return useMemo(() => goalsForDate(goals, cycling, sex, parseLocalDate(date)), [goals, cycling, sex, date]);
}

/** Eaten macros for a day from the diary, against the day's goals. */
export function useDayNutrition(date: LocalDate): DayNutrition {
  const entries = useDiaryStore((s) => s.entries);
  const goals = useGoalsFor(date);
  return useMemo(
    () => ({ date, eaten: sumEntries(entriesOn(entries, date)), goals }),
    [entries, date, goals],
  );
}
