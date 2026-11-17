import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { DEFAULT_GOALS, MIN_KCAL_GOAL } from '../catalog/reference';
import { DEFAULT_PANTRY } from '../catalog/ingredients';
import { dropHouseholdSize, profileWithoutStore, withLanguageSettings, withUnitPrefs } from '../migrations';
import { deviceStorage, STORAGE_PREFIX } from '../storage';
import {
  DEFAULT_CYCLING,
  type ActivityLevel,
  type Cycling,
  type DietStyle,
  type GoalType,
  type PregnancyStatus,
  type Sex,
  type Workout,
} from '@/domain/energy';
import { migrateCharacter } from '@/domain/characterMigration';
import { convertBudget, DEFAULT_PRICE_REGION, type PriceRegionCode } from '@/domain/priceRegion';
import { defaultUnits, type UnitPrefs } from '@/domain/units';
import { deviceLocale } from '@/lib/deviceLocale';
import type { Language } from '@/i18n/languages';
import { DEFAULT_CHARACTER, type CharacterId } from '@/theme/characters';
import type { ThemePreference } from '@/theme/colors';

import type { AllergenCode, DietCode, NutritionGoals } from '../types';

/**
 * Local profile repository (`profiles`, `profile_allergens`, `profile_diets`,
 * `profile_pantry_items`, `profile_nutrition_goals`). Allergies, diets, goals
 * and the diary are health data: they never go to logs or analytics.
 */
/** Body details for the calorie calculator. Health data, stored on the device only. */
export type BodyProfile = {
  sex: Sex | null;
  birthYear: number | null;
  heightCm: number | null;
  /** Weight the current goal was calculated with. */
  weightKg: number | null;
  activity: ActivityLevel;
  exercisePerWeek: number;
  pregnancy: PregnancyStatus;
  /** Optional, enables the Katch–McArdle formula. */
  bodyFatPct: number | null;
  /** How everyday activity is given: type of work or average steps. */
  everydayMode: 'job' | 'steps';
  steps: number;
  /** Workouts by type; when empty, exercisePerWeek is used. */
  workouts: Workout[];
};

export type WeightGoal = {
  type: GoalType;
  rateKgPerWeek: number;
  targetWeightKg: number | null;
  /** Weight when the goal was set, for progress. */
  startWeightKg: number | null;
  setAt: string | null;
  /** Macros were adjusted by hand after the calculator. */
  manualMacros: boolean;
  dietStyle: DietStyle;
  cycling: Cycling;
  /** Expenditure measured from the user's own data (weekly check-in), or null for the formula. */
  adaptiveTdee: number | null;
  /** Date of the last weekly check-in decision (applied or kept). */
  lastCheckIn: string | null;
};

export const DEFAULT_BODY: BodyProfile = {
  sex: null,
  birthYear: null,
  heightCm: null,
  weightKg: null,
  activity: 2,
  exercisePerWeek: 2,
  pregnancy: 'none',
  bodyFatPct: null,
  everydayMode: 'job',
  steps: 7000,
  workouts: [],
};

export const DEFAULT_WEIGHT_GOAL: WeightGoal = {
  type: 'maintain',
  rateKgPerWeek: 0.5,
  targetWeightKg: null,
  startWeightKg: null,
  setAt: null,
  manualMacros: false,
  dietStyle: 'balanced',
  cycling: { ...DEFAULT_CYCLING },
  adaptiveTdee: null,
  lastCheckIn: null,
};

export type Profile = {
  name: string;
  /** In minor units of `budgetRegion`'s currency. */
  weeklyBudgetCents: number;
  allergens: AllergenCode[];
  diets: DietCode[];
  /** Ingredient ids the user always has at home. */
  pantry: string[];
  /**
   * Price region chosen in Profile, or null to follow the phone's region
   * (data/hooks.ts `usePriceRegion`).
   */
  priceRegion: PriceRegionCode | null;
  /** UI language; null until chosen = the phone's language (data/hooks.ts `useLanguage`). */
  language: Language | null;
  /** The language picker has been seen (very first screen). */
  languageChosen: boolean;
  /**
   * Display units, each chosen separately (domain/units.ts). null only before
   * the units screen of onboarding: the phone's region suggests them (data/hooks.ts `useUnits`).
   */
  units: UnitPrefs | null;
  /** The units screen has been confirmed (second screen of onboarding). */
  unitsChosen: boolean;
  /** The region whose currency the saved budgets are in; budgets are converted when the region changes. */
  budgetRegion: PriceRegionCode;
  goals: NutritionGoals;
  /** Calorie goal chosen in onboarding or profile; diary works without it too. */
  hasCalorieGoal: boolean;
  body: BodyProfile;
  weightGoal: WeightGoal;
  /** "Piilota kalorit": the diary shows meals without numbers. */
  hideCalories: boolean;
  hapticsEnabled: boolean;
  /** Light, dark or follow the phone. */
  themePreference: ThemePreference;
  /** The chosen character: sets the colour theme, voice and mascot. */
  characterId: CharacterId;
  /** The picker has been seen (first screen of onboarding). */
  characterChosen: boolean;
  /** The saved character was retired and replaced; Koti tells the user once, then clears this. */
  characterRenewed: boolean;
  /** XP, streaks, quests, achievements and celebrations. Can be turned off. */
  gamificationEnabled: boolean;
  /** The assistant may read today's diary and goals (asked in the chat, revocable). */
  chatShareConsent: boolean;
  onboardingCompleted: boolean;
};

