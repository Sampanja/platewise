import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { strings } from '@/i18n';
import { spacing, themedStyles } from '@/theme';

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

const REPEAT_MS = 90;

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
  const clamp = (next: number) => Math.min(max, Math.max(min, Number(next.toFixed(2))));
  const dec = () => onChange(clamp(value - step));
  const inc = () => onChange(clamp(value + step));
  const buttonSize = size === 'large' ? 56 : 44;

  // Press and hold repeats the step, so big changes (height, weight) are quick.
  const valueRef = useRef(value);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  const stopRepeat = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => stopRepeat, []);
  const startRepeat = (direction: 1 | -1) => {
    stopRepeat();
    timer.current = setInterval(() => {
      const next = clamp(valueRef.current + direction * step);
      if (next === valueRef.current) return stopRepeat();
      valueRef.current = next;
      onChange(next);
    }, REPEAT_MS);
  };

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
        onLongPress={() => startRepeat(-1)}
        onPressOut={stopRepeat}
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
        onLongPress={() => startRepeat(1)}
        onPressOut={stopRepeat}
        disabled={value >= max}
        haptic="select"
        size={buttonSize}
      />
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    value: {
      // Fixed width keeps the buttons of stacked steppers aligned.
      minWidth: 76,
      textAlign: 'center',
      fontVariant: ['tabular-nums'],
    },
    valueLarge: {
      minWidth: 120,
    },
  }),
);
