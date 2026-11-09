import { describe, expect, it } from '@jest/globals';

import { palettes, type Palette, type ThemeName } from './colors';

/** WCAG 2.x relative luminance of an opaque #RRGGBB colour. */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const AA = 4.5;
/** Large text and UI components (icons, borders of controls). */
const AA_LARGE = 3;

const TEXT: (keyof Palette)[] = ['text', 'textMuted', 'textSubtle', 'accentText', 'success', 'danger', 'herb', 'berry', 'water', 'gold'];
const BACKGROUNDS: (keyof Palette)[] = ['bg', 'surface', 'surfaceRaised'];

describe.each(Object.keys(palettes) as ThemeName[])('%s theme', (name) => {
  const p = palettes[name];

  const pairs = TEXT.flatMap((token) => BACKGROUNDS.map((bg) => [token, bg] as const));
  it.each(pairs)('%s on %s meets AA', (token, bg) => {
    expect(contrast(p[token], p[bg])).toBeGreaterThanOrEqual(AA);
  });

  it('text on the accent button meets AA', () => {
    expect(contrast(p.textOnAccent, p.accent)).toBeGreaterThanOrEqual(AA);
    expect(contrast(p.textOnAccent, p.accentPressed)).toBeGreaterThanOrEqual(AA);
  });

  it('the accent button stands out from the background', () => {
    expect(contrast(p.accent, p.bg)).toBeGreaterThanOrEqual(AA_LARGE);
  });
});
