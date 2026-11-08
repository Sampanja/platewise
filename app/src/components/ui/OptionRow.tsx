import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type OptionRowProps = {
  title: string;
  hint?: string;
  selected: boolean;
  onPress: () => void;
  icon?: IconName;
  /** Extra content before the selection mark (e.g. a price level). */
  trailing?: ReactNode;
  role?: 'radio' | 'checkbox';
  disabled?: boolean;
};

/** Large selectable card row for one-question-per-screen answers. */
export function OptionRow({
  title,
  hint,
  selected,
  onPress,
  icon,
  trailing,
  role = 'radio',
  disabled,
}: OptionRowProps) {
  return (
    <PressableScale
      haptic="select"
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={role}
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={hint ? `${title}, ${hint}` : title}
      style={[styles.row, selected && styles.selected]}
    >
      {icon ? (
        <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
          <Icon name={icon} size={22} color={selected ? 'textOnAccent' : 'accentText'} />
        </View>
      ) : null}
      <View style={styles.texts}>
        <Text variant="bodyStrong">{title}</Text>
        {hint ? (
          <Text variant="caption" color="textSubtle">
            {hint}
          </Text>
        ) : null}
      </View>
      {trailing}
      <View style={[role === 'radio' ? styles.radio : styles.checkbox, selected && styles.markSelected]}>
        {selected ? <Icon name="check" size={16} color="textOnAccent" strokeWidth={3} /> : null}
      </View>
    </PressableScale>
  );
}

const MARK = 26;

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  iconWrapSelected: {
    backgroundColor: colors.accent,
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
  radio: {
    width: MARK,
    height: MARK,
    borderRadius: MARK / 2,
    borderWidth: 2,
    borderColor: colors.textSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: MARK,
    height: MARK,
    borderRadius: radii.sm - 2,
    borderWidth: 2,
    borderColor: colors.textSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
});
