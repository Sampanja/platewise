import type { CookedEntry, DiaryEntry, MealPlan, MicroKey, NutritionGoals } from '@/data/types';
import { MICRO_KEYS } from '@/data/types';
import { addDays, parseLocalDate, toLocalDate, type LocalDate } from '@/lib/dates';

import { entriesOn, sumEntries } from './diary';
import { movingAverage, type WeightEntry } from './energy';
import { savingsCents } from './plan';
import type { QualityGrade } from './qualityScore';

/**
 * Päiväkirja → Raportit: a week or a month described from what was logged.
 * Pure and unit tested (periodReport.test.ts). Averages use logged days only,
 * so an unlogged day never pulls anything down. Nothing here judges eating
 * less or more; the summary (services/insights.ts) talks about habits.
 */

export type PeriodKind = 'week' | 'month';

export type Period = { kind: PeriodKind; start: LocalDate; end: LocalDate; days: LocalDate[] };

/**
 * The period `offset` steps back from the one containing `now` (0 = this
 * week or month). Weeks start on `firstWeekday` (0 = Monday … 6 = Sunday).
 */
export function periodFor(kind: PeriodKind, offset: number, now: LocalDate, firstWeekday = 0): Period {
  if (kind === 'week') {
    const date = parseLocalDate(now);
    const mondayBased = (date.getDay() + 6) % 7;
    const back = (mondayBased - firstWeekday + 7) % 7;
    const start = addDays(now, -back - 7 * offset);
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    return { kind, start, end: days[6], days };
  }
  const base = parseLocalDate(now);
  const first = new Date(base.getFullYear(), base.getMonth() - offset, 1);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
  const start = toLocalDate(first);
  const days = Array.from({ length: last.getDate() }, (_, i) => addDays(start, i));
  return { kind, start, end: toLocalDate(last), days };
}

export type ReportDay = {
  date: LocalDate;
  logged: boolean;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  waterMl: number;
  grade: QualityGrade | null;
};

export type PeriodReportInput = {
  period: Period;
  /** Up to and including this day counts; later days of the period are in the future. */
  now: LocalDate;
  entries: readonly DiaryEntry[];
  goals: NutritionGoals | null;
  waterByDate: Readonly<Record<string, number>>;
  waterGoalMl: number;
  weights: readonly WeightEntry[];
  cooked: readonly CookedEntry[];
  plans: readonly Pick<MealPlan, 'acceptedAt' | 'budgetCents' | 'estimatedTotalCents'>[];
  /** The day's quality grade (features/quality/entryQuality.ts `dayQuality`). */
  gradeOf: (entries: readonly DiaryEntry[]) => QualityGrade | null;
};

export type PeriodReport = {
  period: Period;
  days: ReportDay[];
  /** Days of the period that have passed (incl. today). */
  elapsedDays: number;
  loggedDays: number;
  /** Longest run of consecutive logged days within the period. */
  longestStreak: number;
  avg: { kcal: number; proteinG: number; carbsG: number; fatG: number };
  goals: NutritionGoals | null;
  /** Average per logged day of each nutrient that was known. */
  nutrients: Partial<Record<MicroKey, number>>;
  grades: Record<QualityGrade, number>;
  water: { avgMl: number; goalDays: number; daysWithWater: number };
  weight: { points: WeightEntry[]; trend: WeightEntry[]; changeKg: number | null };
  cooked: { count: number; recipeIds: string[] };
  pantry: { itemsUsed: number; gramsUsed: number };
  savingsCents: number;
};

const avgOf = (values: number[]) => (values.length === 0 ? 0 : values.reduce((sum, v) => sum + v, 0) / values.length);

export function periodReport(input: PeriodReportInput): PeriodReport {
  const { period, now } = input;
  const inPeriod = (date: string) => date >= period.start && date <= period.end && date <= now;
  const days: ReportDay[] = period.days.map((date) => {
    // Days still to come count as not logged.
    const dayEntries = date <= now ? entriesOn(input.entries, date) : [];
    const totals = sumEntries(dayEntries);
    return {
      date,
      logged: dayEntries.length > 0,
      kcal: totals.kcal,
      proteinG: totals.proteinG,
      carbsG: totals.carbsG,
      fatG: totals.fatG,
      waterMl: input.waterByDate[date] ?? 0,
      grade: dayEntries.length > 0 ? input.gradeOf(dayEntries) : null,
    };
  });
  const logged = days.filter((d) => d.logged);

  let longestStreak = 0;
  let run = 0;
  for (const day of days) {
    run = day.logged ? run + 1 : 0;
    longestStreak = Math.max(longestStreak, run);
  }

  const nutrients: Partial<Record<MicroKey, number>> = {};
  const loggedTotals = logged.map((d) => sumEntries(entriesOn(input.entries, d.date)));
  for (const key of MICRO_KEYS) {
    const known = loggedTotals.map((t) => t[key]).filter((v): v is number => v !== undefined);
    if (known.length > 0) nutrients[key] = avgOf(known);
  }

  const grades: Record<QualityGrade, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  for (const day of logged) if (day.grade) grades[day.grade] += 1;

  const waterDays = days.filter((d) => d.waterMl > 0);
  const weightsInPeriod = input.weights.filter((w) => inPeriod(w.date));
  // The trend uses the week before too, so the first days of the period are averaged as well.
  const trend = movingAverage(input.weights.filter((w) => w.date >= addDays(period.start, -7) && w.date <= period.end)).filter((w) =>
    inPeriod(w.date),
  );
  const changeKg = trend.length >= 2 ? Math.round((trend[trend.length - 1].kg - trend[0].kg) * 10) / 10 : null;

  const cooked = input.cooked.filter((c) => inPeriod(c.date));
  const used = cooked.flatMap((c) => c.usedFromPantry);

  return {
    period,
    days,
    elapsedDays: period.days.filter((d) => d <= now).length,
    loggedDays: logged.length,
    longestStreak,
    avg: {
      kcal: avgOf(logged.map((d) => d.kcal)),
      proteinG: avgOf(logged.map((d) => d.proteinG)),
      carbsG: avgOf(logged.map((d) => d.carbsG)),
      fatG: avgOf(logged.map((d) => d.fatG)),
    },
    goals: input.goals,
    nutrients,
    grades,
    water: {
      avgMl: avgOf(waterDays.map((d) => d.waterMl)),
      goalDays: days.filter((d) => d.waterMl >= input.waterGoalMl).length,
      daysWithWater: waterDays.length,
    },
    weight: { points: weightsInPeriod, trend, changeKg },
    cooked: { count: cooked.length, recipeIds: [...new Set(cooked.map((c) => c.recipeId))] },
    pantry: {
      itemsUsed: new Set(used.map((u) => u.ingredientId)).size,
      gramsUsed: Math.round(used.reduce((sum, u) => sum + u.grams, 0)),
    },
    savingsCents: savingsCents(input.plans.filter((p) => p.acceptedAt && inPeriod(p.acceptedAt.slice(0, 10)))),
  };
}
