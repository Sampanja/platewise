import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui';
import type { Recipe } from '@/data/types';
import { format, strings } from '@/i18n';
import { colors, gradients } from '@/theme';

type Props = {
  recipe: Pick<Recipe, 'imageUrl' | 'title'>;
  style?: StyleProp<ViewStyle>;
  /** Darken the bottom so text on top stays legible. */
  scrim?: boolean;
};

/** Dish photo with a calm placeholder while loading or when no image exists yet. */
export function RecipeImage({ recipe, style, scrim = false }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <LinearGradient colors={[colors.surfaceRaised, colors.surface]} style={StyleSheet.absoluteFill} />
      <View style={styles.placeholderIcon}>
        <Icon name="plate" size={28} color="textSubtle" />
      </View>
      {recipe.imageUrl ? (
        <Image
          source={recipe.imageUrl}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
          recyclingKey={recipe.imageUrl}
          accessibilityLabel={format(strings.recipe.imageLabel, { title: recipe.title })}
        />
      ) : null}
      {scrim ? (
        <LinearGradient colors={gradients.scrim} locations={[0.35, 0.65, 1]} style={StyleSheet.absoluteFill} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  placeholderIcon: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
