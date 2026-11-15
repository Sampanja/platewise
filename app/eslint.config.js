// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

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
    plugins: { platewise: { rules: { 'no-untranslated-text': noUntranslatedText } } },
    rules: { 'platewise/no-untranslated-text': 'error' },
  },
]);
