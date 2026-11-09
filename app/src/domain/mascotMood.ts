/**
 * What the mascot says on the home screen. Pure and rule based. It
 * encourages habits (logging, water, cooking) and never comments on eating
 * less, weight or calories.
 */
export type MoodState = 'idle' | 'happy' | 'cooking' | 'sleepy' | 'encouraging' | 'celebrating';

export type GreetingKey =
  | 'morning'
  | 'day'
  | 'evening'
  | 'night'
  | 'streak'
  | 'loggedToday'
  | 'waterDone'
  | 'cookTonight'
  | 'welcomeBack';

export type GreetingInput = {
  hour: number;
  /** Diary entries today. */
  loggedToday: number;
  streak: number;
  waterGoalReached: boolean;
  /** A dinner from the plan is on the menu today. */
  dinnerPlanned: boolean;
  /** Days since the last diary entry (0 = today, null = never). */
  daysAway: number | null;
};

export function mascotGreeting(input: GreetingInput): { state: MoodState; key: GreetingKey } {
  const { hour } = input;
  if (input.daysAway !== null && input.daysAway >= 3) return { state: 'happy', key: 'welcomeBack' };
  if (hour >= 23 || hour < 5) return { state: 'sleepy', key: 'night' };
  if (input.streak >= 3 && input.loggedToday > 0 && input.streak % 7 === 0) return { state: 'celebrating', key: 'streak' };
  if (input.waterGoalReached) return { state: 'happy', key: 'waterDone' };
  if (input.dinnerPlanned && hour >= 15 && hour < 20) return { state: 'cooking', key: 'cookTonight' };
  if (input.loggedToday > 0 && hour >= 11) return { state: 'encouraging', key: 'loggedToday' };
  if (hour < 11) return { state: 'idle', key: 'morning' };
  if (hour < 18) return { state: 'idle', key: 'day' };
  return { state: 'idle', key: 'evening' };
}
