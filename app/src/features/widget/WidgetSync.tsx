import { createElement, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { useShallow } from 'zustand/react/shallow';

import { RECIPES_BY_ID } from '@/data/catalog';
import { useGame } from '@/data/game';
import { useActivePlan, useGoalsFor, useHydrated, useUnits, useWaterGoal } from '@/data/hooks';
import { useDiaryStore } from '@/data/stores/diary';
import { useProfileStore } from '@/data/stores/profile';
import { useWaterStore } from '@/data/stores/water';
import { entriesOn, sumEntries } from '@/domain/diary';
import { upcomingDinners } from '@/domain/plan';
import { activeLanguage } from '@/i18n/locale';
import { parseLocalDate, today } from '@/lib/dates';
import { palettes, type Palette } from '@/theme';
import { DEFAULT_CHARACTER, isCharacterId } from '@/theme/characters';

import { mixHex, saveWidgetSnapshot, type HexColor, type WidgetColors, type WidgetSnapshot } from './snapshot';
import { PlatePalWidget, WIDGET_NAMES } from './widgets';

/** One update per burst of changes (typing amounts, quick taps). */
const SYNC_DELAY_MS = 800;
const DAY_MS = 86_400_000;

/** Typical sizes (dp) for the first draw before the launcher reports the real one. */
export const DEFAULT_SIZES: Record<string, { width: number; height: number }> = {
  [WIDGET_NAMES.small]: { width: 160, height: 160 },
  [WIDGET_NAMES.medium]: { width: 330, height: 180 },
  [WIDGET_NAMES.large]: { width: 330, height: 380 },
};

const hex = (value: string) => value as HexColor;

/** The palette as widget colours; translucent tokens are mixed onto the surface (widgets need solid hex). */
export function widgetColors(palette: Palette): WidgetColors {
  return {
    bg: hex(palette.bg),
    surface: hex(palette.surface),
    track: hex(palette.surfaceRaised),
    text: hex(palette.text),
    muted: hex(palette.textMuted),
    accent: hex(palette.accent),
    onAccent: hex(palette.textOnAccent),
    accentText: hex(palette.accentText),
    accentSoft: mixHex(palette.surface, palette.accent, 0.16),
    second: hex(palette.herb),
    water: hex(palette.water),
    waterSoft: mixHex(palette.surface, palette.water, 0.14),
  };
}

/** Draws every PlatePal widget on the home screen from a snapshot. Android only; errors are ignored. */
export async function drawWidgets(snapshot: WidgetSnapshot): Promise<void> {
  if (Platform.OS !== 'android') return;
  const now = new Date();
  await Promise.all(
    Object.values(WIDGET_NAMES).map((name) =>
      requestWidgetUpdate({
        widgetName: name,
        renderWidget: (info) => {
          const size = info?.width ? { width: info.width, height: info.height } : DEFAULT_SIZES[name];
          const draw = (colors: WidgetColors) => createElement(PlatePalWidget, { name, snapshot, colors, now, ...size });
          const light = draw(snapshot.colors.light);
          const dark = draw(snapshot.colors.dark);
          // A fixed light or dark app theme draws only that one; otherwise the widget follows the phone.
          return snapshot.themePreference === 'light' ? light : snapshot.themePreference === 'dark' ? dark : { light, dark };
        },
      }).catch(() => undefined),
    ),
  );
}

/** The widgets' snapshot of today, from the app's stores (also drawn as a preview in the widget guide). */
export function useWidgetSnapshot(): WidgetSnapshot {
  const date = today();
  const units = useUnits();
  const game = useGame();
  const goals = useGoalsFor(date);
  const waterGoal = useWaterGoal(date).totalMl;
  const waterMl = useWaterStore((s) => s.byDate[date] ?? 0);
  const glassMl = useWaterStore((s) => s.glassMl);
  const entries = useDiaryStore((s) => s.entries);
  const plan = useActivePlan();
  const profile = useProfileStore(
    useShallow((s) => ({
      hasCalorieGoal: s.hasCalorieGoal,
      hideCalories: s.hideCalories,
      characterId: s.characterId,
      themePreference: s.themePreference,
    })),
  );
  const language = activeLanguage();

  return useMemo<WidgetSnapshot>(() => {
    const dayEntries = entriesOn(entries, date);
    const totals = sumEntries(dayEntries);
    const character = isCharacterId(profile.characterId) ? profile.characterId : DEFAULT_CHARACTER;
    const lastDate = entries.reduce<string | null>((latest, e) => (latest === null || e.date > latest ? e.date : latest), null);
    const daysAway = lastDate === null ? null : Math.round((parseLocalDate(date).getTime() - parseLocalDate(lastDate).getTime()) / DAY_MS);
    const next = plan ? upcomingDinners(plan, date)[0] : undefined;
    const recipe = next ? RECIPES_BY_ID[next.recipeId] : undefined;
    return {
      version: 2,
      date,
      language,
      units,
      character,
      themePreference: profile.themePreference,
      hideCalories: profile.hideCalories,
      eatenKcal: totals.kcal,
      goalKcal: profile.hasCalorieGoal ? goals.kcal : null,
      macros: { proteinG: totals.proteinG, carbsG: totals.carbsG, fatG: totals.fatG },
      macroGoals: profile.hasCalorieGoal ? { proteinG: goals.proteinG, carbsG: goals.carbsG, fatG: goals.fatG } : null,
      entryCount: dayEntries.length,
      waterMl,
      waterGoalMl: waterGoal,
      glassMl,
      streak: game?.streak.current ?? 0,
      quests: game ? { done: game.quests.filter((q) => q.done).length, total: game.quests.length } : null,
      dinnerPlanned: next?.date === date,
      daysAway,
      nextMeal: next && recipe ? { date: next.date, recipeId: recipe.id, title: recipe.title, imageUrl: recipe.imageUrl } : null,
      colors: { light: widgetColors(palettes[character].light), dark: widgetColors(palettes[character].dark) },
    };
  }, [entries, date, language, units, profile, goals, waterMl, waterGoal, glassMl, game, plan]);
}

/**
 * Keeps the widgets in step with the app: after a diary entry, water, goals,
 * plan, character, theme, language or unit change (a moment later, one update
 * per burst), and once on start. A component of its own so its frequent
 * re-renders never touch the screens. A new day is handled by the widget
 * itself (the snapshot carries its date).
 */
export function WidgetSync() {
  const hydrated = useHydrated();
  const snapshot = useWidgetSnapshot();

  useEffect(() => {
    if (!hydrated || Platform.OS !== 'android') return;
    const timer = setTimeout(() => {
      void saveWidgetSnapshot(snapshot)
        .then(() => drawWidgets(snapshot))
        .catch(() => undefined);
    }, SYNC_DELAY_MS);
    return () => clearTimeout(timer);
  }, [hydrated, snapshot]);

  return null;
}
