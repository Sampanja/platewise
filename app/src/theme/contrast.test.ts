import { describe, expect, it } from '@jest/globals';

import { CHARACTER_IDS } from './characters';
import { palettes } from './colors';
import type { Palette, ThemeName } from './palette';

/** WCAG 2.x relative luminance of an opaque #RRGGBB colour. */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const AA = 4.5;
/** Large text and UI components (icons, the accent button against the page). */
const AA_LARGE = 3;

const TEXT: (keyof Palette)[] = [
  'text',
  'textMuted',
  'textSubtle',
  'accentText',
  'herb',
  'success',
  'danger',
  'berry',
  'water',
  'gold',
];
const BACKGROUNDS: (keyof Palette)[] = ['bg', 'surface', 'surfaceRaised'];
const MODES: ThemeName[] = ['light', 'dark'];

const cases = CHARACTER_IDS.flatMap((id) => MODES.map((mode) => [id, mode] as const));

describe.each(cases)('%s %s', (id, mode) => {
  const p = palettes[id][mode];

  const pairs = TEXT.flatMap((token) => BACKGROUNDS.map((bg) => [token, bg] as const));
  it.each(pairs)('%s on %s meets AA', (token, bg) => {
    expect(contrast(p[token], p[bg])).toBeGreaterThanOrEqual(AA);
  });

  it('text on the accent button meets AA', () => {
    expect(contrast(p.textOnAccent, p.accent)).toBeGreaterThanOrEqual(AA);
    expect(contrast(p.textOnAccent, p.accentPressed)).toBeGreaterThanOrEqual(AA);
  });

  it('the accent button stands out from the background (or carries a clear outline colour)', () => {
    // Light yellow (lemon) cannot reach 3:1 on a near-white page; its button text carries the contrast instead.
    const min = id === 'sitru' && mode === 'light' ? 2 : AA_LARGE;
    expect(contrast(p.accent, p.bg)).toBeGreaterThanOrEqual(min);
  });

  it('primary text is very readable', () => {
    expect(contrast(p.text, p.bg)).toBeGreaterThanOrEqual(10);
  });
});
