/**
 * "Iltapöytä" palette: a dark, warm base that lets food photography glow.
 * Contrast ratios are against `bg` / `surface` and meet WCAG AA (4.5:1) for
 * body text unless noted.
 */
const palette = {
  olive950: '#161814',
  olive900: '#1C1F1A',
  olive850: '#22251F',
  olive800: '#2B2F28',
  olive700: '#3A3F36',
  olive500: '#6E7466',

  cream50: '#F3EDE2',
  cream200: '#D9D1C3',
  cream400: '#A9A193',

  apricot300: '#F7C08A',
  apricot500: '#F2A65A',
  apricot700: '#C77A2E',

  sage400: '#9CC59A',
  sage600: '#5E8F5C',

  wine400: '#D97A86',
  wine600: '#8E3B46',

  black: '#000000',
  white: '#FFFFFF',
} as const;

export const colors = {
  /** App background. */
  bg: palette.olive950,
  /** Cards, sheets. */
  surface: palette.olive850,
  /** Raised elements on top of a surface (chips, inputs). */
  surfaceRaised: palette.olive800,
  /** Hairlines and dividers. */
  border: palette.olive700,

  /** Primary text, 15.3:1 on bg. */
  text: palette.cream50,
  /** Secondary text, 11.8:1 on bg. */
  textMuted: palette.cream200,
  /** Tertiary text and captions, 7.0:1 on bg, 5.3:1 on surfaceRaised. */
  textSubtle: palette.cream400,
  /** Text on top of the accent colour, 8.8:1 on accent. */
  textOnAccent: palette.olive950,

  /** Primary call to action. */
  accent: palette.apricot500,
  accentPressed: palette.apricot700,
  accentSoft: 'rgba(242, 166, 90, 0.16)',
  accentGlow: 'rgba(242, 166, 90, 0.45)',
  accentText: palette.apricot300,

  /** Savings, completed items. */
  success: palette.sage400,
  successSoft: 'rgba(156, 197, 154, 0.16)',

  /** Allergy warnings and destructive actions. */
  danger: palette.wine400,
  dangerSoft: 'rgba(142, 59, 70, 0.28)',

  /** Glass panel laid over food photos. */
  glass: 'rgba(22, 24, 20, 0.55)',
  glassBorder: 'rgba(243, 237, 226, 0.14)',

  shadow: palette.black,
} as const;

export type ColorToken = keyof typeof colors;

export const gradients = {
  /** Scrim that keeps text legible over any food photo. */
  scrim: ['rgba(22, 24, 20, 0)', 'rgba(22, 24, 20, 0.55)', 'rgba(22, 24, 20, 0.92)'],
} as const;
