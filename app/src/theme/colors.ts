import { Appearance } from 'react-native';

/**
 * "Paprika" palette for the Iltapöytä design system: warm paprika and
 * apricot accents with herb green, in a fresh light theme and a deep warm
 * dark theme. Every text token meets WCAG AA (4.5:1) against `bg`, `surface`
 * and `surfaceRaised` in both themes; `theme/contrast.test.ts` enforces it.
 *
 * `colors` always resolves to the active theme, so components read it at
 * render time. Styles are created per theme with `themedStyles`.
 */

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

  /** Primary call to action. */
  accent: string;
  accentPressed: string;
  accentSoft: string;
  accentGlow: string;
  /** Accent coloured text and icons on bg / surface. */
  accentText: string;

  /** Second brand colour (herb green): progress, water of life, positive states. */
  herb: string;
  herbSoft: string;
  /** Third colour (berry): achievements, highlights. */
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

const dark: Palette = {
  bg: '#14110E',
  surface: '#201B17',
  surfaceRaised: '#2B2520',
  border: '#3E3630',

  text: '#F8F0E7',
  textMuted: '#DED1C3',
  textSubtle: '#AE9F90',
  textOnAccent: '#1C0F08',

  accent: '#FF8A4C',
  accentPressed: '#E0702F',
  accentSoft: 'rgba(255, 138, 76, 0.16)',
  accentGlow: 'rgba(255, 138, 76, 0.45)',
  accentText: '#FFAD80',

  herb: '#7FCB8E',
  herbSoft: 'rgba(127, 203, 142, 0.16)',
  berry: '#F28DB2',
  berrySoft: 'rgba(242, 141, 178, 0.16)',
  water: '#7CC4F2',
  waterSoft: 'rgba(124, 196, 242, 0.16)',
  gold: '#F5C451',
  goldSoft: 'rgba(245, 196, 81, 0.18)',

  success: '#8FD49C',
  successSoft: 'rgba(143, 212, 156, 0.16)',

  danger: '#F2959B',
  dangerSoft: 'rgba(196, 64, 76, 0.28)',

  glass: 'rgba(20, 17, 14, 0.55)',
  glassBorder: 'rgba(248, 240, 231, 0.14)',
  backdrop: 'rgba(0, 0, 0, 0.6)',

  shadow: '#000000',
};

const light: Palette = {
  bg: '#FFF8F1',
  surface: '#FFFFFF',
  surfaceRaised: '#F7EDE3',
  border: '#EADBCD',

  text: '#2B1D15',
  textMuted: '#55443A',
  textSubtle: '#6E5D52',
  textOnAccent: '#FFFFFF',

  accent: '#C9461A',
  accentPressed: '#A93810',
  accentSoft: 'rgba(232, 98, 46, 0.12)',
  accentGlow: 'rgba(232, 98, 46, 0.35)',
  accentText: '#B23C12',

  herb: '#286E40',
  herbSoft: 'rgba(47, 125, 74, 0.12)',
  berry: '#B0306A',
  berrySoft: 'rgba(176, 48, 106, 0.10)',
  water: '#1F6FA8',
  waterSoft: 'rgba(31, 111, 168, 0.10)',
  gold: '#8A6400',
  goldSoft: 'rgba(230, 170, 30, 0.18)',

  success: '#2E7A47',
  successSoft: 'rgba(46, 122, 71, 0.12)',

  danger: '#B3261E',
  dangerSoft: 'rgba(179, 38, 30, 0.10)',

  glass: 'rgba(255, 248, 241, 0.82)',
  glassBorder: 'rgba(43, 29, 21, 0.10)',
  backdrop: 'rgba(43, 29, 21, 0.45)',

  shadow: '#5A3A22',
};

export const palettes = { light, dark } as const;
export type ThemeName = keyof typeof palettes;
export type ThemePreference = 'system' | ThemeName;

let active: ThemeName = Appearance.getColorScheme() === 'light' ? 'light' : 'dark';

/** The theme every `colors` read and `themedStyles` lookup resolves to. */
export function activeTheme(): ThemeName {
  return active;
}

/** Called by the root layout before rendering the tree with a new theme. */
export function setActiveTheme(name: ThemeName): void {
  active = name;
}

export function resolveTheme(preference: ThemePreference, system: string | null | undefined): ThemeName {
  if (preference !== 'system') return preference;
  return system === 'light' ? 'light' : 'dark';
}

/** Active theme's colours, read at access time. */
export const colors: Readonly<Palette> = new Proxy({} as Palette, {
  get: (_target, key: string) => palettes[active][key as keyof Palette],
  has: (_target, key) => key in palettes[active],
  ownKeys: () => Reflect.ownKeys(palettes[active]),
  getOwnPropertyDescriptor: (_target, key) => ({
    enumerable: true,
    configurable: true,
    value: palettes[active][key as keyof Palette],
  }),
});

export type ColorToken = keyof Palette;

/** Scrim that keeps text legible over any food photo: fades the photo into the background. */
function scrimFor(name: ThemeName): readonly [string, string, string] {
  return name === 'dark'
    ? ['rgba(20, 17, 14, 0)', 'rgba(20, 17, 14, 0.55)', 'rgba(20, 17, 14, 0.94)']
    : ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.96)'];
}

export const gradients = {
  get scrim() {
    return scrimFor(active);
  },
};
