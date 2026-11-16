import { createElement, useEffect } from 'react';
import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';

import { useDiaryStore } from '@/data/stores/diary';
import { useProfileStore } from '@/data/stores/profile';
import { entriesOn, sumEntries } from '@/domain/diary';
import { strings } from '@/i18n';
import { today } from '@/lib/dates';
import { palettes, type Palette } from '@/theme';
import { DEFAULT_CHARACTER, isCharacterId } from '@/theme/characters';

import { forToday, saveWidgetSnapshot, type HexColor, type WidgetColors, type WidgetSnapshot } from './snapshot';
import { TodayWidget } from './TodayWidget';

const WIDGET_NAME = 'Today';
const SYNC_DELAY_MS = 800;

/** Palette values are hex strings; the widget needs them typed as such. */
const hex = (value: string) => value as HexColor;

function widgetColors(palette: Palette): WidgetColors {
  return {
    bg: hex(palette.bg),
    surface: hex(palette.surface),
    text: hex(palette.text),
    muted: hex(palette.textMuted),
    accent: hex(palette.accent),
    onAccent: hex(palette.textOnAccent),
    track: hex(palette.surfaceRaised),
  };
}

/** Today's numbers, labels in the active language and the character's colours. */
export function buildSnapshot(): WidgetSnapshot {
  const date = today();
  const profile = useProfileStore.getState();
  const dayEntries = entriesOn(useDiaryStore.getState().entries, date);
  const totals = sumEntries(dayEntries);
  const character = isCharacterId(profile.characterId) ? profile.characterId : DEFAULT_CHARACTER;
  const w = strings.widget;
  return {
    date,
    kcal: totals.kcal,
    goalKcal: profile.hasCalorieGoal ? profile.goals.kcal : null,
    proteinG: totals.proteinG,
    carbsG: totals.carbsG,
    fatG: totals.fatG,
    entryCount: dayEntries.length,
    hideCalories: profile.hideCalories,
    character,
    labels: {
      title: w.title,
      kcal: w.kcal,
      eaten: w.eaten,
      protein: w.protein,
      carbs: w.carbs,
      fat: w.fat,
      entries: w.entries,
      photo: w.photo,
      speak: w.speak,
    },
    colors: { light: widgetColors(palettes[character].light), dark: widgetColors(palettes[character].dark) },
  };
}

/** Saves the snapshot and redraws every PlatePal widget on the home screen. Android only; errors are ignored. */
export async function updateWidget(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    const snapshot = forToday(buildSnapshot(), today());
    await saveWidgetSnapshot(snapshot);
    // The theme setting decides the widget's look too: a fixed light or dark theme draws only that variant.
    const preference = useProfileStore.getState().themePreference;
    const light = createElement(TodayWidget, { snapshot, colors: snapshot.colors.light });
    const dark = createElement(TodayWidget, { snapshot, colors: snapshot.colors.dark });
    await requestWidgetUpdate({
      widgetName: WIDGET_NAME,
      renderWidget: () => (preference === 'light' ? light : preference === 'dark' ? dark : { light, dark }),
    });
  } catch {
    // No widget on the home screen, or the native module is missing (tests, iOS): nothing to update.
  }
}

/**
 * Keeps the widget in step with the app: after a diary entry, a goal,
 * character, theme or language change (a moment later, one update per burst),
 * and once on start.
 */
export function useWidgetSync(ready: boolean, language: string): void {
  useEffect(() => {
    if (!ready || Platform.OS !== 'android') return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void updateWidget(), SYNC_DELAY_MS);
    };
    schedule();
    const offDiary = useDiaryStore.subscribe((state, previous) => {
      if (state.entries !== previous.entries) schedule();
    });
    const offProfile = useProfileStore.subscribe((state, previous) => {
      if (
        state.goals !== previous.goals ||
        state.hasCalorieGoal !== previous.hasCalorieGoal ||
        state.hideCalories !== previous.hideCalories ||
        state.characterId !== previous.characterId ||
        state.themePreference !== previous.themePreference
      ) {
        schedule();
      }
    });
    return () => {
      clearTimeout(timer);
      offDiary();
      offProfile();
    };
  }, [ready, language]);
}
