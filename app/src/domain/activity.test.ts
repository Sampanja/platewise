import { describe, expect, it } from '@jest/globals';

import {
  ACTIVITY_FACTORS,
  activityInputs,
  commuteKcalPerDay,
  DEFAULT_ACTIVITY_ANSWERS,
  DEFAULT_ACTIVITY_LEVEL,
  everydayFactor,
  leisureKcalPerDay,
  levelOf,
  migrateActivityAnswers,
  migrateWorkout,
  SITUATION_LEVEL,
  stepBandFor,
  workoutKcalPerDay,
  WORKOUT_MET,
  WORKOUT_TYPES,
} from './activity';
import { expenditure, planEnergy, type BodyInfo } from './energy';
import { OCCUPATION_LEVELS } from './occupations';

const woman: BodyInfo = {
  sex: 'female',
  ageYears: 30,
  heightCm: 168,
  weightKg: 70,
  activity: 1,
  exercisePerWeek: 0,
  pregnancy: 'none',
};

describe('question 1: work, school or situation', () => {
  it('uses the level of the occupation, situation or the default', () => {
    expect(levelOf({ level: 4, situation: null })).toBe(4);
    expect(levelOf({ level: 1, situation: 'home' })).toBe(SITUATION_LEVEL.home);
    expect(levelOf({ level: null, situation: null })).toBe(DEFAULT_ACTIVITY_LEVEL);
  });

  it('puts pupils and students in the sitting level and nurses on their feet', () => {
    expect(OCCUPATION_LEVELS.pupil).toBe(1);
    expect(OCCUPATION_LEVELS.student).toBe(1);
    expect(OCCUPATION_LEVELS.nurse).toBe(3);
    expect(OCCUPATION_LEVELS.construction).toBe(4);
    expect(OCCUPATION_LEVELS.forestry).toBe(5);
  });

  it('raises the level with many steps but never lowers a heavy job', () => {
    expect(everydayFactor(1, 'unknown')).toBe(ACTIVITY_FACTORS[1]);
    expect(everydayFactor(1, 'over12k')).toBe(1.6);
    expect(everydayFactor(5, 'under5k')).toBe(ACTIVITY_FACTORS[5]);
  });
});

describe('question 2: everyday movement', () => {
  it('counts a walk or bike ride to work five days a week', () => {
    // 30 min/day walking for 70 kg: 2.5 × 70 × 0.5 h × 5 / 7 = 62.5 kcal/day.
    expect(commuteKcalPerDay({ mode: 'walk', minutesPerDay: 30 }, 70, false)).toBeCloseTo(62.5, 5);
    expect(commuteKcalPerDay({ mode: 'bike', minutesPerDay: 30 }, 70, false)).toBeCloseTo(145, 0);
    expect(commuteKcalPerDay({ mode: 'car', minutesPerDay: 60 }, 70, false)).toBe(0);
    expect(commuteKcalPerDay({ mode: 'none', minutesPerDay: 0 }, 70, false)).toBe(0);
  });

  it('does not count walking twice when steps are known', () => {
    expect(commuteKcalPerDay({ mode: 'walk', minutesPerDay: 30 }, 70, true)).toBe(0);
    expect(commuteKcalPerDay({ mode: 'transit', minutesPerDay: 30 }, 70, true)).toBe(0);
    expect(commuteKcalPerDay({ mode: 'bike', minutesPerDay: 30 }, 70, true)).toBeGreaterThan(0);
    expect(leisureKcalPerDay(['dog'], 70, true)).toBe(0);
    expect(leisureKcalPerDay(['dog'], 70, false)).toBeGreaterThan(0);
    expect(leisureKcalPerDay(['garden'], 70, true)).toBeGreaterThan(0);
  });

  it('counts each chore once', () => {
    expect(leisureKcalPerDay(['garden', 'garden'], 70, false)).toBe(leisureKcalPerDay(['garden'], 70, false));
    expect(leisureKcalPerDay([], 70, false)).toBe(0);
  });

  it('turns an old step count into a band', () => {
    expect(stepBandFor(null)).toBe('unknown');
    expect(stepBandFor(3000)).toBe('under5k');
    expect(stepBandFor(7000)).toBe('5to8k');
    expect(stepBandFor(10000)).toBe('8to12k');
    expect(stepBandFor(15000)).toBe('over12k');
  });
});

