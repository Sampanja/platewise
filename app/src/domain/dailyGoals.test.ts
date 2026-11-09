import { describe, expect, it } from '@jest/globals';

import { goalsForDate } from './dailyGoals';

const goals = { kcal: 2000, proteinG: 120, carbsG: 220, fatG: 70 };
const cycling = { enabled: true, highDays: [5, 6] as (0 | 1 | 2 | 3 | 4 | 5 | 6)[], extraKcal: 300 };

describe('goalsForDate', () => {
  it('returns the plain goals without cycling', () => {
    expect(goalsForDate(goals, { ...cycling, enabled: false }, 'female', new Date(2026, 10, 14))).toBe(goals);
  });

  it('gives a high day more energy and keeps protein', () => {
    const saturday = goalsForDate(goals, cycling, 'female', new Date(2026, 10, 14));
    expect(saturday.kcal).toBe(2300);
    expect(saturday.proteinG).toBe(120);
    expect(saturday.carbsG).toBeGreaterThan(goals.carbsG);
  });

  it('gives a low day a little less, macros adding up roughly to the energy', () => {
    const monday = goalsForDate(goals, cycling, 'female', new Date(2026, 10, 9));
    expect(monday.kcal).toBe(1880);
    const sum = monday.proteinG * 4 + monday.carbsG * 4 + monday.fatG * 9;
    expect(Math.abs(sum - (goals.proteinG * 4 + goals.carbsG * 4 + goals.fatG * 9) * (1880 / 2000))).toBeLessThan(80);
  });
});
