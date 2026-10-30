import type { LocalDate } from '@/lib/dates';

/**
 * App-side domain types. They mirror docs/DATA_MODEL.md in camelCase; the
 * Supabase layer will map snake_case rows to these when it replaces the mocks.
 */

export type DishType =
  | 'soup'
  | 'stew'
  | 'pasta'
  | 'rice'
  | 'potato'
  | 'oven'
  | 'stir_fry'
  | 'salad'
  | 'bowl'
  | 'wrap'
  | 'other';

export type Cuisine =
  | 'finnish'
  | 'nordic'
  | 'italian'
  | 'asian'
  | 'mexican'
  | 'middle_eastern'
  | 'indian'
  | 'other';

export type MainProtein =
  | 'chicken'
  | 'beef'
  | 'pork'
  | 'minced_meat'
  | 'fish'
  | 'seafood'
  | 'egg'
  | 'dairy'
  | 'legumes'
  | 'tofu'
  | 'none';

/** Per-serving macros, always computed from Fineli (never from the AI). */
export type Macros = {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  cookTimeMin: number;
  dishType: DishType;
  cuisine: Cuisine;
  mainProtein: MainProtein;
  perServing: Macros;
  /** Price at chain multiplier 1.0; the shown estimate is chain-adjusted. */
  baseCostPerServingCents: number;
  goodForLeftovers: boolean;
  /** Null while the image is still being generated. */
  imageUrl: string | null;
};

export type MealSlot = 'dinner' | 'lunch';

export type PlanMeal = {
  dayOffset: number;
  slot: MealSlot;
  recipeId: string;
  servings: number;
  /** Dinner: share of the shopping list incl. doubling. Lunch: always 0. */
  costCents: number;
  cookDouble: boolean;
};

export type PlanStatus = 'generating' | 'proposed' | 'accepted' | 'failed';

export type MealPlan = {
  id: string;
  kind: 'week' | 'trip';
  startDate: LocalDate;
  mealCount: number;
  householdSize: number;
  budgetCents: number;
  chainCode: string;
  /** Shopping list total in whole packages: the number compared with the budget. */
  estimatedTotalCents: number;
  status: PlanStatus;
  acceptedAt: string | null;
  meals: PlanMeal[];
};

export type NutritionGoals = Macros;

export type DayNutrition = {
  date: LocalDate;
  /** Sum of diary entries for the day. */
  eaten: Macros;
  goals: NutritionGoals;
};
