import { afterEach, describe, expect, it } from '@jest/globals';

import { setActiveLanguage } from '@/i18n/locale';

import { catalogName } from '.';

afterEach(() => setActiveLanguage('fi'));

describe('catalogName', () => {
  it('follows the active language for catalog foods and recipes', () => {
    const food = { kind: 'food', foodId: 'banana' } as const;
    const recipe = { kind: 'recipe', recipeId: 'salmon-coconut' } as const;
    expect(catalogName(food, 'Banaani')).toBe('Banaani');
    setActiveLanguage('en');
    expect(catalogName(food, 'Banaani')).toBe('Banana');
    expect(catalogName(recipe, 'Lohi kookoskastikkeessa')).toBe('Salmon in coconut sauce');
    setActiveLanguage('sv');
    expect(catalogName(recipe, 'Lohi kookoskastikkeessa')).toBe('Lax i kokossås');
  });

  it('keeps the saved name for own foods, own recipes and quick adds', () => {
    setActiveLanguage('en');
    expect(catalogName({ kind: 'food', foodId: 'own-123' }, 'Mummon pulla')).toBe('Mummon pulla');
    expect(catalogName({ kind: 'recipe', recipeId: 'own-recipe-1' }, 'Oma keitto')).toBe('Oma keitto');
    expect(catalogName({ kind: 'quick' }, 'Lounas ravintolassa')).toBe('Lounas ravintolassa');
  });
});
