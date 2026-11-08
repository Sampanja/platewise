import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { deviceStorage, STORAGE_PREFIX } from '../storage';
import type { MealPlan, PlanAnswers, Proposal, ProposalMeal } from '../types';

/** Shopping list state that lives on the device: ticks and extra recipes. */
export type ShoppingState = {
  /** Ticked ingredient ids. */
  checked: string[];
  /** Recipes added with "Lisää ostoslistaan", on top of the plan's dinners. */
  extras: { recipeId: string; servings: number }[];
};

/** Shopping list used when there is no active plan. */
export const STANDALONE_LIST = 'standalone';

const EMPTY_SHOPPING: ShoppingState = { checked: [], extras: [] };

/**
 * Local plan repository (`meal_plans`, `meal_plan_items`, `shopping_list_items`).
 * Pure state: computing plans, totals and lists happens in `src/domain`.
 */
type PlansState = {
  plans: MealPlan[];
  proposal: Proposal | null;
  /** Previous questionnaire answers, used to prefill the next one. */
  lastAnswers: PlanAnswers | null;
  /** Recipes chosen with "Lisää suunnitelmaan" before a plan exists; the next proposal keeps them. */
  pinnedRecipeIds: string[];
  shopping: Record<string, ShoppingState>;

  setProposal: (proposal: Proposal | null) => void;
  setProposalMeals: (meals: ProposalMeal[]) => void;
  setLastAnswers: (answers: PlanAnswers) => void;
  savePlan: (plan: MealPlan) => void;
  pinRecipe: (recipeId: string) => void;
  clearPinned: () => void;
  toggleChecked: (listId: string, ingredientId: string) => void;
  clearChecked: (listId: string) => void;
  addExtra: (listId: string, recipeId: string, servings: number) => void;
  removeExtra: (listId: string, recipeId: string) => void;
  reset: () => void;
};

function updateList(
  shopping: Record<string, ShoppingState>,
  listId: string,
  update: (list: ShoppingState) => ShoppingState,
): Record<string, ShoppingState> {
  return { ...shopping, [listId]: update(shopping[listId] ?? EMPTY_SHOPPING) };
}

export const usePlansStore = create<PlansState>()(
  persist(
    (set) => ({
      plans: [],
      proposal: null,
      lastAnswers: null,
      pinnedRecipeIds: [],
      shopping: {},

      setProposal: (proposal) => set({ proposal }),
      setProposalMeals: (meals) =>
        set((state) => (state.proposal ? { proposal: { ...state.proposal, meals } } : state)),
      setLastAnswers: (answers) => set({ lastAnswers: answers }),
      savePlan: (plan) =>
        set((state) => ({
          plans: [...state.plans.filter((p) => p.id !== plan.id), plan],
        })),
      pinRecipe: (recipeId) =>
        set((state) => ({
          pinnedRecipeIds: state.pinnedRecipeIds.includes(recipeId)
            ? state.pinnedRecipeIds
            : [...state.pinnedRecipeIds, recipeId],
        })),
      clearPinned: () => set({ pinnedRecipeIds: [] }),
      toggleChecked: (listId, ingredientId) =>
        set((state) => ({
          shopping: updateList(state.shopping, listId, (list) => ({
            ...list,
            checked: list.checked.includes(ingredientId)
              ? list.checked.filter((id) => id !== ingredientId)
              : [...list.checked, ingredientId],
          })),
        })),
      clearChecked: (listId) =>
        set((state) => ({
          shopping: updateList(state.shopping, listId, (list) => ({ ...list, checked: [] })),
        })),
      addExtra: (listId, recipeId, servings) =>
        set((state) => ({
          shopping: updateList(state.shopping, listId, (list) => ({
            ...list,
            extras: [...list.extras.filter((e) => e.recipeId !== recipeId), { recipeId, servings }],
          })),
        })),
      removeExtra: (listId, recipeId) =>
        set((state) => ({
          shopping: updateList(state.shopping, listId, (list) => ({
            ...list,
            extras: list.extras.filter((e) => e.recipeId !== recipeId),
          })),
        })),
      reset: () =>
        set({ plans: [], proposal: null, lastAnswers: null, pinnedRecipeIds: [], shopping: {} }),
    }),
    { name: `${STORAGE_PREFIX}plans`, storage: deviceStorage, version: 1 },
  ),
);

export function shoppingStateOf(
  shopping: Record<string, ShoppingState>,
  listId: string,
): ShoppingState {
  return shopping[listId] ?? EMPTY_SHOPPING;
}
