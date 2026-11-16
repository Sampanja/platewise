import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_PREFIX } from '@/data/storage';
import type { CharacterId } from '@/theme/characters';

/**
 * What the home screen widget shows, written by the app whenever the diary,
 * goals, character or language change. The widget's task handler can run
 * headless (without the app's screens or stores), so it reads only this:
 * numbers, ready-made labels in the app's language and the theme colours.
 * Health data stays on the device (the widget is on the user's own screen).
 */
/** Widget colours must be hex strings (the native renderer parses them). */
export type HexColor = `#${string}`;

export type WidgetColors = {
  bg: HexColor;
  surface: HexColor;
  text: HexColor;
  muted: HexColor;
  accent: HexColor;
  onAccent: HexColor;
  track: HexColor;
};

export type WidgetSnapshot = {
  /** The day the numbers are for; another day shows zeros. */
  date: string;
  kcal: number;
  goalKcal: number | null;
  proteinG: number;
  carbsG: number;
  fatG: number;
  entryCount: number;
  hideCalories: boolean;
  character: CharacterId;
  labels: {
    title: string;
    kcal: string;
    eaten: string;
    protein: string;
    carbs: string;
    fat: string;
    entries: string;
    photo: string;
    speak: string;
  };
  colors: { light: WidgetColors; dark: WidgetColors };
};

const KEY = `${STORAGE_PREFIX}widget`;

export async function saveWidgetSnapshot(snapshot: WidgetSnapshot): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(snapshot));
}

export async function readWidgetSnapshot(): Promise<WidgetSnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WidgetSnapshot) : null;
  } catch {
    return null;
  }
}

/** A snapshot from an earlier day shows today as empty. */
export function forToday(snapshot: WidgetSnapshot, today: string): WidgetSnapshot {
  return snapshot.date === today ? snapshot : { ...snapshot, date: today, kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, entryCount: 0 };
}

function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** The progress ring as an SVG string (the widget renders SVG, not React Native views). */
export function ringSvg(progress: number, colors: WidgetColors, value: string, caption: string): string {
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const shown = Math.max(0, Math.min(1, progress));
  const arc =
    shown > 0
      ? `<circle cx="50" cy="50" r="${r}" fill="none" stroke="${colors.accent}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${(circumference * shown).toFixed(1)} ${circumference.toFixed(1)}" transform="rotate(-90 50 50)"/>`
      : '';
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">',
    `<circle cx="50" cy="50" r="${r}" fill="none" stroke="${colors.track}" stroke-width="10"/>`,
    arc,
    `<text x="50" y="53" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="bold" fill="${colors.text}">${escapeXml(value)}</text>`,
    `<text x="50" y="70" text-anchor="middle" font-family="sans-serif" font-size="10" fill="${colors.muted}">${escapeXml(caption)}</text>`,
    '</svg>',
  ].join('');
}
