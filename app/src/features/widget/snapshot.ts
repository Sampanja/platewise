import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_PREFIX } from '@/data/storage';
import { isUnitPrefs, METRIC_UNITS, type UnitPrefs } from '@/domain/units';
import { isLanguage, type Language } from '@/i18n/languages';
import { DEFAULT_CHARACTER, isCharacterId, type CharacterId } from '@/theme/characters';

/**
 * What the home screen widgets show, written by the app whenever the diary,
 * water, goals, plan, character, theme, language or units change. The
 * widgets' task handler can run headless (without the app's screens or
 * stores), so it reads only this: numbers, the language and units to format
 * them with, and the theme colours. Text is formatted when the widget is
 * drawn, so a new day or hour (greeting) shows correctly even while the app
 * is closed. Health data stays on the device (the widget is on the user's
 * own screen).
 */

/** Widget colours must be hex strings (the native renderer parses them). */
export type HexColor = `#${string}`;

export type WidgetColors = {
  bg: HexColor;
  surface: HexColor;
  /** Ring and bar tracks. */
  track: HexColor;
  text: HexColor;
  muted: HexColor;
  accent: HexColor;
  /** Text and icons on accent. */
  onAccent: HexColor;
  /** Accent text on surfaces (contrast-checked token). */
  accentText: HexColor;
  /** A soft accent wash for highlighted buttons. */
  accentSoft: HexColor;
  /** The character's second colour (protein bar, positive highlights). */
  second: HexColor;
  water: HexColor;
  waterSoft: HexColor;
};

export type WidgetSnapshot = {
  version: 2;
  /** The day the numbers are for; another day shows today as empty. */
  date: string;
  language: Language;
  units: UnitPrefs;
  character: CharacterId;
  /** The app's theme setting: a fixed light or dark theme draws only that one. */
  themePreference: 'light' | 'dark' | 'system';
  hideCalories: boolean;
  /** kcal; null without a calorie goal. */
  eatenKcal: number;
  goalKcal: number | null;
  macros: { proteinG: number; carbsG: number; fatG: number };
  macroGoals: { proteinG: number; carbsG: number; fatG: number } | null;
  entryCount: number;
  waterMl: number;
  waterGoalMl: number;
  glassMl: number;
  streak: number;
  /** Today's quests; null with gamification off. */
  quests: { done: number; total: number } | null;
  /** Inputs of the mascot's greeting (domain/mascotMood.ts), re-evaluated at draw time. */
  dinnerPlanned: boolean;
  daysAway: number | null;
  /** The next dinner from the accepted plan (today or later), in the snapshot's language. */
  nextMeal: { date: string; recipeId: string; title: string; imageUrl: string | null } | null;
  colors: { light: WidgetColors; dark: WidgetColors };
};

const KEY = `${STORAGE_PREFIX}widget`;

export async function saveWidgetSnapshot(snapshot: WidgetSnapshot): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(snapshot));
}

/** The saved snapshot, or null if there is none or it is from an older app version. */
export async function readWidgetSnapshot(): Promise<WidgetSnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WidgetSnapshot>;
    if (parsed.version !== 2) return null;
    return {
      ...(parsed as WidgetSnapshot),
      language: isLanguage(parsed.language) ? parsed.language : 'en',
      units: isUnitPrefs(parsed.units) ? parsed.units : METRIC_UNITS,
      character: isCharacterId(parsed.character) ? parsed.character : DEFAULT_CHARACTER,
      themePreference: parsed.themePreference === 'light' || parsed.themePreference === 'dark' ? parsed.themePreference : 'system',
    };
  } catch {
    return null;
  }
}

/**
 * A snapshot from an earlier day shows today as empty: nothing eaten or drunk
 * yet, quests not started. The streak and plan stay (they span days); a past
 * planned meal is dropped.
 */
export function forToday(snapshot: WidgetSnapshot, today: string): WidgetSnapshot {
  if (snapshot.date === today) return snapshot;
  const daysAway = snapshot.entryCount > 0 ? 1 : snapshot.daysAway === null ? null : snapshot.daysAway + 1;
  return {
    ...snapshot,
    date: today,
    eatenKcal: 0,
    macros: { proteinG: 0, carbsG: 0, fatG: 0 },
    entryCount: 0,
    waterMl: 0,
    quests: snapshot.quests ? { done: 0, total: snapshot.quests.total } : null,
    dinnerPlanned: snapshot.nextMeal?.date === today,
    daysAway,
    nextMeal: snapshot.nextMeal && snapshot.nextMeal.date >= today ? snapshot.nextMeal : null,
  };
}

// ── Drawing helpers ─────────────────────────────────────────────────────────

/** Mixes two hex colours: t = 0 gives a, t = 1 gives b. */
export function mixHex(a: string, b: string, t: number): HexColor {
  const parse = (hex: string) => {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  };
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const mix = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  return `#${mix(ar, br)}${mix(ag, bg)}${mix(ab, bb)}`;
}

function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * The progress ring as an SVG string (widgets draw SVG, not React Native
 * views): a track, the progress arc with round caps, a big number and a
 * caption. Drawn at 200 × 200 and scaled by the widget.
 */
export function ringSvg(
  progress: number,
  colors: Pick<WidgetColors, 'accent' | 'track' | 'text' | 'muted'>,
  value: string,
  caption: string,
  thickness = 18,
  /** Moves the number and caption down (e.g. to make room for the character inside the ring). */
  textShift = 0,
  captionSize = 20,
): string {
  const size = 200;
  const r = size / 2 - thickness / 2 - 2;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  const shown = Math.max(0, Math.min(1, progress));
  const arc =
    shown > 0
      ? `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${colors.accent}" stroke-width="${thickness}" stroke-linecap="round" stroke-dasharray="${(circumference * shown).toFixed(1)} ${circumference.toFixed(1)}" transform="rotate(-90 ${c} ${c})"/>`
      : '';
  // Long numbers (kJ) get a smaller font so they fit inside the ring.
  const fontSize = value.length > 5 ? 40 : value.length > 4 ? 46 : 54;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${colors.track}" stroke-width="${thickness}"/>`,
    arc,
    `<text x="${c}" y="${c + 8 + textShift}" text-anchor="middle" font-family="sans-serif" font-size="${fontSize}" font-weight="bold" fill="${colors.text}">${escapeXml(value)}</text>`,
    `<text x="${c}" y="${c + 40 + textShift}" text-anchor="middle" font-family="sans-serif" font-size="${captionSize}" fill="${colors.muted}">${escapeXml(caption)}</text>`,
    '</svg>',
  ].join('');
}

/** A row of water glasses as one SVG: filled ones in the water colour. */
export function glassesSvg(filled: number, total: number, colors: Pick<WidgetColors, 'water' | 'waterSoft'>): string {
  const count = Math.max(1, Math.min(12, total));
  const w = 26;
  const gap = 8;
  const width = count * w + (count - 1) * gap;
  const glasses = Array.from({ length: count }, (_, i) => {
    const x = i * (w + gap);
    const full = i < filled;
    return `<path d="M${x + 2} 4 L${x + w - 2} 4 L${x + w - 5} 34 Q${x + w - 5.5} 38 ${x + w - 9} 38 L${x + 9} 38 Q${x + 5.5} 38 ${x + 5} 34 Z" fill="${full ? colors.water : colors.waterSoft}" stroke="${colors.water}" stroke-opacity="${full ? 1 : 0.4}" stroke-width="2.5" stroke-linejoin="round"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="42" viewBox="0 0 ${width} 42">${glasses.join('')}</svg>`;
}
