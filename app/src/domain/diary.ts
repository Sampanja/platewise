import type { DiaryEntry, DiaryMeal, Macros } from '@/data/types';
import { addDays, type LocalDate } from '@/lib/dates';

import { addMacros, scaleMacros, ZERO_MACROS } from './recipes';

export const DIARY_MEALS: readonly DiaryMeal[] = ['breakfast', 'lunch', 'dinner', 'snack'];

/** Macros of one entry: per-100 g values × grams, or per-serving values × servings. */
export function entryMacros(entry: Pick<DiaryEntry, 'basis' | 'quantity'>): Macros {
  return entry.basis.kind === 'food'
    ? scaleMacros(entry.basis.per100g, entry.quantity / 100)
    : scaleMacros(entry.basis.perServing, entry.quantity);
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
