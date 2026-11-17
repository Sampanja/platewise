import { describe, expect, it } from '@jest/globals';

import { LANGUAGES } from './languages';
import { CHARACTER_VOICES, STRING_TABLES } from './registry';

/**
 * Amounts in the translation files follow the user's units: a string never
 * writes a unit after a number or placeholder ("{value} kcal", "5 dl",
 * "0,75 kg"). The caller formats the amount with lib/amounts.ts and passes it
 * in a placeholder. Only the unit tables themselves and the strings listed
 * below (with the reason) may contain unit symbols.
 */
const UNIT = String.raw`(?:kcal|kJ|kg|g|mg|µg|ml|dl|cl|l|cm|oz|lb|fl oz|cups?|°C|°F)`;
const NUMBER_OR_PLACEHOLDER_UNIT = new RegExp(String.raw`(?:\d|\})\s?${UNIT}(?![\p{L}\d])`, 'u');

const ALLOWED: Readonly<Record<string, string>> = {
  units: 'the unit table',
  unitNames: 'the unit table',
  'unitSystems.metricHint': 'names the units of the choice',
  'unitSystems.imperialHint': 'names the units of the choice',
  'legal.sourcesBody': 'source citation (Fineli converts kJ to kcal)',
  'nutrientInfo.sourceLong': 'source citation (NNR2023 limits in grams)',
  'micros.fiberRef': 'nutrients are grams in every unit system, as on nutrition labels',
  'micros.saltRef': 'nutrients are grams in every unit system, as on nutrition labels',
  'home.macroOfGoal': 'macros are grams in every unit system, as on nutrition labels',
  'reports.macroValue': 'macros are grams in every unit system, as on nutrition labels',
  'reports.macroGoal': 'macros are grams in every unit system, as on nutrition labels',
  'goals2.styles.lowCarb.what': 'a carbohydrate amount in nutrient grams',
  'goals2.styles.keto.what': 'a carbohydrate amount in nutrient grams',
  'macroPlan.proteinLevels': 'protein is given in g per kg of body weight, the standard in nutrition science',
  'macroPlan.warnings.proteinHigh': 'protein is given in g per kg of body weight, the standard in nutrition science',
  'customFood.body': 'nutrition labels give values per 100 g',
  'customFood.per100': 'nutrition labels give values per 100 g',
  'nutrients.title': 'nutrition labels give values per 100 g',
  'camera.tips.label': 'nutrition labels give values per 100 g',
  'textLog.hint': 'examples of what the user can type (the parser reads metric units)',
  'recipeImport.linesPlaceholder': 'example lines of a recipe to paste',
};

function leaves(node: unknown, path = ''): [string, string][] {
  if (typeof node === 'string') return [[path, node]];
  if (Array.isArray(node)) return node.flatMap((item, index) => leaves(item, `${path}[${index}]`));
  if (typeof node === 'object' && node !== null) {
    return Object.entries(node).flatMap(([key, child]) => leaves(child, path ? `${path}.${key}` : key));
  }
  return [];
}

const allowed = (path: string) =>
  Object.keys(ALLOWED).some((prefix) => path === prefix || path.startsWith(`${prefix}.`) || path.startsWith(`${prefix}[`));

describe('the allowed list', () => {
  it('names only strings that exist', () => {
    const paths = leaves(STRING_TABLES.fi).map(([path]) => path);
    const stale = Object.keys(ALLOWED).filter((prefix) => !paths.some((path) => path === prefix || path.startsWith(`${prefix}.`)));
    expect(stale).toEqual([]);
  });
});

describe.each(LANGUAGES)('%s strings', (lang) => {
  it('leave units to the formatting helpers', () => {
    const offending = leaves(STRING_TABLES[lang])
      .filter(([path, text]) => !allowed(path) && NUMBER_OR_PLACEHOLDER_UNIT.test(text))
      .map(([path, text]) => `${path}: ${text.slice(0, 80)}`);
    expect(offending).toEqual([]);
  });

  it('keep units out of the character voices', () => {
    const offending = leaves(CHARACTER_VOICES[lang])
      .filter(([, text]) => NUMBER_OR_PLACEHOLDER_UNIT.test(text))
      .map(([path, text]) => `${path}: ${text.slice(0, 80)}`);
    expect(offending).toEqual([]);
  });
});
