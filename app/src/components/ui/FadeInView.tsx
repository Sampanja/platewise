import { useEffect, useState } from 'react';
import { Animated, Easing, type ViewProps } from 'react-native';

import { motion } from '@/theme';

import { useReducedMotion } from './useReducedMotion';

export type FadeInViewProps = ViewProps & {
  /** Delay in ms; stagger sections by ~60 ms so content settles top to bottom. */
  delay?: number;
};

/** Fades and lifts its children in once on mount. */
export function FadeInView({ delay = 0, style, ...rest }: FadeInViewProps) {
  const reducedMotion = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: reducedMotion ? 0 : motion.durationSlow,
      delay: reducedMotion ? 0 : delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [delay, progress, reducedMotion]);

  return (
    <Animated.View
      {...rest}
      style={[
        style,
        {
          opacity: progress,
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
          ],
        },
      ]}
    />
  );
}
