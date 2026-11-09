import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { colors, spacing, themedStyles, touchTarget } from '@/theme';

import { haptics } from './haptics';
import { Text } from './Text';

export type SwitchRowProps = {
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

/** Label and switch; the whole row is one accessible switch and toggles on tap. */
export function SwitchRow({ label, hint, value, onValueChange }: SwitchRowProps) {
  const change = (next: boolean) => {
    haptics.select();
    onValueChange(next);
  };
  return (
    <Pressable
      style={styles.row}
      onPress={() => change(!value)}
      accessible
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ checked: value }}
      onAccessibilityTap={() => change(!value)}
    >
      <View style={styles.texts}>
        <Text variant="body">{label}</Text>
        {hint ? (
          <Text variant="caption" color="textSubtle">
            {hint}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={change}
        trackColor={{ false: colors.border, true: colors.accentPressed }}
        thumbColor={value ? colors.accent : colors.textMuted}
        ios_backgroundColor={colors.border}
      />
    </Pressable>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    row: {
      minHeight: touchTarget + spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    texts: {
      flex: 1,
      gap: spacing.xxs,
    },
  }),
);
