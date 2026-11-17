import { mascotGreeting, type MoodState } from '@/domain/mascotMood';
import { format, strings } from '@/i18n';
import { activeCharacterVoices } from '@/i18n/registry';
import {
  energyUnitLabel,
  formatEnergyBare,
  formatNutrientGrams,
  formatWater,
} from '@/lib/amounts';
import { diaryDayLabel } from '@/lib/dates';

import type { WidgetSnapshot } from './snapshot';

export type MacroRow = {
  key: 'proteinG' | 'carbsG' | 'fatG';
  label: string;
  /** "62 / 110 g" (or "62 g" without a goal). */
  value: string;
  /** "62 g" for narrow columns; the bar shows the goal. */
  short: string;
  progress: number;
};

/** Everything a widget layout draws, as text and fractions. */
export type WidgetModel = {
  title: string;
  /** Small widget: energy left (or eaten without a goal). */
  remaining: { value: string; caption: string; progress: number };
  /** Medium and large: energy eaten with the goal, and what is left. */
  eaten: { value: string; caption: string; progress: number; left: string | null };
  macros: MacroRow[] | null;
  water: { label: string; value: string; filled: number; total: number; addLabel: string };
  streak: string;
  quests: string | null;
  mood: MoodState;
  message: string;
  empty: boolean;
  emptyHint: string;
  next: { kicker: string; title: string; imageUrl: string | null; recipeId: string } | { kicker: string; title: string; imageUrl: null; recipeId: null };
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

/**
 * The widget's content from a snapshot, in the active language and units
 * (the caller sets them from the snapshot). The greeting is re-evaluated for
 * the current hour, so the widget greets right even while the app is closed.
 * Like the app, it talks about habits only.
 */
export function widgetModel(snapshot: WidgetSnapshot, now: Date): WidgetModel {
  const w = strings.widget;
  const unit = energyUnitLabel();
  const { eatenKcal, goalKcal } = snapshot;
  const hasGoal = goalKcal !== null && goalKcal > 0;
  const progress = hasGoal ? clamp01(eatenKcal / goalKcal) : 0;
  const entriesWord = snapshot.entryCount === 1 ? w.entriesWordOne : w.entriesWord;

  let remaining: WidgetModel['remaining'];
  let eaten: WidgetModel['eaten'];
  if (snapshot.hideCalories) {
    remaining = { value: String(snapshot.entryCount), caption: entriesWord, progress: 0 };
    eaten = { value: String(snapshot.entryCount), caption: entriesWord, progress: 0, left: null };
  } else if (hasGoal) {
    const left = goalKcal - eatenKcal;
    remaining =
      left > 0
        ? { value: formatEnergyBare(left), caption: `${unit} ${w.left}`, progress }
        : { value: formatEnergyBare(eatenKcal), caption: w.goalReached, progress: 1 };
    eaten = {
      value: formatEnergyBare(eatenKcal),
      caption: format(w.ofGoal, { goal: `${formatEnergyBare(goalKcal)} ${unit}` }),
      progress,
      left: left > 0 ? `${formatEnergyBare(left)} ${unit} ${w.left}` : w.goalReached,
    };
  } else {
    remaining = { value: formatEnergyBare(eatenKcal), caption: `${unit} ${w.eaten}`, progress: 0 };
    eaten = { value: formatEnergyBare(eatenKcal), caption: `${unit} ${w.eaten}`, progress: 0, left: null };
  }

  const macros: MacroRow[] | null = snapshot.hideCalories
    ? null
    : (['proteinG', 'carbsG', 'fatG'] as const).map((key) => {
        const value = snapshot.macros[key];
        const goal = snapshot.macroGoals?.[key];
        const label = key === 'proteinG' ? w.protein : key === 'carbsG' ? w.carbs : w.fat;
        return goal
          ? {
              key,
              label,
              value: format(w.macroValue, { value: Math.round(value), goal: formatNutrientGrams(goal) }),
              short: formatNutrientGrams(value),
              progress: clamp01(value / goal),
            }
          : { key, label, value: formatNutrientGrams(value), short: formatNutrientGrams(value), progress: 0 };
      });

  const glass = Math.max(50, snapshot.glassMl);
  const water = {
    label: w.water,
    value: format(w.waterValue, { value: formatWater(snapshot.waterMl), goal: formatWater(snapshot.waterGoalMl) }),
    filled: Math.min(12, Math.floor(snapshot.waterMl / glass)),
    total: Math.min(12, Math.max(1, Math.ceil(snapshot.waterGoalMl / glass))),
    addLabel: w.waterAdd,
  };

  const greeting = mascotGreeting({
    hour: now.getHours(),
    loggedToday: snapshot.entryCount,
    streak: snapshot.streak,
    waterGoalReached: snapshot.waterMl >= snapshot.waterGoalMl,
    dinnerPlanned: snapshot.dinnerPlanned,
    daysAway: snapshot.daysAway,
  });
  const voice = activeCharacterVoices()[snapshot.character];

  const next = snapshot.nextMeal
    ? {
        kicker: snapshot.nextMeal.date === snapshot.date ? w.nextToday : format(w.nextOn, { day: diaryDayLabel(snapshot.nextMeal.date, snapshot.date) }),
        title: snapshot.nextMeal.title,
        imageUrl: snapshot.nextMeal.imageUrl,
        recipeId: snapshot.nextMeal.recipeId,
      }
    : { kicker: w.noPlan, title: w.noPlanHint, imageUrl: null, recipeId: null };

  return {
    title: w.title,
    remaining,
    eaten,
    macros,
    water,
    streak: snapshot.streak > 0 ? format(w.streak, { count: snapshot.streak }) : w.streakNone,
    quests: snapshot.quests ? format(w.quests, snapshot.quests) : null,
    mood: greeting.state,
    message: voice.greetings[greeting.key],
    empty: snapshot.entryCount === 0,
    emptyHint: w.emptyHint,
    next,
  };
}
