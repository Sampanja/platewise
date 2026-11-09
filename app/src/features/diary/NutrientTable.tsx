import { StyleSheet, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import type { Macros } from '@/data/types';
import { formatDecimal, formatInteger, strings } from '@/i18n';
import { colors, spacing, themedStyles } from '@/theme';

const n = strings.nutrients;

/** Label-style nutrient table (per 100 g or per portion). Unknown values show a dash. */
export function NutrientTable({ values, title = n.title }: { values: Macros; title?: string }) {
  const grams = (value: number | undefined) => (value === undefined ? n.unknown : `${formatDecimal(value)} g`);
  const rows: [string, string, boolean][] = [
    [n.energy, `${formatInteger(values.kcal)} kcal`, false],
    [n.protein, grams(values.proteinG), false],
    [n.carbs, grams(values.carbsG), false],
    [n.sugar, grams(values.sugarG), true],
    [n.fat, grams(values.fatG), false],
    [n.fiber, grams(values.fiberG), false],
    [n.salt, grams(values.saltG), false],
  ];
  return (
    <Card padding="flush" accessible accessibilityLabel={`${title}: ${rows.map(([l, v]) => `${l} ${v}`).join(', ')}`}>
      <Text variant="overline" color="textSubtle" style={styles.title}>
        {title}
      </Text>
      {rows.map(([label, value, indent], i) => (
        <View key={label} style={[styles.row, i < rows.length - 1 && styles.divider]}>
          <Text variant={indent ? 'label' : 'body'} color={indent ? 'textMuted' : 'text'} style={[styles.flex, indent && styles.indent]}>
            {label}
          </Text>
          <Text variant="number" color={indent ? 'textMuted' : 'text'}>
            {value}
          </Text>
        </View>
      ))}
    </Card>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    title: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      minHeight: 44,
    },
    divider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    flex: {
      flex: 1,
    },
    indent: {
      paddingLeft: spacing.md,
    },
  }),
);
