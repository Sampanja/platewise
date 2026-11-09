import { CHARACTER_THEMES, type CharacterId } from './characters';

export type ThemeName = 'light' | 'dark';

export type Palette = {
  /** App background. */
  bg: string;
  /** Cards, sheets. */
  surface: string;
  /** Raised elements on top of a surface (chips, inputs). */
  surfaceRaised: string;
  /** Hairlines and dividers. */
  border: string;

  /** Primary text. */
  text: string;
  /** Secondary text. */
  textMuted: string;
  /** Tertiary text and captions. */
  textSubtle: string;
  /** Text and icons on top of `accent`. */
  textOnAccent: string;

  /** Primary call to action (the character's colour). */
  accent: string;
  accentPressed: string;
  accentSoft: string;
  accentGlow: string;
  /** Accent coloured text and icons on bg / surface. */
  accentText: string;

  /** The character's second colour: progress, positive highlights, charts. */
  herb: string;
  herbSoft: string;
  /** Achievements, highlights. */
  berry: string;
  berrySoft: string;
  /** Water tracking. */
  water: string;
  waterSoft: string;
  /** Gold for badges and XP. */
  gold: string;
  goldSoft: string;

  /** Savings, completed items. */
  success: string;
  successSoft: string;

  /** Allergy warnings and destructive actions. Never used for "over the goal". */
  danger: string;
  dangerSoft: string;

  /** Panel laid over food photos. */
  glass: string;
  glassBorder: string;
  /** Dim layer behind sheets and dialogs. */
  backdrop: string;

  shadow: string;
};

export type ColorToken = keyof Palette;

// ---------------------------------------------------------------------------
// Colour helpers

/** HSL (h 0–360, s and l 0–100) to #RRGGBB. */
export function hsl(h: number, s: number, l: number): string {
  const sat = s / 100;
  const light = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const hex = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${hex(f(0))}${hex(f(8))}${hex(f(4))}`.toUpperCase();
}

/** #RRGGBB with an alpha as an rgba() string. */
export function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

// Semantic colours shared by every character (checked for contrast on every palette).
const SHARED = {
  light: {
    berry: '#A8285F',
    water: '#1F6A9E',
    gold: '#7E5B00',
    success: '#2A7041',
    danger: '#B3261E',
  },
  dark: {
    berry: '#F49BC0',
    water: '#86C9F4',
    gold: '#F5C451',
    success: '#8FD49C',
    danger: '#F49CA2',
  },
} as const;

/**
 * A full palette for a character and mode. Neutrals are tinted with the
 * character's hue; accents come from the hand-tuned seeds.
 */
export function makePalette(id: CharacterId, mode: ThemeName): Palette {
  const theme = CHARACTER_THEMES[id];
  const { hue: h, tint } = theme;
  const seed = theme[mode];
  const second = theme.second[mode];
  const shared = SHARED[mode];
  const s = (base: number) => Math.round(base * tint);

  if (mode === 'light') {
    const text = hsl(h, s(40), 12);
    return {
      bg: hsl(h, s(80), 97.5),
      surface: '#FFFFFF',
      surfaceRaised: hsl(h, s(55), 93.5),
      border: hsl(h, s(35), 85),
      text,
      textMuted: hsl(h, s(22), 29),
      textSubtle: hsl(h, s(16), 37),
      textOnAccent: seed.textOnAccent,
      accent: seed.accent,
      accentPressed: seed.accentPressed,
      accentSoft: withAlpha(seed.accent, 0.12),
      accentGlow: withAlpha(seed.accent, 0.32),
      accentText: seed.accentText,
      herb: second,
      herbSoft: withAlpha(second, 0.12),
      berry: shared.berry,
      berrySoft: withAlpha(shared.berry, 0.1),
      water: shared.water,
      waterSoft: withAlpha(shared.water, 0.1),
      gold: shared.gold,
      goldSoft: 'rgba(230, 170, 30, 0.18)',
      success: shared.success,
      successSoft: withAlpha(shared.success, 0.12),
      danger: shared.danger,
      dangerSoft: withAlpha(shared.danger, 0.1),
      glass: withAlpha(hsl(h, s(80), 97.5), 0.84),
      glassBorder: withAlpha(text, 0.1),
      backdrop: withAlpha(text, 0.45),
      shadow: hsl(h, s(40), 20),
    };
  }

  const bg = hsl(h, s(26), 6.5);
  const text = hsl(h, s(60), 95);
  return {
    bg,
    surface: hsl(h, s(20), 10.5),
    surfaceRaised: hsl(h, s(18), 14.5),
    border: hsl(h, s(15), 22),
    text,
    textMuted: hsl(h, s(28), 84),
    textSubtle: hsl(h, s(14), 66),
    textOnAccent: seed.textOnAccent,
    accent: seed.accent,
    accentPressed: seed.accentPressed,
    accentSoft: withAlpha(seed.accent, 0.16),
    accentGlow: withAlpha(seed.accent, 0.45),
    accentText: seed.accentText,
    herb: second,
    herbSoft: withAlpha(second, 0.16),
    berry: shared.berry,
    berrySoft: withAlpha(shared.berry, 0.16),
    water: shared.water,
    waterSoft: withAlpha(shared.water, 0.16),
    gold: shared.gold,
    goldSoft: withAlpha(shared.gold, 0.18),
    success: shared.success,
    successSoft: withAlpha(shared.success, 0.16),
    danger: shared.danger,
    dangerSoft: 'rgba(196, 64, 76, 0.28)',
    glass: withAlpha(bg, 0.55),
    glassBorder: withAlpha(text, 0.14),
    backdrop: 'rgba(0, 0, 0, 0.6)',
    shadow: '#000000',
  };
}
