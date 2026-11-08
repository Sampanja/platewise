import { useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
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

/**
 * Style keys that place the element in its parent. They must sit on the
 * Pressable, which is the actual child of the parent layout: on the inner view
 * a `flex: 1` or `width` has no effect and the control shrinks to its content
 * (this squeezed the tab bar to the left edge).
 */
const OUTER_KEYS = [
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'alignSelf',
  'width',
  'minWidth',
  'maxWidth',
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginHorizontal',
  'marginVertical',
  'marginStart',
  'marginEnd',
  'position',
  'top',
  'bottom',
  'left',
  'right',
  'zIndex',
] as const satisfies readonly (keyof ViewStyle)[];

type OuterKey = (typeof OUTER_KEYS)[number];

/** Splits a style into the Pressable's layout part and the animated view's visual part. */
export function splitPressableStyle(style: StyleProp<ViewStyle>): { outer: ViewStyle; inner: ViewStyle } {
  const flat: ViewStyle = { ...(StyleSheet.flatten(style) ?? {}) };
  const outer: ViewStyle = {};
  for (const key of OUTER_KEYS) {
    if (flat[key] !== undefined) {
      (outer as Record<OuterKey, unknown>)[key] = flat[key];
      delete flat[key];
    }
  }
  // The visual view fills the space the Pressable was given (without collapsing
  // an auto-height parent, which `flex: 1` would do).
  const grows = outer.flex !== undefined || outer.flexGrow !== undefined || outer.flexBasis !== undefined;
  const sized = outer.width !== undefined || outer.minWidth !== undefined;
  const inner: ViewStyle = {
    ...flat,
    ...(grows ? { flexGrow: 1 } : null),
    ...(sized ? { width: '100%' } : null),
  };
  return { outer, inner };
}

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
  const { outer, inner } = splitPressableStyle(style);

  const springTo = (toValue: number) =>
    Animated.spring(scale, { toValue, useNativeDriver: true, ...motion.spring }).start();

  return (
    <Pressable
      {...rest}
      style={outer}
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
        <Animated.View style={[inner, { transform: [{ scale }] }, disabled && { opacity: 0.5 }]}>
          {typeof children === 'function' ? children(state) : children}
        </Animated.View>
      )}
    </Pressable>
  );
}
