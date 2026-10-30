import { describe, expect, it } from '@jest/globals';

import { addDays, greeting, longDate, parseLocalDate, relativeDayLabel, shortDate, toLocalDate } from './dates';

describe('local dates', () => {
  it('round-trips without shifting the day (no UTC parsing)', () => {
    expect(toLocalDate(parseLocalDate('2026-10-30'))).toBe('2026-10-30');
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('adds days across the daylight saving change', () => {
    // Finland moves clocks back on the last Sunday of October.
    expect(addDays('2026-10-24', 2)).toBe('2026-10-26');
  });
});

describe('labels', () => {
  it('says today and tomorrow, otherwise a short Finnish date', () => {
    expect(relativeDayLabel('2026-10-30', '2026-10-30')).toBe('Tänään');
    expect(relativeDayLabel('2026-10-31', '2026-10-30')).toBe('Huomenna');
    expect(relativeDayLabel('2026-11-01', '2026-10-30')).toBe('su 1.11.');
  });

  it('formats short and long dates', () => {
    expect(shortDate('2026-10-30')).toBe('pe 30.10.');
    expect(longDate('2026-10-30')).toBe('perjantai 30.10.');
  });

  it('greets by time of day', () => {
    expect(greeting(7)).toBe('Hyvää huomenta');
    expect(greeting(12)).toBe('Hyvää päivää');
    expect(greeting(19)).toBe('Hyvää iltaa');
    expect(greeting(2)).toBe('Hyvää yötä');
  });
});
