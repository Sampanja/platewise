import { Appearance } from 'react-native';

import { CHARACTER_IDS, DEFAULT_CHARACTER, type CharacterId } from './characters';
import { makePalette, type Palette, type ThemeName } from './palette';

/**
 * The active theme: the chosen character's palette in light or dark mode.
 * `colors` always resolves to it, so components read it at render time;
 * styles are created per theme with `themedStyles`. The root layout sets the
 * theme before rendering and re-renders every screen when it changes.
 */

export type { ColorToken, Palette, ThemeName } from './palette';
export type ThemePreference = 'system' | ThemeName;

/** Every character's light and dark palette, built once. */
export const palettes: Readonly<Record<CharacterId, Record<ThemeName, Palette>>> = Object.fromEntries(
  CHARACTER_IDS.map((id) => [id, { light: makePalette(id, 'light'), dark: makePalette(id, 'dark') }]),
) as Record<CharacterId, Record<ThemeName, Palette>>;

let mode: ThemeName = Appearance.getColorScheme() === 'light' ? 'light' : 'dark';
let character: CharacterId = DEFAULT_CHARACTER;

/** Light or dark. */
export function activeTheme(): ThemeName {
  return mode;
}

export function activeCharacter(): CharacterId {
  return character;
}

/** Identifies the active palette (character + mode), e.g. for style caches. */
export function themeKey(): string {
  return `${character}-${mode}`;
}

/** Called by the root layout before rendering the tree with a new theme. */
export function setActiveTheme(nextMode: ThemeName, nextCharacter: CharacterId = character): void {
  mode = nextMode;
  character = nextCharacter;
}

export function resolveTheme(preference: ThemePreference, system: string | null | undefined): ThemeName {
  if (preference !== 'system') return preference;
  return system === 'light' ? 'light' : 'dark';
}

export function activePalette(): Palette {
  return palettes[character][mode];
}

/** Active theme's colours, read at access time. */
export const colors: Readonly<Palette> = new Proxy({} as Palette, {
  get: (_target, key: string) => activePalette()[key as keyof Palette],
  has: (_target, key) => key in activePalette(),
  ownKeys: () => Reflect.ownKeys(activePalette()),
  getOwnPropertyDescriptor: (_target, key) => ({
    enumerable: true,
    configurable: true,
    value: activePalette()[key as keyof Palette],
  }),
});

/** Scrim that keeps text legible over any photo: fades it into the surface colour. */
function scrimFor(palette: Palette, name: ThemeName): readonly [string, string, string] {
  const base = name === 'dark' ? palette.bg : '#FFFFFF';
  const n = parseInt(base.slice(1), 16);
  const rgb = `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  return [`rgba(${rgb}, 0)`, `rgba(${rgb}, ${name === 'dark' ? 0.55 : 0.6})`, `rgba(${rgb}, ${name === 'dark' ? 0.94 : 0.96})`];
}

export const gradients = {
  get scrim() {
    return scrimFor(activePalette(), mode);
  },
};
