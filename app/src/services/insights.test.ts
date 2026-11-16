import { describe, expect, it } from '@jest/globals';

import { nutrientReference } from '@/domain/nutrients';
import { periodFor, periodReport } from '@/domain/periodReport';
import { CHARACTER_VOICES } from '@/i18n/registry';
import { CHARACTER_IDS } from '@/theme/characters';

import { ruleInsights } from './insights';

const NOW = '2026-11-18';
const reference = nutrientReference({ sex: 'female', age: 35, pregnancy: 'none', kcal: 2000 });
const entry = (date: string) => ({
  id: date,
  date,
  meal: 'lunch' as const,
  name: 'x',
  basis: { kind: 'food' as const, foodId: 'x', per100g: { kcal: 500, proteinG: 30, carbsG: 50, fatG: 10, vitDUg: 0.5 } },
  quantity: 100,
  estimate: false,
  createdAt: '',
});

function report(dates: string[]) {
  return periodReport({
    period: periodFor('week', 0, NOW),
    now: NOW,
    entries: dates.map(entry),
    goals: { kcal: 2000, proteinG: 25, carbsG: 250, fatG: 70 },
    waterByDate: {},
    waterGoalMl: 2000,
    weights: [],
    cooked: [],
    plans: [],
    gradeOf: () => 'A',
  });
}

/** Words the summary must never use: calories as a target, weight, eating less. */
const FORBIDDEN = /kcal|kalori|calorie|kalori|paino|weight|vikt|laihd|lose|gå ner|vähemmän syö|eat less/i;

describe('ruleInsights', () => {
  it('gives 1–3 observations and one suggestion in every voice and language', () => {
    for (const voices of Object.values(CHARACTER_VOICES)) {
      for (const id of CHARACTER_IDS) {
        const result = ruleInsights(report(['2026-11-16', '2026-11-17', '2026-11-18']), voices[id], reference);
        expect(result.observations.length).toBeGreaterThanOrEqual(1);
        expect(result.observations.length).toBeLessThanOrEqual(3);
        expect(result.suggestion.length).toBeGreaterThan(10);
        for (const line of [result.opening, ...result.observations, result.suggestion]) expect(line).not.toMatch(FORBIDDEN);
      }
    }
  });

  it('suggests logging when few days were logged, and a nutrient source when low', () => {
    const voice = CHARACTER_VOICES.fi.nuppu;
    expect(ruleInsights(report(['2026-11-16']), voice, reference).suggestion).toContain('Puhu');
    expect(ruleInsights(report(['2026-11-16', '2026-11-17', '2026-11-18']), voice, reference).suggestion).toContain('D-vitamiini');
  });

  it('talks kindly about an empty period', () => {
    const result = ruleInsights(report([]), CHARACTER_VOICES.fi.avo, reference);
    expect(result.observations).toEqual([]);
    expect(result.opening).toBe(CHARACTER_VOICES.fi.avo.report.empty);
  });
});
