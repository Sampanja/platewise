import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

import { Text, type TextProps } from './Text';
import { useReducedMotion } from './useReducedMotion';

export type AnimatedNumberProps = Omit<TextProps, 'children'> & {
  value: number;
  format: (value: number) => string;
  duration?: number;
};

/** Counts smoothly from the previous value to the new one (totals after a swap). */
export function AnimatedNumber({ value, format, duration = 450, style, ...rest }: AnimatedNumberProps) {
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const [animated] = useState(() => new Animated.Value(value));
  useEffect(() => {
    const id = animated.addListener(({ value: v }) => setDisplay(v));
    return () => animated.removeListener(id);
  }, [animated]);

  useEffect(() => {
    const animation = Animated.timing(animated, {
      toValue: value,
      duration: reducedMotion ? 0 : duration,
      easing: Easing.out(Easing.cubic),
      // Text content cannot be driven natively.
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [value, animated, duration, reducedMotion]);

  return (
    <Text {...rest} style={[{ fontVariant: ['tabular-nums'] }, style]} accessibilityLabel={format(value)}>
      {format(display)}
    </Text>
  );
}
