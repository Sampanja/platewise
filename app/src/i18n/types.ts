import type { fi } from './fi';
import type { fiCharacters } from './fiCharacters';
import type { fiDiary } from './fiDiary';
import type { fiFun } from './fiFun';
import type { fiGoals } from './fiGoals';

/**
 * The shape of a string table with every literal widened to `string`, so a
 * translation must have exactly the Finnish keys but its own words. Arrays
 * keep their element shape; their lengths are checked in i18n/keys.test.ts.
 */
export type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : T extends object
      ? { readonly [K in keyof T]: Widen<T[K]> }
      : T;

export type Strings = Widen<typeof fi>;
export type DiaryStrings = Widen<typeof fiDiary>;
export type FunStrings = Widen<typeof fiFun>;
export type GoalStrings = Widen<typeof fiGoals>;
export type CharacterVoices = typeof fiCharacters;