describe('question 3: workouts', () => {
  it('has a light < moderate < hard MET for every sport', () => {
    for (const type of WORKOUT_TYPES) {
      const met = WORKOUT_MET[type];
      expect(met.light).toBeLessThan(met.moderate);
      expect(met.moderate).toBeLessThan(met.hard);
      expect(met.light).toBeGreaterThan(1);
    }
  });

  it('scales with intensity', () => {
    const light = workoutKcalPerDay([{ type: 'run', perWeek: 3, minutes: 40, intensity: 'light' }], 70);
    const hard = workoutKcalPerDay([{ type: 'run', perWeek: 3, minutes: 40, intensity: 'hard' }], 70);
    expect(hard).toBeGreaterThan(light);
  });

  it('reads old saved workouts', () => {
    expect(migrateWorkout({ type: 'ball', perWeek: 2, minutes: 60 })).toEqual({ type: 'team', perWeek: 2, minutes: 60, intensity: 'moderate' });
    expect(migrateWorkout({ type: 'gym', perWeek: 99, minutes: 1, intensity: 'hard' })).toEqual({ type: 'gym', perWeek: 14, minutes: 10, intensity: 'hard' });
    expect(migrateWorkout({ type: 'curling' })).toBeNull();
    expect(migrateWorkout(null)).toBeNull();
  });
});

describe('the three questions together', () => {
  it('adds everyday movement and workouts on top of BMR', () => {
    const base = expenditure(woman);
    const active = expenditure({
      ...woman,
      commute: { mode: 'bike', minutesPerDay: 40 },
      leisure: ['dog', 'garden'],
      workouts: [{ type: 'gym', perWeek: 2, minutes: 60, intensity: 'moderate' }],
    });
    expect(active.tdee).toBeGreaterThan(base.tdee);
    expect(active.commuteKcal).toBeGreaterThan(0);
    expect(active.leisureKcal).toBeGreaterThan(0);
    // The parts always add up to the total shown.
    expect(active.bmr + active.everydayKcal + active.exerciseKcal).toBeCloseTo(active.tdee, 5);
    expect(base.bmr + base.everydayKcal + base.exerciseKcal).toBeCloseTo(base.tdee, 5);
  });

  it('caps a very active day at 2.5 × BMR and still adds up', () => {
    const athlete = expenditure({
      ...woman,
      activity: 5,
      commute: { mode: 'bike', minutesPerDay: 90 },
      workouts: [{ type: 'run', perWeek: 14, minutes: 120, intensity: 'hard' }],
    });
    expect(athlete.tdee).toBeCloseTo(athlete.bmr * 2.5, 5);
    expect(athlete.bmr + athlete.everydayKcal + athlete.exerciseKcal).toBeCloseTo(athlete.tdee, 5);
  });

  it('keeps the safety limits: no deficit under 18, whatever the activity', () => {
    const teen = { ...woman, ageYears: 16, activity: 3 as const, workouts: [{ type: 'team' as const, perWeek: 4, minutes: 90, intensity: 'hard' as const }] };
    const plan = planEnergy(teen, { type: 'lose', rateKgPerWeek: 0.5, targetWeightKg: 60 });
    expect(plan.goal).toBe('maintain');
    expect(plan.targetKcal).toBeGreaterThanOrEqual(Math.round(expenditure(teen).tdee / 10) * 10 - 10);
  });
});

describe('saved answers', () => {
  it('turns the old activity fields into the three answers', () => {
    const answers = migrateActivityAnswers({
      activity: 3,
      everydayMode: 'steps',
      steps: 9000,
      exercisePerWeek: 2,
      workouts: [{ type: 'ball', perWeek: 1, minutes: 90 }],
    });
    expect(answers).toMatchObject({
      activity: 3,
      stepBand: '8to12k',
      workouts: [{ type: 'team', perWeek: 1, minutes: 90, intensity: 'moderate' }],
      commute: { mode: 'none' },
      leisure: [],
      skipped: { work: false, everyday: false, workouts: false },
    });
  });

  it('keeps old sessions per week as a workout and ignores steps in job mode', () => {
    const answers = migrateActivityAnswers({ activity: 2, everydayMode: 'job', steps: 7000, exercisePerWeek: 3, workouts: [] });
    expect(answers.stepBand).toBe('unknown');
    expect(answers.workouts).toEqual([{ type: 'other', perWeek: 3, minutes: 45, intensity: 'moderate' }]);
  });

  it('repairs broken saved state', () => {
    expect(migrateActivityAnswers({ activity: 9, leisure: ['dog', 'skydiving'], commute: { mode: 'rocket' } })).toMatchObject({
      activity: DEFAULT_ACTIVITY_LEVEL,
      leisure: ['dog'],
      commute: { mode: 'none' },
    });
    expect(migrateActivityAnswers({})).toEqual(DEFAULT_ACTIVITY_ANSWERS);
  });

  it('feeds the energy calculation', () => {
    const inputs = activityInputs({ ...DEFAULT_ACTIVITY_ANSWERS, stepBand: '5to8k', commute: { mode: 'bike', minutesPerDay: 20 } });
    expect(inputs).toMatchObject({ steps: 6500, exercisePerWeek: 0, commute: { mode: 'bike', minutesPerDay: 20 } });
    expect(activityInputs(DEFAULT_ACTIVITY_ANSWERS).steps).toBeNull();
  });
});
