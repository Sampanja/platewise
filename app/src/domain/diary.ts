import type { DiaryEntry, DiaryMeal, Macros } from '@/data/types';
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
      return { kcal: entry.quantity, proteinG: 0, carbsG: 0, fatG: 0 };
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
