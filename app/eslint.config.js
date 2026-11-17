// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const noHardcodedUnits = require('./eslint/no-hardcoded-units');
const noUntranslatedText = require('./eslint/no-untranslated-text');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*'],
  },
  {
    // Every user-visible string comes from the translation files (i18n, catalog texts).
    files: ['src/**/*.{ts,tsx}'],
    // fineli.generated.ts holds THL's official Finnish food names (source data, not UI).
    ignores: ['src/i18n/**', 'src/data/catalog/text/**', 'src/data/catalog/fineli.generated.ts', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
    plugins: { platepal: { rules: { 'no-untranslated-text': noUntranslatedText, 'no-hardcoded-units': noHardcodedUnits } } },
    rules: { 'platepal/no-untranslated-text': 'error' },
  },
  {
    // Amounts are shown in the user's units: only lib/amounts.ts and domain/units.ts write unit symbols.
    // Parsers of typed text (foodText, nutrition, recipeImport) and widget SVG markup are not display text.
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      'src/i18n/**',
      'src/data/catalog/text/**',
      'src/**/*.generated.ts',
      'src/lib/amounts.ts',
      'src/domain/units.ts',
      'src/domain/foodText.ts',
      'src/domain/nutrition.ts',
      'src/domain/recipeImport.ts',
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
    ],
    rules: { 'platepal/no-hardcoded-units': 'error' },
  },
]);
