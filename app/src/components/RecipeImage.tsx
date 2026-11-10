import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { FoodIllustration } from '@/components/FoodIllustration';
import type { Recipe } from '@/data/types';
import { format, strings } from '@/i18n';
import { gradients, themedStyles } from '@/theme';

type Props = {
  recipe: Pick<Recipe, 'id' | 'imageUrl' | 'title' | 'dishType' | 'mainProtein'>;
  style?: StyleProp<ViewStyle>;
  /** Darken the bottom so text on top stays legible. */
  scrim?: boolean;
};

/**
 * The dish image. Until the backend adds a real photo (`imageUrl`), the
 * recipe's category illustration card in the active theme's colours is shown;
 * it also stays underneath a photo while it loads.
 */
export function RecipeImage({ recipe, style, scrim = false }: Props) {
  return (
    <View
      style={[styles.wrap, style]}
      accessible={recipe.imageUrl !== null}
      accessibilityRole={recipe.imageUrl ? 'image' : undefined}
      accessibilityLabel={recipe.imageUrl ? format(strings.recipe.imageLabel, { title: recipe.title }) : undefined}
    >
      <FoodIllustration
        dishType={recipe.dishType}
        protein={recipe.mainProtein}
        seed={recipe.id}
        style={StyleSheet.absoluteFill}
      />
      {recipe.imageUrl ? (
        <Image
          source={recipe.imageUrl}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
          recyclingKey={recipe.imageUrl}
        />
      ) : null}
      {scrim ? (
        <LinearGradient colors={gradients.scrim} locations={[0.35, 0.65, 1]} style={StyleSheet.absoluteFill} />
      ) : null}
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    wrap: {
      overflow: 'hidden',
    },
  }),
);
