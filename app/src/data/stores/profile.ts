import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { DEFAULT_GOALS, MIN_KCAL_GOAL, normalizeChainCode } from '../catalog/reference';
import { DEFAULT_PANTRY } from '../catalog/ingredients';
import { dropHouseholdSize } from '../migrations';
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
import { DEFAULT_CHARACTER, isCharacterId, type CharacterId } from '@/theme/characters';
import type { ThemePreference } from '@/theme/colors';

import type { AllergenCode, ChainCode, DietCode, NutritionGoals } from '../types';

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
  weeklyBudgetCents: number;
  allergens: AllergenCode[];
  diets: DietCode[];
  /** Ingredient ids the user always has at home. */
  pantry: string[];
  chainCode: ChainCode;
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
  chainCode: 's_group',
  goals: { ...DEFAULT_GOALS },
  hasCalorieGoal: false,
  body: { ...DEFAULT_BODY },
  weightGoal: { ...DEFAULT_WEIGHT_GOAL },
  hideCalories: false,
  hapticsEnabled: true,
  themePreference: 'system',
  characterId: DEFAULT_CHARACTER,
  characterChosen: false,
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
      reset: () =>
        set({
          ...DEFAULT_PROFILE,
          pantry: [...DEFAULT_PANTRY],
          body: { ...DEFAULT_BODY },
          weightGoal: { ...DEFAULT_WEIGHT_GOAL },
        }),
    }),
    {
      name: `${STORAGE_PREFIX}profile`,
      storage: deviceStorage,
      version: 6,
      // v4: body and goal got new fields (body fat, steps, workouts, diet style, cycling, adaptive check-in).
      // v5: the household size was removed (single-person app; eaters are chosen per plan).
      // v6: characters; earlier users keep Nuppu, unknown ids fall back to it.
      migrate: (persisted) => {
        const saved = dropHouseholdSize((persisted ?? {}) as Partial<Profile>);
        return {
          ...DEFAULT_PROFILE,
          ...saved,
          chainCode: normalizeChainCode(saved.chainCode),
          characterId: isCharacterId(saved.characterId) ? saved.characterId : DEFAULT_CHARACTER,
          // People who already finished onboarding are not sent back to the picker.
          characterChosen: saved.characterChosen ?? saved.onboardingCompleted ?? false,
          body: { ...DEFAULT_BODY, ...saved.body },
          weightGoal: { ...DEFAULT_WEIGHT_GOAL, ...saved.weightGoal },
        };
      },
    },
  ),
);
