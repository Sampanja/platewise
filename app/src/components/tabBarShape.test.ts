import { describe, expect, it } from '@jest/globals';

import { BAR_HEIGHT, barPath } from './tabBarShape';

/** Parses the numbers of a path command list into [command, ...numbers] tuples. */
function commands(path: string): (string | number)[][] {
  return path
    .split(/(?=[MLCAZ])/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => [part[0], ...part.slice(1).trim().split(/\s+/).filter(Boolean).map(Number)]);
}

describe('tab bar outline', () => {
  it.each([328, 379, 520])('at %i dp the notch is centred and deepest in the middle', (width) => {
    const parts = commands(barPath(width));
    const curves = parts.filter((c) => c[0] === 'C');
    expect(curves).toHaveLength(2);
    // The first curve ends at the bottom of the notch, exactly in the middle of the bar.
    const [, , , , , endX, endY] = curves[0] as [string, number, number, number, number, number, number];
    expect(endX).toBeCloseTo(width / 2);
    expect(endY).toBeGreaterThan(0);
    expect(endY).toBeLessThan(BAR_HEIGHT / 2 + 4);
    // The notch is symmetric.
    const firstStart = (parts[1] as [string, number, number])[1];
    const secondEnd = (curves[1] as number[])[5] as number;
    expect(width / 2 - firstStart).toBeCloseTo(secondEnd - width / 2);
  });

  it('stays inside the bar width with rounded ends', () => {
    const width = 360;
    for (const command of commands(barPath(width))) {
      const numbers = command.slice(1) as number[];
      if (command[0] === 'A') continue;
      for (let i = 0; i < numbers.length; i += 2) {
        expect(numbers[i]).toBeGreaterThanOrEqual(0);
        expect(numbers[i]).toBeLessThanOrEqual(width);
      }
    }
    expect(barPath(width)).toContain(`A ${BAR_HEIGHT / 2} ${BAR_HEIGHT / 2}`);
  });
});
