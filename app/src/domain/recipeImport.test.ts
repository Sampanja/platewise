import { describe, expect, it } from '@jest/globals';

import { INGREDIENTS_BY_ID } from '@/data/catalog';
import { importedAsRecipe, importWarnings } from '@/data/catalog/imported';
import { matchIngredientLines, normalizeUrl, sourceHost } from '@/services/recipeImport';

import { extractRecipeFromHtml, parseIsoDuration, parseYield } from './recipeImport';

const page = (jsonLd: unknown) =>
  `<html><head><title>x</title><script type="application/ld+json">${JSON.stringify(jsonLd)}</script></head><body>…</body></html>`;

describe('JSON-LD recipes', () => {
  it('reads a plain Recipe', () => {
    const draft = extractRecipeFromHtml(
      page({
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: 'Lohikeitto &amp; tilli',
        recipeYield: '4 annosta',
        prepTime: 'PT15M',
        cookTime: 'PT25M',
        recipeIngredient: ['400 g lohta', '2 dl kermaa', '1 sipuli'],
        recipeInstructions: [{ '@type': 'HowToStep', text: 'Kuori perunat.' }, { '@type': 'HowToStep', text: 'Keitä.' }],
      }),
    );
    expect(draft).toEqual({
      title: 'Lohikeitto & tilli',
      servings: 4,
      totalTimeMin: 40,
      activeTimeMin: 15,
      ingredientLines: ['400 g lohta', '2 dl kermaa', '1 sipuli'],
      steps: ['Kuori perunat.', 'Keitä.'],
    });
  });

  it('finds the Recipe inside @graph and reads sections', () => {
    const draft = extractRecipeFromHtml(
      page({
        '@graph': [
          { '@type': 'WebPage', name: 'Page' },
          {
            '@type': ['Recipe', 'Thing'],
            name: 'Pancakes',
            recipeYield: ['8', '8 pancakes'],
            totalTime: 'PT1H5M',
            recipeIngredient: ['2 cups flour'],
            recipeInstructions: [{ '@type': 'HowToSection', name: 'Batter', itemListElement: [{ '@type': 'HowToStep', text: 'Mix.' }] }],
          },
        ],
      }),
    );
    expect(draft?.title).toBe('Pancakes');
    expect(draft?.servings).toBe(8);
    expect(draft?.totalTimeMin).toBe(65);
    expect(draft?.steps).toEqual(['Mix.']);
  });

  it('returns null without a recipe, and survives broken JSON', () => {
    expect(extractRecipeFromHtml('<html><body>No data</body></html>')).toBeNull();
    expect(extractRecipeFromHtml('<script type="application/ld+json">{oops</script>')).toBeNull();
  });

  it('parses durations and yields', () => {
    expect(parseIsoDuration('PT1H30M')).toBe(90);
    expect(parseIsoDuration('P0DT45M')).toBe(45);
    expect(parseIsoDuration('soon')).toBeNull();
    expect(parseYield('serves 6')).toBe(6);
    expect(parseYield(undefined)).toBe(4);
  });
});

describe('links', () => {
  it('finds the link in shared text and names the site', () => {
    expect(normalizeUrl('Katso tämä: https://www.example.com/resepti/1 hyvää!')).toBe('https://www.example.com/resepti/1');
    expect(normalizeUrl('example.com/r')).toBe('https://example.com/r');
    expect(normalizeUrl('ei linkkiä')).toBeNull();
    expect(sourceHost('https://www.example.com/a')).toBe('example.com');
  });
});

describe('ingredient lines to the ingredient table', () => {
  it('matches Finnish and English lines with amounts in grams', () => {
    const [cream, onion, mince] = matchIngredientLines(['2 dl kermaa', '1 sipuli, hienonnettuna', '400 g minced beef']);
    expect(cream).toMatchObject({ ingredientId: 'cream', grams: 200 });
    expect(onion.ingredientId).toBe('onion');
    expect(onion.grams).toBe((INGREDIENTS_BY_ID.onion.display as { grams: number }).grams);
    expect(mince).toMatchObject({ ingredientId: 'minced-beef', grams: 400 });
  });

  it('keeps unknown lines for the review and gives staples a pinch', () => {
    const [unknown, salt] = matchIngredientLines(['xqzzv-jauhe', 'suolaa']);
    expect(unknown).toMatchObject({ ingredientId: null, grams: null });
    expect(salt.ingredientId).toBe('salt');
    expect(salt.grams).toBe(5);
  });
});

describe('imported recipes as recipes', () => {
  const imported = {
    id: 'x',
    title: 'Kermainen lohikeitto',
    sourceUrl: 'https://example.com',
    servings: 4,
    totalTimeMin: 40,
    activeTimeMin: 15,
    ingredients: matchIngredientLines(['2 dl kermaa', '400 g lohta', '1 dl saksanpähkinöitä murskattuna']),
    steps: ['Keitä.'],
    createdAt: '',
  };

  it('computes per-serving nutrition from matched ingredients', () => {
    const recipe = importedAsRecipe(imported);
    expect(recipe.perServing.kcal).toBeGreaterThan(100);
    expect(recipe.dishType).toBe('soup');
    expect(recipe.id).toBe('imp:x');
  });

  it('warns about the user’s allergens, also from words in any language', () => {
    expect(importWarnings(imported, { allergens: ['milk', 'nuts'], diets: [] }).allergens.sort()).toEqual(['milk', 'nuts']);
    const english = { ...imported, ingredients: [{ line: 'a handful of walnuts', ingredientId: null, grams: null, confidence: 0 }] };
    expect(importWarnings(english, { allergens: ['nuts'], diets: [] }).allergens).toEqual(['nuts']);
    expect(importWarnings(imported, { allergens: [], diets: ['vegan'] }).diets).toEqual(['vegan']);
  });
});
