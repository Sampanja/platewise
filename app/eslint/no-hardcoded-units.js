/**
 * Blocks unit symbols written next to numbers in code: `${grams} g`,
 * '100 g', <Text>{kcal} kcal</Text>. The user chooses their units (kg, lb or
 * stones; g or oz; ml or fl oz; kcal or kJ; °C or °F), so every amount is
 * formatted by src/lib/amounts.ts (formatGrams, formatEnergy, formatBodyWeight,
 * formatNutrientGrams…) and every unit word comes from strings.units /
 * strings.unitNames. Translation files are checked by src/i18n/units.test.ts.
 *
 * Parsers that read units from user text (domain/foodText.ts,
 * domain/nutrition.ts) are not display code and are not linted by this rule.
 */
const UNIT = String.raw`(?:kcal|kJ|kj|kg|g|mg|µg|mcg|ml|dl|cl|l|cm|mm|oz|lb|lbs|fl oz|cups?|tsp|tbsp|°C|°F|°)`;
/** `${x} g`, `${x} kcal / day`: a template part right after an expression that starts with a unit. */
const AFTER_EXPRESSION = new RegExp(String.raw`^\s?${UNIT}(?![\p{L}\d])`, 'u');
/** '100 g', '2,5 dl', '200 °C' anywhere in a string (not identifiers such as "energy-kcal_100g"). */
const NUMBER_UNIT = new RegExp(String.raw`(?<![\p{L}_\-\d.,])\d[\d.,]*\s?${UNIT}(?![\p{L}\d])`, 'u');
/** A unit alone in visible text: <Text>kcal</Text>, label="g". */
const BARE_UNIT = new RegExp(String.raw`^\s*${UNIT}\s*$`, 'u');

const VISIBLE_PROPS = new Set(['label', 'title', 'hint', 'body', 'message', 'placeholder', 'accessibilityLabel', 'accessibilityHint', 'accessibilityValueText', 'unit']);

module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Amounts and unit symbols go through lib/amounts.ts and the translation files' },
    schema: [],
    messages: {
      unit: 'Hard-coded unit "{{text}}". Format the amount with src/lib/amounts.ts (formatGrams, formatEnergy, formatBodyWeight, formatNutrientGrams…) or use strings.unitNames.',
    },
  },
  create(context) {
    const report = (node, text) =>
      context.report({ node, messageId: 'unit', data: { text: String(text).trim().slice(0, 40) } });
    return {
      TemplateLiteral(node) {
        node.quasis.forEach((quasi, index) => {
          const text = quasi.value.cooked ?? '';
          if ((index > 0 && AFTER_EXPRESSION.test(text)) || NUMBER_UNIT.test(text)) report(quasi, text);
        });
      },
      Literal(node) {
        if (typeof node.value !== 'string') return;
        if (NUMBER_UNIT.test(node.value)) report(node, node.value);
        const parent = node.parent;
        const visibleProp = parent && parent.type === 'JSXAttribute' && VISIBLE_PROPS.has(parent.name && parent.name.name);
        if (visibleProp && BARE_UNIT.test(node.value)) report(node, node.value);
      },
      JSXText(node) {
        if (NUMBER_UNIT.test(node.value) || BARE_UNIT.test(node.value)) return report(node, node.value);
        // {kcal} kcal: text that starts with a unit right after an expression.
        const siblings = node.parent && node.parent.children ? node.parent.children : [];
        const previous = siblings[siblings.indexOf(node) - 1];
        if (previous && previous.type === 'JSXExpressionContainer' && AFTER_EXPRESSION.test(node.value)) report(node, node.value);
      },
    };
  },
};
