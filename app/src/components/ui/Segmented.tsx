import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing, themedStyles } from '@/theme';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type SegmentedProps<T extends string> = {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  accessibilityLabel: string;
};

/**
 * Top-of-screen segments that switch between views of one tab (Reseptit:
 * Kirjasto | Varastosta | Suosikit | Omat). One row, equal widths; labels
 * shrink a little on narrow phones instead of wrapping.
 */
export function Segmented<T extends string>({ value, options, onChange, accessibilityLabel }: SegmentedProps<T>) {
  return (
    <View style={styles.row} accessibilityRole="tablist" accessibilityLabel={accessibilityLabel}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <PressableScale
            key={option.value}
            haptic="select"
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            style={[styles.segment, selected && styles.selected]}
          >
            <Text
              variant="label"
              color={selected ? 'textOnAccent' : 'textMuted'}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              maxFontSizeMultiplier={1.3}
            >
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
      padding: spacing.xs,
      gap: spacing.xs,
      borderRadius: radii.pill,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    segment: {
      flex: 1,
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xs,
      borderRadius: radii.pill,
    },
    selected: {
      backgroundColor: colors.accent,
    },
  }),
);
