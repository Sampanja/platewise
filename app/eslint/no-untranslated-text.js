/**
 * Blocks user-visible text that bypasses the translation files.
 *
 * - JSX text with letters (`<Text>Hei</Text>`) and string literals in
 *   user-visible JSX props (label, title, placeholder, accessibilityLabel…).
 * - Any string or template literal with Nordic letters (ä, ö, å) outside the
 *   translation files: Finnish or Swedish text in logic is untranslated text.
 *
 * Text belongs in src/i18n/<lang>*.ts (UI) or src/data/catalog/text/<lang>/
 * (recipes, ingredients, foods). Units and symbols such as "g", "%" or "×"
 * have no letters and pass. A deliberate exception takes an inline
 * `// eslint-disable-next-line platepal/no-untranslated-text -- why`.
 */
const VISIBLE_PROPS = new Set([
  'label',
  'title',
  'hint',
  'body',
  'message',
  'placeholder',
  'accessibilityLabel',
  'accessibilityHint',
  'accessibilityValueText',
  'skipLabel',
]);

const LETTER_RUN = /\p{L}{2,}/u;
/** Unit symbols are the same in every supported language. */
const UNITS = /\b(kcal|kg|g|ml|dl|l|cm|min|oz|lb|fl|XP|h)\b/g;
const LETTER = { test: (text) => LETTER_RUN.test(String(text).replace(UNITS, '')) };
const NORDIC = /[äöåÄÖÅ]/;

module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'User-visible text must come from the translation files' },
    schema: [],
    messages: {
      jsxText: 'Untranslated text in JSX: "{{text}}". Add it to src/i18n and use strings.',
      prop: 'Untranslated text in the "{{prop}}" prop: "{{text}}". Add it to src/i18n and use strings.',
      nordic: 'Finnish or Swedish text outside the translation files: "{{text}}".',
    },
  },
  create(context) {
    const short = (text) => text.trim().replace(/\s+/g, ' ').slice(0, 40);
    const checkNordic = (node, text) => {
      if (NORDIC.test(text)) context.report({ node, messageId: 'nordic', data: { text: short(text) } });
    };
    return {
      JSXText(node) {
        if (LETTER.test(node.value)) context.report({ node, messageId: 'jsxText', data: { text: short(node.value) } });
      },
      JSXAttribute(node) {
        const name = node.name && node.name.name;
        if (!VISIBLE_PROPS.has(name) || !node.value) return;
        const value = node.value.type === 'JSXExpressionContainer' ? node.value.expression : node.value;
        if (value.type === 'Literal' && typeof value.value === 'string' && LETTER.test(value.value)) {
          context.report({ node: value, messageId: 'prop', data: { prop: name, text: short(value.value) } });
        }
        if (value.type === 'TemplateLiteral' && value.quasis.some((q) => LETTER.test(q.value.cooked ?? ''))) {
          context.report({ node: value, messageId: 'prop', data: { prop: name, text: short(value.quasis.map((q) => q.value.cooked).join('…')) } });
        }
      },
      Literal(node) {
        if (typeof node.value === 'string') checkNordic(node, node.value);
      },
      TemplateElement(node) {
        checkNordic(node, node.value.cooked ?? '');
      },
    };
  },
};
