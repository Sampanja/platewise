import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { IMPERIAL_UNITS, METRIC_UNITS } from '@/domain/units';
import { setActiveLanguage, setActiveUnits } from '@/i18n/locale';

import { widgetModel } from './model';
import { forToday, glassesSvg, mixHex, ringSvg, type WidgetColors, type WidgetSnapshot } from './snapshot';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const colors: WidgetColors = {
  bg: '#ffffff',
  surface: '#fafafa',
  track: '#eeeeee',
  text: '#111111',
  muted: '#555555',
  accent: '#cc3366',
  onAccent: '#ffffff',
  accentText: '#991144',
  accentSoft: '#f5dde6',
  second: '#338855',
  water: '#1f6a9e',
  waterSoft: '#e0eef8',
};

const base: WidgetSnapshot = {
  version: 2,
  date: '2026-11-17',
  language: 'fi',
  units: METRIC_UNITS,
  character: 'nuppu',
  themePreference: 'system',
  hideCalories: false,
  eatenKcal: 1240,
  goalKcal: 1900,
  macros: { proteinG: 62, carbsG: 150, fatG: 40 },
  macroGoals: { proteinG: 110, carbsG: 220, fatG: 63 },
  entryCount: 3,
  waterMl: 750,
  waterGoalMl: 1800,
  glassMl: 250,
  streak: 5,
  quests: { done: 2, total: 3 },
  dinnerPlanned: true,
  daysAway: 0,
  nextMeal: { date: '2026-11-17', recipeId: 'katsu-curry', title: 'Kanakatsu', imageUrl: null },
  colors: { light: colors, dark: colors },
};

const noon = new Date(2026, 10, 17, 12, 0);
const nbsp = (s: string) => s.replace(/[  ]/g, ' ');

describe('widget model', () => {
  afterEach(() => {
    setActiveLanguage('fi');
    setActiveUnits(METRIC_UNITS);
  });

  it('shows energy left, eaten with the goal, macros and water', () => {
    const m = widgetModel(base, noon);
    expect(nbsp(m.remaining.value)).toBe('660');
    expect(m.remaining.caption).toBe('kcal jäljellä');
    expect(nbsp(m.eaten.caption)).toBe('/ 1 900 kcal');
    expect(m.eaten.progress).toBeCloseTo(1240 / 1900, 5);
    expect(m.macros?.map((r) => r.value)).toEqual(['62 / 110 g', '150 / 220 g', '40 / 63 g']);
    expect(nbsp(m.water.value)).toBe('0,75 l / 1,8 l');
    expect(m.water).toMatchObject({ filled: 3, total: 8 });
    expect(m.streak).toBe('5 pv putki');
    expect(m.quests).toBe('Tehtävät 2/3');
    expect(m.next).toMatchObject({ kicker: 'Tänään päivälliseksi', title: 'Kanakatsu', recipeId: 'katsu-curry' });
  });

  it('never shows a negative amount left, and talks about the goal neutrally', () => {
    const m = widgetModel({ ...base, eatenKcal: 2100 }, noon);
    expect(m.remaining.caption).toBe('tavoite täynnä');
    expect(m.eaten.left).toBe('tavoite täynnä');
    expect(m.eaten.progress).toBe(1);
  });

  it('follows the user units and language', () => {
    setActiveLanguage('en');
    setActiveUnits({ ...IMPERIAL_UNITS, energy: 'kj' });
    const m = widgetModel(base, noon);
    expect(nbsp(m.remaining.value)).toBe('2,761');
    expect(m.remaining.caption).toBe('kJ left');
    expect(m.water.value).toBe('25 fl oz / 61 fl oz');
    expect(m.title).toBe('Today');
  });

  it('greets on an empty day and invites the first entry', () => {
    const empty = { ...base, eatenKcal: 0, entryCount: 0, macros: { proteinG: 0, carbsG: 0, fatG: 0 }, dinnerPlanned: false };
    const m = widgetModel(empty, new Date(2026, 10, 17, 8, 0));
    expect(m.empty).toBe(true);
    expect(m.mood).toBe('idle');
    expect(m.message).toMatch(/aamupala/i);
  });

  it('hides numbers with Piilota kalorit', () => {
    const m = widgetModel({ ...base, hideCalories: true }, noon);
    expect(m.macros).toBeNull();
    expect(m.remaining).toMatchObject({ value: '3', caption: 'kirjausta' });
  });

  it('works without a calorie goal or plan', () => {
    const m = widgetModel({ ...base, goalKcal: null, macroGoals: null, nextMeal: null, quests: null }, noon);
    expect(nbsp(m.remaining.value)).toBe('1 240');
    expect(m.remaining.caption).toBe('kcal syöty');
    expect(m.macros?.[0].value).toBe('62 g');
    expect(m.next).toMatchObject({ recipeId: null, kicker: 'Ei suunniteltua päivällistä' });
    expect(m.quests).toBeNull();
  });
});

describe('a new day', () => {
  it('starts today empty but keeps the streak and a future meal', () => {
    const next = forToday({ ...base, nextMeal: { ...base.nextMeal!, date: '2026-11-18' } }, '2026-11-18');
    expect(next).toMatchObject({ date: '2026-11-18', eatenKcal: 0, entryCount: 0, waterMl: 0, streak: 5, dinnerPlanned: true, daysAway: 1 });
    expect(next.quests).toEqual({ done: 0, total: 3 });
    expect(forToday(base, '2026-11-18').nextMeal).toBeNull();
    expect(forToday(base, base.date)).toBe(base);
  });
});

describe('drawing helpers', () => {
  it('mixes colours and draws valid SVG', () => {
    expect(mixHex('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(mixHex('#ffffff', '#cc3366', 0)).toBe('#ffffff');
    const ring = ringSvg(0.5, colors, '1 240', '/ 1 900 kcal');
    expect(ring.match(/<circle/g)).toHaveLength(2);
    expect(ringSvg(0, colors, '0', 'x').match(/<circle/g)).toHaveLength(1);
    expect(ring).toContain('stroke-linecap="round"');
    expect(glassesSvg(3, 8, colors).match(/<path/g)).toHaveLength(8);
    expect(glassesSvg(3, 40, colors).match(/<path/g)).toHaveLength(12);
  });
});
