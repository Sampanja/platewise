import { describe, expect, it } from '@jest/globals';

import { mascotGreeting, type GreetingInput } from './mascotMood';

const base: GreetingInput = { hour: 9, loggedToday: 0, streak: 0, waterGoalReached: false, dinnerPlanned: false, daysAway: 0 };

describe('mascotGreeting', () => {
  it('greets by time of day', () => {
    expect(mascotGreeting(base).key).toBe('morning');
    expect(mascotGreeting({ ...base, hour: 14 }).key).toBe('day');
    expect(mascotGreeting({ ...base, hour: 20 }).key).toBe('evening');
    expect(mascotGreeting({ ...base, hour: 1 })).toEqual({ state: 'sleepy', key: 'night' });
  });

  it('welcomes back without guilt after a break', () => {
    expect(mascotGreeting({ ...base, daysAway: 5 })).toEqual({ state: 'happy', key: 'welcomeBack' });
  });

  it('celebrates habits: a week-long streak, water, cooking', () => {
    expect(mascotGreeting({ ...base, hour: 12, streak: 14, loggedToday: 2 }).state).toBe('celebrating');
    expect(mascotGreeting({ ...base, hour: 12, waterGoalReached: true }).key).toBe('waterDone');
    expect(mascotGreeting({ ...base, hour: 17, dinnerPlanned: true })).toEqual({ state: 'cooking', key: 'cookTonight' });
  });
});
