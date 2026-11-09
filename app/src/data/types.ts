import type { LocalDate } from '@/lib/dates';

/**
 * App-side domain types. They mirror docs/DATA_MODEL.md in camelCase; the
 * Supabase layer will map snake_case rows to these when it replaces the
 * local test data.
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

/** EU's 14 mandatory allergen groups (`allergens.code`). */
export type AllergenCode =
  | 'gluten'
  | 'crustaceans'
  | 'egg'
  | 'fish'
  | 'peanut'
  | 'soy'
  | 'milk'
  | 'nuts'
  | 'celery'
  | 'mustard'
  | 'sesame'
  | 'sulphites'
  | 'lupin'
  | 'molluscs';

/** Diets (`diets.code`). Gluten-free is an allergy (`gluten`), not a diet. */
export type DietCode = 'vegetarian' | 'vegan' | 'pescatarian' | 'lactose_free';

/** Diet-check tags on ingredients (`ingredient_tags.tag`). Not allergens. */
export type IngredientTag =
  | 'meat'
  | 'pork'
  | 'beef'
  | 'poultry'
  | 'fish'
  | 'seafood'
  | 'egg'
  | 'dairy'
  | 'lactose'
  | 'honey';

/** Store chains with their own price level. S and K groups share a level across store sizes. */
export type ChainCode = 'lidl' | 's_group' | 'k_group' | 'tokmanni';

/** Store sections, in the order a typical Finnish grocery store is walked. */
export type AisleCode =
  | 'produce'
  | 'bread'
  | 'meat'
  | 'fish'
  | 'dairy'
  | 'frozen'
  | 'dry'
  | 'canned'
  | 'spices';

/** "Mitä tekee mieli" choices in the questionnaire. Wishes, not rules. */
export type CravingCode =
  | 'chicken'
  | 'fish'
  | 'minced'
  | 'vegetarian'
  | 'pasta'
  | 'soup'
  | 'asian'
  | 'mexican'
  | 'quick'
  | 'oven';

/** Per-serving (or per-100 g) energy and macros. Always from Fineli, never from the AI. */
export type Macros = {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export type StoreChain = {
  code: ChainCode;
  name: string;
  /** Price level relative to the base price table (1.0). */
  priceMultiplier: number;
};

/** How an ingredient amount is shown to people. Amounts are always stored in grams. */
export type AmountDisplay =
  | { kind: 'weight' }
  | { kind: 'liquid' }
  | { kind: 'piece'; grams: number; one: string; many: string };

export type Ingredient = {
  id: string;
  name: string;
  aisle: AisleCode;
  /** Stand-in for the linked Fineli food. */
  per100g: Macros;
  /** Base price (multiplier 1.0), cents per kg. */
  pricePerKgCents: number;
  /** Smallest package sold, in grams. Shopping lists round up to whole packages. */
  packageG: number;
  /** Optional package name, e.g. "1 ruukku". */
  packageLabel?: string;
  allergens: readonly AllergenCode[];
  tags: readonly IngredientTag[];
  /** `default`: in every new profile's pantry. `eligible`: user may add it. */
  pantry: 'default' | 'eligible' | 'no';
  display: AmountDisplay;
};

export type RecipeIngredient = {
  ingredientId: string;
  /** Grams for one serving. */
  grams: number;
};

/** Recipe as stored: ingredients and steps. Everything else is derived. */
export type RecipeSource = {
  id: string;
  title: string;
  description: string;
  cookTimeMin: number;
  dishType: DishType;
  cuisine: Cuisine;
  mainProtein: MainProtein;
  /** Cooked in the oven (questionnaire wish "uunissa"). */
  oven: boolean;
  goodForLeftovers: boolean;
  /** Null while the image is still being generated. */
  imageUrl: string | null;
  ingredients: readonly RecipeIngredient[];
  steps: readonly string[];
};

/** Recipe with fields the backend derives from ingredient data. */
export type Recipe = RecipeSource & {
  perServing: Macros;
  allergens: readonly AllergenCode[];
  tags: readonly IngredientTag[];
  /** Base price per serving (multiplier 1.0) without pantry staples, in cents. */
  baseCostPerServingCents: number;
};

/** A food in the diary search list (Fineli stand-in). */
export type FoodPortion = { label: string; grams: number };

export type Food = {
  id: string;
  name: string;
  category: FoodCategory;
  per100g: Macros;
  portions: readonly FoodPortion[];
};

export type FoodCategory =
  | 'bread'
  | 'dairy'
  | 'meat'
  | 'produce'
  | 'fruit'
  | 'meal'
  | 'drink'
  | 'snack'
  | 'fat';

export type MealSlot = 'dinner' | 'lunch';

export type PlanMeal = {
  dayOffset: number;
  slot: MealSlot;
  recipeId: string;
  servings: number;
  /** Dinner: chain-adjusted cost of its servings incl. doubling. Lunch: always 0. */
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
  chainCode: ChainCode;
  /** Shopping list total in whole packages: the number compared with the budget. */
  estimatedTotalCents: number;
  status: PlanStatus;
  acceptedAt: string | null;
  meals: PlanMeal[];
  /** Allergies and diets added for this plan only (on top of the profile's). */
  extraAllergens: AllergenCode[];
  extraDiets: DietCode[];
};

/** Answers of the Suunnittele questionnaire. */
export type PlanAnswers = {
  budgetCents: number;
  eaters: number;
  mealCount: number;
  cookDouble: boolean;
  extraAllergens: AllergenCode[];
  extraDiets: DietCode[];
  cravings: CravingCode[];
  chainCode: ChainCode;
};

export type ProposalMeal = {
  dayOffset: number;
  recipeId: string;
  locked: boolean;
  /** Ready-made alternatives for "Vaihda", in order. */
  alternatives: string[];
};

/** A generated plan waiting for the user's approval. */
export type Proposal = {
  id: string;
  createdAt: string;
  startDate: LocalDate;
  answers: PlanAnswers;
  meals: ProposalMeal[];
};

export type NutritionGoals = Macros;

export type DiaryMeal = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/** What a diary entry's macros are computed from. */
export type DiaryBasis =
  | { kind: 'food'; foodId: string; per100g: Macros }
  | { kind: 'recipe'; recipeId: string; perServing: Macros }
  /** "Pikalisäys": calories only, no food; quantity is the kcal. */
  | { kind: 'quick' };

export type DiaryEntry = {
  id: string;
  date: LocalDate;
  meal: DiaryMeal;
  name: string;
  basis: DiaryBasis;
  /** Grams for foods, servings for recipes, kcal for quick entries. */
  quantity: number;
  /** Added from photo recognition: shown with the label "arvio". */
  estimate: boolean;
  createdAt: string;
};

/** A day's eaten macros against the user's goals. */
export type DayNutrition = {
  date: LocalDate;
  eaten: Macros;
  goals: NutritionGoals;
};
