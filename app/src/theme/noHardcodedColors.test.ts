import { describe, expect, it } from '@jest/globals';

// The app's tsconfig has no Node types; declare the little this test needs.
type Fs = {
  readdirSync(path: string): string[];
  readFileSync(path: string, encoding: 'utf8'): string;
  statSync(path: string): { isDirectory(): boolean };
};
declare const __dirname: string;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { readdirSync, readFileSync, statSync } = require('fs') as Fs;
const join = (...parts: string[]) => parts.join('/');

/**
 * Views read colours only from the theme (`colors`, `fixed` or a palette).
 * Hex and rgba() literals live in src/theme. The one exception is the
 * character artwork, which keeps its own look in every theme.
 */
const SRC = __dirname.replace(/\\/g, '/').replace(/\/theme$/, '');
const ALLOWED = new Set(['features/mascot/CharacterSvg.tsx', 'features/widget/widgetArt.generated.ts']);
const COLOR_LITERAL = /['"`](#[0-9A-Fa-f]{3,8}|rgba?\()/;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

describe('no hardcoded colours', () => {
  const sources = files(SRC)
    .map((path) => path.slice(SRC.length + 1))
    .filter((path) => !path.startsWith('theme/') && !ALLOWED.has(path));

  it('finds the source files', () => {
    expect(sources.length).toBeGreaterThan(50);
  });

  it('has no colour literals outside src/theme', () => {
    const offenders = sources.flatMap((path) =>
      readFileSync(join(SRC, path), 'utf8')
        .split('\n')
        .map((line, i) => ({ line, i }))
        .filter(({ line }) => COLOR_LITERAL.test(line))
        .map(({ line, i }) => `${path}:${i + 1}: ${line.trim()}`),
    );
    expect(offenders).toEqual([]);
  });
});
