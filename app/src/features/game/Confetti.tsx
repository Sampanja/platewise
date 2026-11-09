import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';

import { useReducedMotion } from '@/components/ui';
import { colors, type ColorToken } from '@/theme';

// The character's own colours plus the shared highlights.
const TOKENS: ColorToken[] = ['accent', 'gold', 'herb', 'water', 'berry', 'accentText'];
const COUNT = 36;

type Piece = { x: number; delay: number; drift: number; spin: number; color: string; w: number; h: number };

/** A short burst of falling confetti. Skipped entirely with reduced motion. */
export function Confetti({ run }: { run: number }) {
  const { width, height } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(0));
  const [pieces] = useState<Piece[]>(() =>
    Array.from({ length: COUNT }, (_, i) => ({
      x: Math.random(),
      delay: Math.random() * 0.25,
      drift: (Math.random() - 0.5) * 120,
      spin: (Math.random() - 0.5) * 900,
      color: colors[TOKENS[i % TOKENS.length]],
      w: 6 + Math.random() * 6,
      h: 10 + Math.random() * 8,
    })),
  );

  useEffect(() => {
    if (reducedMotion || run === 0) return;
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 2400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [run, reducedMotion, progress]);

  if (reducedMotion || run === 0) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((piece, i) => {
        const start = piece.delay;
        const y = progress.interpolate({ inputRange: [0, start, 1], outputRange: [-40, -40, height + 40] });
        const x = progress.interpolate({ inputRange: [0, 1], outputRange: [0, piece.drift] });
        const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${piece.spin}deg`] });
        const opacity = progress.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] });
        return (
          <Animated.View
            key={i}
            style={[
              styles.piece,
              {
                left: piece.x * width,
                width: piece.w,
                height: piece.h,
                backgroundColor: piece.color,
                opacity,
                transform: [{ translateY: y }, { translateX: x }, { rotate }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
  },
});
