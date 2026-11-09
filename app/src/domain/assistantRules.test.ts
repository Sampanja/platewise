import { describe, expect, it } from '@jest/globals';

import { classifySafety, detectIntent, testAnswer } from './assistantRules';

const context = {
  eaten: { kcal: 1200, proteinG: 60, entries: ['Kaurapuuro'] },
  goals: { kcal: 2000, proteinG: 110 },
  waterMl: 750,
  waterGoalMl: 1500,
  hideCalories: false,
};

describe('classifySafety', () => {
  it('recognises eating disorder signals first', () => {
    expect(classifySafety('Oksennan aina syömisen jälkeen')).toBe('eatingDisorder');
    expect(classifySafety('En ole syönyt kahteen päivään, onko ok?')).toBe('eatingDisorder');
  });
  it('recognises extreme diets and very low calories', () => {
    expect(classifySafety('Voinko syödä 800 kcal päivässä?')).toBe('extremeDiet');
    expect(classifySafety('Haluan laihtua 10 kg kuukaudessa')).toBe('extremeDiet');
    expect(classifySafety('Kokeilisinko vesipaastoa?')).toBe('extremeDiet');
  });
  it('recognises medical questions', () => {
    expect(classifySafety('Onko minulla keliakia?')).toBe('medical');
    expect(classifySafety('Mitä syön diabeteksen kanssa?')).toBe('medical');
  });
  it('lets ordinary food questions through', () => {
    expect(classifySafety('Mitä söisin illalla, jossa on proteiinia?')).toBeNull();
    expect(classifySafety('Miksi paino heiluu päivästä toiseen?')).toBeNull();
    expect(classifySafety('En syö lihaa, mistä proteiinia?')).toBeNull();
    expect(classifySafety('Paljonko proteiinia 150 g kanaa?')).toBeNull();
  });
});

describe('testAnswer', () => {
  it('refers to professionals and never gives numbers below the safety floor', () => {
    const answer = testAnswer('Voinko syödä 800 kcal päivässä?', context);
    expect(answer).toContain('1\u00a0200');
    expect(answer).not.toMatch(/\b800\b/);
    expect(testAnswer('Onko minulla diabetes?', context)).toMatch(/lääkäri/);
    expect(testAnswer('Oksennan syömisen jälkeen', context)).toMatch(/SYLI|terveydenhoitaja/);
  });

  it('uses today’s numbers only with consent and without "hide calories"', () => {
    expect(testAnswer('Mitä söisin illalla, jossa on proteiinia?', context)).toContain('50\u00a0g');
    expect(testAnswer('Mitä söisin illalla, jossa on proteiinia?', null)).not.toMatch(/\d+ g jäljellä/);
    expect(testAnswer('Mitä söisin illalla, jossa on proteiinia?', { ...context, hideCalories: true })).not.toMatch(
      /jäljellä/,
    );
  });

  it('detects the suggested questions', () => {
    expect(detectIntent('Miksi paino heiluu päivästä toiseen?')).toBe('weightSwings');
    expect(detectIntent('Miten saisin lisää kasviksia päivään?')).toBe('moreVeg');
    expect(detectIntent('Mitä teen jääneistä kasviksista?')).toBe('leftovers');
  });
});
