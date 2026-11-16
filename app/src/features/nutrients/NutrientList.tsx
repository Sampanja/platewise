import { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, PressableScale, ProgressMeter, Text } from '@/components/ui';
import type { Macros, MicroKey } from '@/data/types';
import { NUTRIENTS, nutrientShare, type NutrientReference, type NutrientSpec } from '@/domain/nutrients';
import { format, formatDecimal, formatInteger, strings } from '@/i18n';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.nutrientInfo;

/** "12 g", "450 mg", "3,2 µg": integers from ten up, one decimal below. */
export function formatNutrient(value: number, unit: NutrientSpec['unit']): string {
  const number = value >= 10 ? formatInteger(value) : formatDecimal(value);
  return `${number} ${unit}`;
}

export type NutrientListProps = {
  values: Partial<Pick<Macros, MicroKey>>;
  reference: NutrientReference;
  /** `share`: the row shows "x %" of the daily reference (a recipe serving). */
  mode?: 'day' | 'share';
};

/**
 * Nutrients as calm bars against the NNR2023 reference: no warning colours,
 * no verdicts. Tapping a row tells where the nutrient comes from.
 */
export function NutrientList({ values, reference, mode = 'day' }: NutrientListProps) {
  const [open, setOpen] = useState<MicroKey | null>(null);
  return (
    <View style={styles.list}>
      {NUTRIENTS.map((spec) => (
        <NutrientRow
          key={spec.key}
          spec={spec}
          value={values[spec.key]}
          reference={reference[spec.key]}
          mode={mode}
          open={open === spec.key}
          onToggle={() => setOpen((current) => (current === spec.key ? null : spec.key))}
        />
      ))}
    </View>
  );
}

type RowProps = {
  spec: NutrientSpec;
  value: number | undefined;
  reference: number | undefined;
  mode: 'day' | 'share';
  open: boolean;
  onToggle: () => void;
};

const NutrientRow = memo(function NutrientRow({ spec, value, reference, mode, open, onToggle }: RowProps) {
  const name = t.names[spec.key];
  const amount = value === undefined ? strings.nutrients.unknown : formatNutrient(value, spec.unit);
  const share = nutrientShare(value, reference);
  const referenceText =
    reference === undefined || spec.kind === 'info'
      ? ''
      : format(spec.kind === 'limit' ? t.limit : t.target, { value: formatNutrient(reference, spec.unit) });
  const right = mode === 'share' && share !== null ? format(t.share, { value: formatInteger(share * 100) }) : amount;
  return (
    <PressableScale
      haptic="select"
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      accessibilityLabel={format(t.a11yRow, { name, value: amount, reference: referenceText })}
      style={styles.row}
    >
      <View style={styles.top}>
        <Text variant="label" style={styles.flex}>
          {name}
        </Text>
        {mode === 'share' && share !== null ? (
          <Text variant="caption" color="textSubtle">
            {amount}
          </Text>
        ) : null}
        <Text variant="label" color="textMuted">
          {right}
        </Text>
        <Icon name={open ? 'chevronDown' : 'info'} size={14} color="textSubtle" />
      </View>
      {share !== null && spec.kind !== 'info' ? (
        <ProgressMeter value={share} size="thin" tone={spec.kind === 'target' && share >= 1 ? 'success' : 'accent'} accessibilityLabel={name} />
      ) : null}
      {referenceText && mode === 'day' ? (
        <Text variant="caption" color="textSubtle">
          {referenceText}
        </Text>
      ) : null}
      {open ? (
        <Text variant="caption" color="textMuted" style={styles.source}>
          {t.sources[spec.key]}
        </Text>
      ) : null}
    </PressableScale>
  );
});

const styles = themedStyles(() =>
  StyleSheet.create({
    list: {
      gap: spacing.xs,
    },
    row: {
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderRadius: radii.md,
    },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    flex: {
      flex: 1,
    },
    source: {
      padding: spacing.sm,
      borderRadius: radii.sm,
      backgroundColor: colors.surfaceRaised,
    },
  }),
);
