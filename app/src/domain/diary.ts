import type { DiaryEntry, DiaryMeal, Macros, OwnRecipe, SavedMeal, SavedMealItem } from '@/data/types';
import { addDays, type LocalDate } from '@/lib/dates';

import { addMacros, scaleMacros, ZERO_MACROS } from './recipes';

export const DIARY_MEALS: readonly DiaryMeal[] = ['breakfast', 'lunch', 'dinner', 'snack'];

/** Macros of one entry: per-100 g values × grams, or per-serving values × servings. */
export function entryMacros(entry: Pick<DiaryEntry, 'basis' | 'quantity'>): Macros {
  switch (entry.basis.kind) {
    case 'food':
      return scaleMacros(entry.basis.per100g, entry.quantity / 100);
    case 'recipe':
      return scaleMacros(entry.basis.perServing, entry.quantity);
    case 'quick':
      return { kcal: entry.quantity, proteinG: 0, carbsG: 0, fatG: 0, ...entry.basis.macros };
  }
}

/** Copies a meal's entries to another day (and optionally another meal) as new entries. */
export function copyMealEntries(
  entries: readonly DiaryEntry[],
  from: { date: LocalDate; meal: DiaryMeal },
  to: { date: LocalDate; meal: DiaryMeal },
): Omit<DiaryEntry, 'id' | 'createdAt'>[] {
  return entries
    .filter((entry) => entry.date === from.date && entry.meal === from.meal)
    .map(({ name, basis, quantity, estimate }) => ({ name, basis, quantity, estimate, date: to.date, meal: to.meal }));
}

export function sumEntries(entries: readonly Pick<DiaryEntry, 'basis' | 'quantity'>[]): Macros {
  return entries.reduce((sum, entry) => addMacros(sum, entryMacros(entry)), ZERO_MACROS);
}

export function entriesOn(entries: readonly DiaryEntry[], date: LocalDate): DiaryEntry[] {
  return entries.filter((entry) => entry.date === date);
}

/** Calories for the seven days ending on `endDate`, oldest first. */
export function weekKcal(
  entries: readonly DiaryEntry[],
  endDate: LocalDate,
): { date: LocalDate; kcal: number }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(endDate, i - 6);
    return { date, kcal: sumEntries(entriesOn(entries, date)).kcal };
  });
}

/** Default meal for a new entry by time of day. */
export function mealForHour(hour: number): DiaryMeal {
  if (hour >= 5 && hour < 10) return 'breakfast';
  if (hour >= 10 && hour < 14) return 'lunch';
  if (hour >= 16 && hour < 21) return 'dinner';
  return 'snack';
}

export type NewEntry = Omit<DiaryEntry, 'id' | 'createdAt'>;

/** Copies a whole day's entries to another day, keeping each entry's meal. */
export function copyDayEntries(entries: readonly DiaryEntry[], from: LocalDate, to: LocalDate): NewEntry[] {
  return entries
    .filter((entry) => entry.date === from)
    .map(({ name, basis, quantity, estimate, meal }) => ({ name, basis, quantity, estimate, meal, date: to }));
}

/** A meal's entries as a reusable "oma ateria". Estimates become plain amounts once saved. */
export function savedMealItems(entries: readonly DiaryEntry[], date: LocalDate, meal: DiaryMeal): SavedMealItem[] {
  return entries
    .filter((entry) => entry.date === date && entry.meal === meal)
    .map(({ name, basis, quantity }) => ({ name, basis, quantity }));
}

export function savedMealEntries(saved: SavedMeal, date: LocalDate, meal: DiaryMeal): NewEntry[] {
  return saved.items.map(({ name, basis, quantity }) => ({ name, basis, quantity, date, meal, estimate: false }));
}

export function savedMealMacros(saved: Pick<SavedMeal, 'items'>): Macros {
  return sumEntries(saved.items);
}

/** Own recipe nutrients per serving: the ingredients' sum divided by the servings. */
export function ownRecipePerServing(recipe: Pick<OwnRecipe, 'ingredients' | 'servings'>): Macros {
  const total = recipe.ingredients.reduce(
    (sum, ingredient) => addMacros(sum, scaleMacros(ingredient.per100g, ingredient.grams / 100)),
    ZERO_MACROS,
  );
  return scaleMacros(total, 1 / Math.max(1, recipe.servings));
}

/** Diary basis id for an own recipe, kept apart from library recipe ids. */
export function ownRecipeId(id: string): string {
  return `own:${id}`;
}
