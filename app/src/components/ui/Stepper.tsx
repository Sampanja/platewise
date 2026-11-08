import { StyleSheet, View } from 'react-native';

import { strings } from '@/i18n';
import { spacing } from '@/theme';

import { IconButton } from './IconButton';
import { Text } from './Text';

export type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  /** Shown value, e.g. "3 annosta". Defaults to the number. */
  format?: (value: number) => string;
  /** Spoken name of the setting, e.g. "Annokset". */
  accessibilityLabel: string;
  size?: 'regular' | 'large';
};

/** − value + control. Adjustable for screen readers (swipe up / down). */
export function Stepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  format,
  accessibilityLabel,
  size = 'regular',
}: StepperProps) {
  const text = format ? format(value) : String(value);
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));
  const buttonSize = size === 'large' ? 56 : 44;

  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) => (event.nativeEvent.actionName === 'increment' ? inc() : dec())}
    >
      <IconButton
        icon="minus"
        accessibilityLabel={strings.common.decrease}
        onPress={dec}
        disabled={value <= min}
        haptic="select"
        size={buttonSize}
      />
      <Text
        variant={size === 'large' ? 'display' : 'heading'}
        style={[styles.value, size === 'large' && styles.valueLarge]}
        numberOfLines={1}
      >
        {text}
      </Text>
      <IconButton
        icon="plus"
        accessibilityLabel={strings.common.increase}
        onPress={inc}
        disabled={value >= max}
        haptic="select"
        size={buttonSize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  value: {
    minWidth: 44,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  valueLarge: {
    minWidth: 120,
  },
});
