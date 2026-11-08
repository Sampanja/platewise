import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type NumberChoiceProps = {
  options: readonly number[];
  value: number;
  onChange: (value: number) => void;
  /** Spoken label per option, e.g. "3 syöjää". */
  accessibilityLabelFor: (value: number) => string;
  columns?: number;
};

/** Big square number buttons for "how many" questions. */
export function NumberChoice({
  options,
  value,
  onChange,
  accessibilityLabelFor,
  columns = 3,
}: NumberChoiceProps) {
  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {options.map((option) => {
        const selected = option === value;
        return (
          <PressableScale
            key={option}
            haptic="select"
            onPress={() => onChange(option)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={accessibilityLabelFor(option)}
            style={[styles.cell, { flexBasis: `${100 / columns - 4}%` }, selected && styles.selected]}
          >
            <Text variant="displayLarge" color={selected ? 'textOnAccent' : 'text'} style={styles.number}>
              {option}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  cell: {
    flexGrow: 1,
    aspectRatio: 1.15,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  number: {
    fontVariant: ['tabular-nums'],
  },
});