export const DEFAULT_PROFILE: Profile = {
  name: '',
  weeklyBudgetCents: 7500,
  allergens: [],
  diets: [],
  pantry: [...DEFAULT_PANTRY],
  priceRegion: null,
  language: null,
  languageChosen: false,
  units: null,
  unitsChosen: false,
  budgetRegion: DEFAULT_PRICE_REGION,
  goals: { ...DEFAULT_GOALS },
  hasCalorieGoal: false,
  body: { ...DEFAULT_BODY },
  weightGoal: { ...DEFAULT_WEIGHT_GOAL },
  hideCalories: false,
  hapticsEnabled: true,
  themePreference: 'system',
  characterId: DEFAULT_CHARACTER,
  characterChosen: false,
  characterRenewed: false,
  gamificationEnabled: true,
  chatShareConsent: false,
  onboardingCompleted: false,
};

type ProfileState = Profile & {
  update: (patch: Partial<Profile>) => void;
  setGoals: (goals: NutritionGoals) => void;
  toggleAllergen: (code: AllergenCode) => void;
  toggleDiet: (code: DietCode) => void;
  togglePantry: (ingredientId: string) => void;
  /** Converts the weekly budget to another region's currency and price level. */
  alignBudgetTo: (region: PriceRegionCode) => void;
  reset: () => void;
};

function toggle<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      ...DEFAULT_PROFILE,
      update: (patch) => set(patch),
      // The calorie floor is 1 200 kcal, or 1 500 kcal for men (domain/energy.ts).
      setGoals: (goals) =>
        set((state) => ({
          goals: {
            ...goals,
            kcal: Math.max(state.body.sex === 'male' ? 1500 : MIN_KCAL_GOAL, Math.round(goals.kcal)),
          },
        })),
      toggleAllergen: (code) => set((state) => ({ allergens: toggle(state.allergens, code) })),
      toggleDiet: (code) => set((state) => ({ diets: toggle(state.diets, code) })),
      togglePantry: (id) => set((state) => ({ pantry: toggle(state.pantry, id) })),
      alignBudgetTo: (region) =>
        set((state) =>
          state.budgetRegion === region
            ? state
            : { weeklyBudgetCents: convertBudget(state.weeklyBudgetCents, state.budgetRegion, region), budgetRegion: region },
        ),
      // The language stays (the picker opens again with it preselected), so the app doesn't switch language under the user.
      reset: () =>
        set((state) => ({
          ...DEFAULT_PROFILE,
          language: state.language,
          pantry: [...DEFAULT_PANTRY],
          body: { ...DEFAULT_BODY },
          weightGoal: { ...DEFAULT_WEIGHT_GOAL },
        })),
    }),
    {
      name: `${STORAGE_PREFIX}profile`,
      storage: deviceStorage,
      version: 10,
      // v4: body and goal got new fields (body fat, steps, workouts, diet style, cycling, adaptive check-in).
      // v5: the household size was removed (single-person app; eaters are chosen per plan).
      // v6: characters; earlier users keep Nuppu, unknown ids fall back to it.
      // v7: stores removed; earlier users keep the Finnish price region their budget is in.
      // v8: language and units; earlier users keep Finnish and skip the language picker.
      // v9: the cast was renewed (six international characters); retired ids map to the closest one.
      // v10: units are chosen one by one; the old metric/imperial setting (or the region's) becomes the user's own.
      migrate: (persisted, version) => {
        const device = deviceLocale();
        const saved = withUnitPrefs(
          withLanguageSettings(profileWithoutStore(dropHouseholdSize((persisted ?? {}) as Partial<Profile>), version), version),
          version,
          defaultUnits(device.measurementSystem, device.regionCode),
        );
        const character = migrateCharacter(saved.characterId);
        return {
          ...DEFAULT_PROFILE,
          ...saved,
          characterId: character.id,
          characterRenewed: character.changed || (saved.characterRenewed ?? false),
          // People who already finished onboarding are not sent back to the picker.
          characterChosen: saved.characterChosen ?? saved.onboardingCompleted ?? false,
          body: { ...DEFAULT_BODY, ...saved.body },
          weightGoal: { ...DEFAULT_WEIGHT_GOAL, ...saved.weightGoal },
        };
      },
    },
  ),
);
