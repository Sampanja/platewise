import type { DiaryEntry, DiaryMeal, Macros, NutritionGoals } from '@/data/types';
import { addDays, type LocalDate } from '@/lib/dates';

import { DIARY_MEALS, entriesOn, entryMacros, sumEntries } from './diary';

/**
 * Day and week reports for the diary. Neutral by design: they describe what
 * was logged, never judge it (no "over" colours, no streak of deficits).
 */

/** Finnish nutrition recommendations (2024) used as plain reference lines. */
export const REFERENCE = {
  /** Fibre, g/day: 25 (women) – 35 (men). */
  fiberMinG: 25,
  fiberMaxG: 35,
  /** Salt, at most g/day. */
  saltMaxG: 5,
} as const;

export type EnergySplit = { proteinPct: number; carbsPct: number; fatPct: number };

/** Share of energy from each macro (4 / 4 / 9 kcal per g). Zeros when nothing is logged. */
export function energySplit(m: Macros): EnergySplit {
  const protein = m.proteinG * 4;
  const carbs = m.carbsG * 4;
  const fat = m.fatG * 9;
  const total = protein + carbs + fat;
  if (total <= 0) return { proteinPct: 0, carbsPct: 0, fatPct: 0 };
  const proteinPct = Math.round((protein / total) * 100);
  const fatPct = Math.round((fat / total) * 100);
  return { proteinPct, fatPct, carbsPct: 100 - proteinPct - fatPct };
}

export type DayReport = {
  date: LocalDate;
  totals: Macros;
  split: EnergySplit;
  byMeal: Record<DiaryMeal, number>;
  entryCount: number;
  /** Entries without fibre / sugar / salt data (quick adds, some products, recipes). */
  entriesWithoutMicros: number;
};

export function dayReport(entries: readonly DiaryEntry[], date: LocalDate): DayReport {
  const day = entriesOn(entries, date);
  const totals = sumEntries(day);
  const byMeal = Object.fromEntries(
    DIARY_MEALS.map((meal) => [meal, sumEntries(day.filter((e) => e.meal === meal)).kcal]),
  ) as Record<DiaryMeal, number>;
  return {
    date,
    totals,
    split: energySplit(totals),
    byMeal,
    entryCount: day.length,
    entriesWithoutMicros: day.filter((e) => entryMacros(e).fiberG === undefined).length,
  };
}

export type WeekDay = { date: LocalDate; kcal: number; proteinG: number; logged: boolean; waterMl: number };

export type WeekReport = {
  days: WeekDay[];
  loggedDays: number;
  /** Averages over the days that have entries (an empty day is "not logged", not "ate nothing"). */
  avgKcal: number;
  avgProteinG: number;
  avgSplit: EnergySplit;
  /** Days that reached the protein goal (a habit, so it can be celebrated). */
  proteinGoalDays: number;
  /** Days within ±10 % of the calorie goal. */
  onTargetDays: number;
  avgWaterMl: number;
};

export function weekReport(
  entries: readonly DiaryEntry[],
  endDate: LocalDate,
  goals: NutritionGoals | null,
  waterByDate: Readonly<Record<string, number>> = {},
): WeekReport {
  const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(endDate, i - 6);
    const dayEntries = entriesOn(entries, date);
    const totals = sumEntries(dayEntries);
    return {
      date,
      kcal: totals.kcal,
      proteinG: totals.proteinG,
      logged: dayEntries.length > 0,
      waterMl: waterByDate[date] ?? 0,
    };
  });
  const logged = days.filter((d) => d.logged);
  const avg = (pick: (d: WeekDay) => number, list: WeekDay[]) =>
    list.length === 0 ? 0 : list.reduce((sum, d) => sum + pick(d), 0) / list.length;
  const loggedTotals = sumEntries(entries.filter((e) => logged.some((d) => d.date === e.date)));
  return {
    days,
    loggedDays: logged.length,
    avgKcal: avg((d) => d.kcal, logged),
    avgProteinG: avg((d) => d.proteinG, logged),
    avgSplit: energySplit(loggedTotals),
    proteinGoalDays: goals ? logged.filter((d) => d.proteinG >= goals.proteinG).length : 0,
    onTargetDays: goals
      ? logged.filter((d) => Math.abs(d.kcal - goals.kcal) <= goals.kcal * 0.1).length
      : 0,
    avgWaterMl: avg((d) => d.waterMl, days.filter((d) => d.waterMl > 0)),
  };
}
