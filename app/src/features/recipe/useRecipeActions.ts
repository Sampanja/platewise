import { router } from 'expo-router';
import { useMemo } from 'react';

import { haptics } from '@/components/ui';
import { INGREDIENTS_BY_ID, RECIPES_BY_ID } from '@/data/catalog';
import { useActivePlan, useCurrentShoppingList, useUserRules } from '@/data/hooks';
import { useDiaryStore } from '@/data/stores/diary';
import { usePlansStore } from '@/data/stores/plans';
import type { DiaryMeal, Recipe } from '@/data/types';
import { replacePlanDinner } from '@/domain/generate';
import { mealDate } from '@/domain/plan';
import { format, strings } from '@/i18n';
import { relativeDayLabel, today } from '@/lib/dates';
import { showToast } from '@/lib/toast';

export type PlanDayOption = {
  dayOffset: number;
  dayLabel: string;
  currentTitle: string;
};

/** The three actions of the recipe page: diary, plan and shopping list. */
export function useRecipeActions(recipe: Recipe | undefined) {
  const plan = useActivePlan();
  const { pantry } = useUserRules();
  const shopping = useCurrentShoppingList();
  const addEntry = useDiaryStore((s) => s.add);
  const removeEntry = useDiaryStore((s) => s.remove);
  const savePlan = usePlansStore((s) => s.savePlan);
  const pinRecipe = usePlansStore((s) => s.pinRecipe);
  const addExtra = usePlansStore((s) => s.addExtra);

  /** Dinners from today on that the recipe could replace. */
  const planDays = useMemo<PlanDayOption[]>(() => {
    if (!plan) return [];
    const now = today();
    return plan.meals
      .filter((meal) => meal.slot === 'dinner' && mealDate(plan, meal) >= now)
      .sort((a, b) => a.dayOffset - b.dayOffset)
      .map((meal) => ({
        dayOffset: meal.dayOffset,
        dayLabel: relativeDayLabel(mealDate(plan, meal)),
        currentTitle: RECIPES_BY_ID[meal.recipeId]?.title ?? '',
      }));
  }, [plan]);

  const addToDiary = (meal: DiaryMeal, servings = 1) => {
    if (!recipe) return;
    const entry = addEntry({
      date: today(),
      meal,
      name: recipe.title,
      basis: { kind: 'recipe', recipeId: recipe.id, perServing: recipe.perServing },
      quantity: servings,
      estimate: false,
    });
    haptics.success();
    showToast(
      format(strings.recipe.addedToDiaryToast, { title: recipe.title, meal: strings.diaryMeals[meal] }),
      { label: strings.common.undo, onPress: () => removeEntry(entry.id) },
    );
  };

  const replaceInPlan = (dayOffset: number) => {
    if (!recipe || !plan) return;
    savePlan(replacePlanDinner(plan, dayOffset, recipe.id, RECIPES_BY_ID, INGREDIENTS_BY_ID, pantry));
    const day = planDays.find((d) => d.dayOffset === dayOffset)?.dayLabel ?? '';
    haptics.success();
    showToast(format(strings.recipe.replacedToast, { day, title: recipe.title }));
  };

  const pinForNextPlan = (startNow: boolean) => {
    if (!recipe) return;
    pinRecipe(recipe.id);
    haptics.success();
    if (startNow) {
      router.push('/questionnaire');
    } else {
      showToast(strings.recipe.pinnedToast);
    }
  };

  const addToShoppingList = (servings: number) => {
    if (!recipe) return;
    addExtra(shopping.listId, recipe.id, servings);
    haptics.success();
    showToast(strings.recipe.addedToListToast, {
      label: strings.shopping.title,
      onPress: () => router.push('/shopping-list'),
    });
  };

  return { hasPlan: plan !== null, planDays, addToDiary, replaceInPlan, pinForNextPlan, addToShoppingList };
}
