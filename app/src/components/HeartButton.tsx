import { useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { haptics, Icon, PressableScale, useReducedMotion } from '@/components/ui';
import { useFavoritesStore, useIsFavorite } from '@/data/stores/favorites';
import { strings } from '@/i18n';
import { colors, touchTarget } from '@/theme';

type Props = {
  recipeId: string;
  size?: number;
  /** `glass` on photos, `raised` on plain backgrounds. */
  variant?: 'glass' | 'raised';
};

/** Favourite toggle with a little pop when a recipe is liked. */
export function HeartButton({ recipeId, size = 40, variant = 'glass' }: Props) {
  const favorite = useIsFavorite(recipeId);
  const toggle = useFavoritesStore((s) => s.toggle);
  const reducedMotion = useReducedMotion();
  const [scale] = useState(() => new Animated.Value(1));

  const onPress = () => {
    if (!favorite) {
      haptics.success();
      if (!reducedMotion) {
        scale.setValue(0.6);
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 18 }).start();
      }
    } else {
      haptics.tap();
    }
    toggle(recipeId);
  };

  return (
    <PressableScale
      haptic="none"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: favorite }}
      accessibilityLabel={favorite ? strings.recipe.unfavorite : strings.recipe.favorite}
      hitSlop={Math.max(0, (touchTarget - size) / 2)}
      style={[
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        variant === 'glass' ? styles.glass : styles.raised,
      ]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Icon
          name="heart"
          size={Math.round(size * 0.5)}
          color={favorite ? 'danger' : 'text'}
          fill={favorite ? 'danger' : undefined}
          strokeWidth={2}
        />
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glass: {
    backgroundColor: colors.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  raised: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
});
