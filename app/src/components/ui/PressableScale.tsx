import { useState } from 'react';
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { motion } from '@/theme';

import { haptics } from './haptics';

export type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** Haptic played on press-in. `none` for silent elements. */
  haptic?: keyof typeof haptics | 'none';
};

/** Pressable that springs down slightly while held. Base for all tappable components. */
export function PressableScale({
  style,
  haptic = 'tap',
  onPressIn,
  onPressOut,
  disabled,
  children,
  ...rest
}: PressableScaleProps) {
  const [scale] = useState(() => new Animated.Value(1));

  const springTo = (toValue: number) =>
    Animated.spring(scale, { toValue, useNativeDriver: true, ...motion.spring }).start();

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      onPressIn={(event) => {
        springTo(motion.pressScale);
        if (haptic !== 'none') haptics[haptic]();
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        springTo(1);
        onPressOut?.(event);
      }}
    >
      {(state) => (
        <Animated.View style={[style, { transform: [{ scale }] }, disabled && { opacity: 0.5 }]}>
          {typeof children === 'function' ? children(state) : children}
        </Animated.View>
      )}
    </Pressable>
  );
}
