import { StyleSheet, View } from 'react-native';

import { format, strings } from '@/i18n';
import { colors, radii, spacing, themedStyles } from '@/theme';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type UnitToggleProps<T extends string> = {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
};

/**
 * Small "kg | lb" switch next to a weight or height field: type one value in
 * another unit without changing the setting. The field keeps metric inside,
 * so switching never changes the value, only how it is shown.
 */
export function UnitToggle<T extends string>({ value, options, onChange }: UnitToggleProps<T>) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={strings.unitSystems.once.label}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <PressableScale
            key={option.value}
            haptic="select"
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={option.label}
            accessibilityHint={format(strings.unitSystems.once.a11y, { unit: option.label })}
            hitSlop={6}
            style={[styles.segment, selected && styles.selected]}
          >
            <Text variant="caption" color={selected ? 'textOnAccent' : 'textMuted'} maxFontSizeMultiplier={1.4}>
              {option.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      padding: 2,
      gap: 2,
      borderRadius: radii.pill,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    segment: {
      minWidth: 40,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radii.pill,
      alignItems: 'center',
    },
    selected: {
      backgroundColor: colors.accent,
    },
  }),
);
