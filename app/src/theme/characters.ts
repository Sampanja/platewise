/**
 * The characters. Each one sets the whole app's colour theme (light and
 * dark), its voice (strings in i18n/fiCharacters.ts) and its look (SVG in
 * features/mascot/characters). The user picks one in onboarding and can
 * change it in the profile.
 *
 * Colours here are seeds: neutrals are generated from `hue` (palette.ts),
 * accents are given explicitly because their contrast is tuned by hand.
 * theme/contrast.test.ts checks every combination against WCAG AA.
 */

export const CHARACTER_IDS = ['nuppu', 'porkkis', 'aava', 'tomppa', 'mustis', 'sitru', 'kanttu', 'ruis'] as const;
export type CharacterId = (typeof CHARACTER_IDS)[number];

export const DEFAULT_CHARACTER: CharacterId = 'nuppu';

type AccentSeed = {
  /** Primary button and active state. */
  accent: string;
  accentPressed: string;
  /** Accent-coloured text and icons on bg/surface. */
  accentText: string;
  /** Text on top of `accent`. */
  textOnAccent: string;
};

export type CharacterTheme = {
  id: CharacterId;
  /** Hue (0–360) of the tinted neutrals: backgrounds, surfaces, text. */
  hue: number;
  /** How strongly the neutrals are tinted (0–1). */
  tint: number;
  light: AccentSeed;
  dark: AccentSeed;
  /** Second brand colour used for the "herb"/success-adjacent highlights (light, dark). */
  second: { light: string; dark: string };
};

export const CHARACTER_THEMES: Record<CharacterId, CharacterTheme> = {
  // Beetroot: deep magenta, leaf green.
  nuppu: {
    id: 'nuppu',
    hue: 330,
    tint: 0.55,
    light: { accent: '#A3195B', accentPressed: '#86124A', accentText: '#9B1756', textOnAccent: '#FFFFFF' },
    dark: { accent: '#F27AB0', accentPressed: '#E0609A', accentText: '#F7A3C8', textOnAccent: '#2A0716' },
    second: { light: '#2C6E3F', dark: '#84CF95' },
  },
  // Carrot: warm orange, fresh green fronds.
  porkkis: {
    id: 'porkkis',
    hue: 24,
    tint: 0.6,
    light: { accent: '#C2410C', accentPressed: '#A3360A', accentText: '#B23C0B', textOnAccent: '#FFFFFF' },
    dark: { accent: '#FF9149', accentPressed: '#F07A2E', accentText: '#FFB380', textOnAccent: '#2A1104' },
    second: { light: '#2F6E2A', dark: '#8FD07F' },
  },
  // Avocado: calm leafy green, buttery cream.
  aava: {
    id: 'aava',
    hue: 95,
    tint: 0.45,
    light: { accent: '#3D6B1E', accentPressed: '#305618', accentText: '#3A651C', textOnAccent: '#FFFFFF' },
    dark: { accent: '#A3D46F', accentPressed: '#8CC255', accentText: '#BCE38F', textOnAccent: '#14200A' },
    second: { light: '#7A5426', dark: '#D9B07A' },
  },
  // Tomato: juicy red, basil green.
  tomppa: {
    id: 'tomppa',
    hue: 6,
    tint: 0.55,
    light: { accent: '#BF2A1F', accentPressed: '#A12118', accentText: '#B0261C', textOnAccent: '#FFFFFF' },
    dark: { accent: '#FF7D6E', accentPressed: '#F2604F', accentText: '#FFA196', textOnAccent: '#2B0805' },
    second: { light: '#2B6B33', dark: '#86CC8C' },
  },
  // Blueberry: deep indigo, bloom lilac.
  mustis: {
    id: 'mustis',
    hue: 232,
    tint: 0.55,
    light: { accent: '#3B4CC0', accentPressed: '#2F3EA3', accentText: '#3647B4', textOnAccent: '#FFFFFF' },
    dark: { accent: '#93A1FF', accentPressed: '#7B8BF5', accentText: '#B3BDFF', textOnAccent: '#0D1033' },
    second: { light: '#7B3FA0', dark: '#CFA2EE' },
  },
  // Lemon: sunny yellow with dark text, zesty green.
  sitru: {
    id: 'sitru',
    hue: 50,
    tint: 0.7,
    light: { accent: '#E0A800', accentPressed: '#CC9900', accentText: '#735A00', textOnAccent: '#231C00' },
    dark: { accent: '#FFD84D', accentPressed: '#F5CA2A', accentText: '#FFE27A', textOnAccent: '#231C00' },
    second: { light: '#2F6B2C', dark: '#93D37E' },
  },
  // Chanterelle: golden amber, forest moss.
  kanttu: {
    id: 'kanttu',
    hue: 36,
    tint: 0.5,
    light: { accent: '#965500', accentPressed: '#7C4600', accentText: '#8C5000', textOnAccent: '#FFFFFF' },
    dark: { accent: '#F5B24A', accentPressed: '#E89D2C', accentText: '#F8C878', textOnAccent: '#261500' },
    second: { light: '#3E6A2E', dark: '#9CC98A' },
  },
  // Rye bread: cosy brown, caraway.
  ruis: {
    id: 'ruis',
    hue: 22,
    tint: 0.3,
    light: { accent: '#6F4325', accentPressed: '#5A361D', accentText: '#6A4023', textOnAccent: '#FFFFFF' },
    dark: { accent: '#D9A47A', accentPressed: '#C88E62', accentText: '#E6BC9A', textOnAccent: '#21130A' },
    second: { light: '#5C6A2A', dark: '#C4CE8C' },
  },
};

export function isCharacterId(value: unknown): value is CharacterId {
  return typeof value === 'string' && (CHARACTER_IDS as readonly string[]).includes(value);
}
