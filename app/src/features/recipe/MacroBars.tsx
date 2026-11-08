import { StyleSheet, View } from 'react-native';

import { ProgressMeter, Text } from '@/components/ui';
import type { Macros } from '@/data/types';
import { format, formatInteger, strings } from '@/i18n';
import { colors, radii, spacing } from '@/theme';

type Props = {
  macros: Macros;
};

/** kcal per gram of each macronutrient, for the energy share bars. */
const KCAL_PER_G = { proteinG: 4, carbsG: 4, fatG: 9 } as const;

/**
 * Per-serving energy and a bar per macro. Bar length is the macro's share of
 * the serving's energy, so the bars compare like with like.
 */
export function MacroBars({ macros }: Props) {
  const t = strings.macros;
  const energy =
    macros.proteinG * KCAL_PER_G.proteinG + macros.carbsG * KCAL_PER_G.carbsG + macros.fatG * KCAL_PER_G.fatG;
  const rows: { key: keyof typeof KCAL_PER_G; label: string; grams: number }[] = [
    { key: 'proteinG', label: t.protein, grams: macros.proteinG },
    { key: 'carbsG', label: t.carbsLong, grams: macros.carbsG },
    { key: 'fatG', label: t.fat, grams: macros.fatG },
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.energy}>
        <Text variant="displayLarge" style={styles.tabular}>
          {formatInteger(macros.kcal)}
        </Text>
        <Text variant="label" color="textSubtle">
          {strings.common.kcalUnit} {strings.common.perServing}
        </Text>
      </View>
      <View style={styles.rows}>
        {rows.map((row) => {
          const share = energy > 0 ? (row.grams * KCAL_PER_G[row.key]) / energy : 0;
          const grams = format(strings.common.grams, { value: formatInteger(row.grams) });
          return (
            <View key={row.key} style={styles.row}>
              <View style={styles.labels}>
                <Text variant="label" color="textMuted">
                  {row.label}
                </Text>
                <Text variant="label" style={styles.tabular}>
                  {grams}
                  <Text variant="caption" color="textSubtle">
                    {'  '}
                    {Math.round(share * 100)} %
                  </Text>
                </Text>
              </View>
              <ProgressMeter
                value={share}
                size="thin"
                accessibilityLabel={format(t.a11yPerServing, { value: formatInteger(row.grams), unit: 'g', label: row.label })}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.lg,
  },
  energy: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceRaised,
    alignSelf: 'flex-start',
  },
  rows: {
    gap: spacing.md,
  },
  row: {
    gap: spacing.xs,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
