import type { RecipeCardData } from '@/components/RecipeCard';

/** Test data for the design showcase. Not real Fineli or price data. */
export const sampleRecipe: RecipeCardData = {
  id: 'sample-chicken-tomato-pan',
  title: 'Tomaattinen kanapannu basilikalla',
  description: 'Mehevää broileria, paahdettua tomaattia ja tuoretta basilikaa yhdessä pannussa.',
  cookTimeMin: 25,
  servings: 2,
  kcalPerServing: 540,
  proteinGPerServing: 42,
  carbsGPerServing: 38,
  fatGPerServing: 22,
  priceEstimateCents: 840,
  goodForLeftovers: true,
  imageUrl:
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1080&q=80&auto=format&fit=crop',
};

export const sampleShoppingList = [
  { id: 'chicken', label: 'Broilerin rintafilee', detail: '400 g' },
  { id: 'tomato', label: 'Kirsikkatomaatit', detail: '250 g' },
  { id: 'basil', label: 'Basilika, ruukku', detail: '1 kpl' },
  { id: 'rice', label: 'Jasmiiniriisi', detail: '200 g' },
];

export const sampleBudget = { usedCents: 3260, totalCents: 5000 };
