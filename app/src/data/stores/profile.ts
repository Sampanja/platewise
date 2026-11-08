import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { DEFAULT_GOALS, MIN_KCAL_GOAL } from '../catalog/reference';
import { DEFAULT_PANTRY } from '../catalog/ingredients';
import { deviceStorage, STORAGE_PREFIX } from '../storage';
import type { AllergenCode, ChainCode, DietCode, NutritionGoals } from '../types';

/**
 * Local profile repository (`profiles`, `profile_allergens`, `profile_diets`,
 * `profile_pantry_items`, `profile_nutrition_goals`). Allergies, diets, goals
 * and the diary are health data: they never go to logs or analytics.
 */
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
  chainCode: 'prisma',
  goals: { ...DEFAULT_GOALS },
  hasCalorieGoal: false,
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
      setGoals: (goals) =>
        set({ goals: { ...goals, kcal: Math.max(MIN_KCAL_GOAL, Math.round(goals.kcal)) } }),
      toggleAllergen: (code) => set((state) => ({ allergens: toggle(state.allergens, code) })),
      toggleDiet: (code) => set((state) => ({ diets: toggle(state.diets, code) })),
      togglePantry: (id) => set((state) => ({ pantry: toggle(state.pantry, id) })),
      reset: () => set({ ...DEFAULT_PROFILE, pantry: [...DEFAULT_PANTRY] }),
    }),
    { name: `${STORAGE_PREFIX}profile`, storage: deviceStorage, version: 1 },
  ),
);
