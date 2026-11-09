import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { DEFAULT_GOALS, MIN_KCAL_GOAL, normalizeChainCode } from '../catalog/reference';
import { DEFAULT_PANTRY } from '../catalog/ingredients';
import { deviceStorage, STORAGE_PREFIX } from '../storage';
import type { ActivityLevel, GoalType, PregnancyStatus, Sex } from '@/domain/energy';

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
};

export const DEFAULT_BODY: BodyProfile = {
  sex: null,
  birthYear: null,
  heightCm: null,
  weightKg: null,
  activity: 2,
  exercisePerWeek: 2,
  pregnancy: 'none',
};

export const DEFAULT_WEIGHT_GOAL: WeightGoal = {
  type: 'maintain',
  rateKgPerWeek: 0.5,
  targetWeightKg: null,
  startWeightKg: null,
  setAt: null,
  manualMacros: false,
};

export type Profile = {
  name: string;
  householdSize: number;
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
  onboardingCompleted: boolean;
};

export const DEFAULT_PROFILE: Profile = {
  name: '',
  householdSize: 2,
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
    { name: `${STORAGE_PREFIX}profile`, storage: deviceStorage, version: 3, migrate: (persisted) => {
        const saved = persisted as Partial<Profile>;
        return { ...DEFAULT_PROFILE, ...saved, chainCode: normalizeChainCode(saved.chainCode) };
      } },
  ),
);
