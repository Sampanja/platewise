import { describe, expect, it } from '@jest/globals';

import type { DiaryEntry, DiaryMeal } from '@/data/types';
import { addDays } from '@/lib/dates';

import {
  ACHIEVEMENTS,
  challengeIdFor,
  challengeProgress,
  computeGame,
  computeStreak,
  dayXp,
  levelFor,
  levelStart,
  questIdsFor,
  weekStartOf,
  XP,
  type DayActivity,
  type GameInput,
} from './gamification';

function food(date: string, meal: DiaryMeal, kcal = 400, foodId = 'x', proteinG = 20): DiaryEntry {
  return {
    id: `${date}-${meal}-${foodId}-${kcal}`,
    date,
    meal,
    name: 'x',
    basis: { kind: 'food', foodId, per100g: { kcal, proteinG, carbsG: 30, fatG: 10 } },
    quantity: 100,
    estimate: false,
    createdAt: '',
  };
}

function input(entries: DiaryEntry[], overrides: Partial<GameInput> = {}): GameInput {
  return {
    entries,
    waterByDate: {},
    waterGoalFor: () => 1500,
    proteinGoalG: null,
    weighInDates: [],
    categoryOf: (id) => (id === 'apple' ? 'fruit' : id === 'carrot' ? 'produce' : 'meal'),
    today: '2026-11-09',
    plans: [],
    savedMeals: 0,
    ownRecipes: 0,
    barcodeFoods: 0,
    ...overrides,
  };
}

const emptyDay: DayActivity = {
  date: '2026-11-09',
  entries: 0,
  meals: [],
  recipes: [],
  vegEntries: 0,
  photoEntries: 0,
  waterReached: false,
  proteinReached: false,
  weighed: false,
};

describe('XP and levels', () => {
  it('rewards logging, full days, water, protein, recipes and vegetables', () => {
    expect(dayXp(emptyDay)).toBe(0);
    const full = {
      ...emptyDay,
      entries: 6,
      meals: ['breakfast', 'lunch', 'dinner'] as DiaryMeal[],
      recipes: ['a', 'b', 'c'],
      vegEntries: 3,
      waterReached: true,
      proteinReached: true,
    };
    expect(dayXp(full)).toBe(
      XP.loggedDay + 3 * XP.perMeal + XP.allMainMeals + XP.water + XP.protein + 2 * XP.recipe + XP.veggies,
    );
  });

  it('levels start at 0, 100, 300, 600, …', () => {
    expect([1, 2, 3, 4].map(levelStart)).toEqual([0, 100, 300, 600]);
    expect(levelFor(0).level).toBe(1);
    expect(levelFor(99).level).toBe(1);
    expect(levelFor(100).level).toBe(2);
    expect(levelFor(450)).toEqual({ level: 3, xpIntoLevel: 150, xpForLevel: 300, progress: 0.5 });
  });

  it('never rewards eating less: the same habits give the same XP at any calorie level', () => {
    const small = computeGame(input([food('2026-11-09', 'breakfast', 150), food('2026-11-09', 'lunch', 150)]));
    const large = computeGame(input([food('2026-11-09', 'breakfast', 900), food('2026-11-09', 'lunch', 900)]));
    expect(small.xp).toBe(large.xp);
  });

  it('never takes XP away: more logging never lowers it', () => {
    const one = computeGame(input([food('2026-11-08', 'lunch')]));
    const two = computeGame(input([food('2026-11-08', 'lunch'), food('2026-11-09', 'dinner')]));
    expect(two.xp).toBeGreaterThanOrEqual(one.xp);
  });
});

describe('streak with freezes', () => {
  const days = (start: string, n: number) => Array.from({ length: n }, (_, i) => addDays(start, i));

  it('counts consecutive logged days; today not logged yet does not break it', () => {
    const streak = computeStreak(new Set(days('2026-11-05', 4)), '2026-11-09');
    expect(streak.current).toBe(4);
    expect(streak.todayPending).toBe(true);
  });

  it('earns a freeze per 7 days and uses it for a single missed day', () => {
    const logged = new Set([...days('2026-10-20', 7), ...days('2026-10-28', 3)]); // 27.10. missed
    const streak = computeStreak(logged, '2026-10-30');
    expect(streak.frozenDays).toEqual(['2026-10-27']);
    expect(streak.current).toBe(10);
    expect(streak.freezes).toBe(0);
  });

  it('resets after a gap without freezes, but keeps the best streak', () => {
    const logged = new Set([...days('2026-10-01', 5), ...days('2026-10-10', 2)]);
    const streak = computeStreak(logged, '2026-10-11');
    expect(streak.current).toBe(2);
    expect(streak.best).toBe(5);
  });

  it('holds at most two freezes', () => {
    const streak = computeStreak(new Set(days('2026-09-01', 30)), '2026-09-30');
    expect(streak.freezes).toBe(2);
  });
});

describe('quests and challenges', () => {
  it('gives three quests per day, stable within the day, protein only with a goal', () => {
    expect(questIdsFor('2026-11-09', false)).toHaveLength(3);
    expect(questIdsFor('2026-11-09', false)).toEqual(questIdsFor('2026-11-09', false));
    for (let i = 0; i < 30; i++) expect(questIdsFor(addDays('2026-11-01', i), false)).not.toContain('protein');
  });

  it('measures the weekly challenge over Monday–Sunday', () => {
    expect(weekStartOf('2026-11-12')).toBe('2026-11-09');
    const days = new Map(
      ['2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13'].map((date) => [date, { ...emptyDay, date, entries: 1 }]),
    );
    const challenge = challengeProgress('logFiveDays', '2026-11-09', days, new Map());
    expect(challenge).toMatchObject({ progress: 5, target: 5, done: true });
    expect(typeof challengeIdFor('2026-11-09')).toBe('string');
  });
});

describe('achievements', () => {
  it('has at least 30 achievements with unique ids', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(30);
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length);
  });

  it('unlocks habit achievements from the logged data', () => {
    const entries = [food('2026-11-09', 'breakfast'), food('2026-11-09', 'lunch'), food('2026-11-09', 'dinner')];
    const game = computeGame(input(entries, { waterByDate: { '2026-11-09': 2000 } }));
    expect(game.unlocked).toEqual(expect.arrayContaining(['firstLog', 'fullDay', 'water1']));
    expect(game.unlocked).not.toContain('streak3');
  });

  it('counts the protein goal only when one is set', () => {
    const entries = [food('2026-11-09', 'lunch', 400, 'x', 150)];
    expect(computeGame(input(entries)).unlocked).not.toContain('protein1');
    expect(computeGame(input(entries, { proteinGoalG: 100 })).unlocked).toContain('protein1');
  });
});
