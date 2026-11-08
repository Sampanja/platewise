import { format, strings } from '@/i18n';

/** Calendar date in the user's local time zone, `YYYY-MM-DD`. */
export type LocalDate = string;

export function toLocalDate(date: Date): LocalDate {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parses `YYYY-MM-DD` as local midnight (not UTC, unlike `new Date(string)`). */
export function parseLocalDate(value: LocalDate): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(value: LocalDate, days: number): LocalDate {
  const date = parseLocalDate(value);
  date.setDate(date.getDate() + days);
  return toLocalDate(date);
}

export function today(): LocalDate {
  return toLocalDate(new Date());
}

/** "Tänään", "Huomenna" or e.g. "la 1.11.". */
export function relativeDayLabel(value: LocalDate, now: LocalDate = today()): string {
  if (value === now) return strings.dates.today;
  if (value === addDays(now, 1)) return strings.dates.tomorrow;
  return shortDate(value);
}

/** e.g. "la 1.11." */
export function shortDate(value: LocalDate): string {
  const date = parseLocalDate(value);
  return format(strings.dates.shortDate, {
    weekday: strings.dates.weekdaysShort[date.getDay()],
    day: date.getDate(),
    month: date.getMonth() + 1,
  });
}

/** e.g. "torstai 30.10." */
export function longDate(value: LocalDate): string {
  const date = parseLocalDate(value);
  return `${strings.dates.weekdays[date.getDay()]} ${date.getDate()}.${date.getMonth() + 1}.`;
}

export function greeting(hour: number = new Date().getHours()): string {
  const g = strings.greetings;
  if (hour >= 5 && hour < 10) return g.morning;
  if (hour >= 10 && hour < 17) return g.day;
  if (hour >= 17 && hour < 23) return g.evening;
  return g.night;
}

/** Diary heading: "Tänään", "Eilen", "Huomenna" or e.g. "torstai 30.10.". */
export function diaryDayLabel(value: LocalDate, now: LocalDate = today()): string {
  if (value === now) return strings.dates.today;
  if (value === addDays(now, -1)) return strings.dates.yesterday;
  if (value === addDays(now, 1)) return strings.dates.tomorrow;
  return longDate(value);
}
