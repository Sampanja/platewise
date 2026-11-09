import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing, themedStyles, touchTarget } from '@/theme';

import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type SelectChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: IconName;
  /** `checkbox` for multi-select groups, `radio` for single-select. */
  role?: 'checkbox' | 'radio';
  disabled?: boolean;
  accessibilityHint?: string;
};

/** Tappable chip for filters and multi-select answers. */
export function SelectChip({
  label,
  selected,
  onPress,
  icon,
  role = 'checkbox',
  disabled,
  accessibilityHint,
}: SelectChipProps) {
  return (
    <PressableScale
      haptic="select"
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={role}
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={[styles.chip, selected && styles.selected]}
    >
      <View style={styles.content}>
        {selected ? (
          <Icon name="check" size={16} color="textOnAccent" strokeWidth={2.6} />
        ) : icon ? (
          <Icon name={icon} size={16} color="textMuted" />
        ) : null}
        <Text variant="label" color={selected ? 'textOnAccent' : 'text'} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    chip: {
      minHeight: touchTarget - 4,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      borderRadius: radii.pill,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceRaised,
    },
    selected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
  }),
);
