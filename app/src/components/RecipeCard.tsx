import { router } from 'expo-router';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { HeartButton } from '@/components/HeartButton';
import { RecipeImage } from '@/components/RecipeImage';
import { Icon, PressableScale, Text } from '@/components/ui';
import { useServingPrice } from '@/data/hooks';
import type { Recipe } from '@/data/types';
import { format, formatCents, formatInteger, strings } from '@/i18n';
import { colors, radii, shadows, spacing, themedStyles } from '@/theme';

type Props = {
  recipe: Recipe;
  /** Small text above the title, e.g. the day in a plan. */
  overline?: string;
  showHeart?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

export function openRecipe(recipeId: string) {
  router.push({ pathname: '/recipe/[id]', params: { id: recipeId } });
}

/** Photo card with price estimate per serving, time and kcal. Opens the recipe. */
export function RecipeCard({ recipe, overline, showHeart = true, style, onPress }: Props) {
  const servingPrice = useServingPrice();
  const price = formatCents(servingPrice(recipe));
  const time = format(strings.common.minutes, { count: recipe.totalTimeMin });
  const kcal = format(strings.common.kcal, { value: formatInteger(recipe.perServing.kcal) });

  return (
    <View style={[styles.card, style]}>
      <PressableScale
        onPress={onPress ?? (() => openRecipe(recipe.id))}
        accessibilityRole="button"
        accessibilityLabel={[overline, recipe.title, `${strings.common.priceEstimate} ${price} ${strings.common.perServing}`, time, kcal]
          .filter(Boolean)
          .join(', ')}
      >
        <RecipeImage recipe={recipe} style={styles.image} />
        <View style={styles.body}>
          {overline ? (
            <Text variant="overline" color="accentText" numberOfLines={1}>
              {overline}
            </Text>
          ) : null}
          <Text variant="cardTitle" numberOfLines={3} style={styles.title} hyphenate>
            {recipe.title}
          </Text>
          <Text variant="number" color="accentText">
            {price}
            <Text variant="caption" color="textSubtle">
              {' '}
              {strings.common.perServing}
            </Text>
          </Text>
          <View style={styles.meta}>
            <Icon name="clock" size={14} color="textSubtle" />
            <Text variant="caption" color="textSubtle">
              {time}
            </Text>
            <Icon name="flame" size={14} color="textSubtle" />
            <Text variant="caption" color="textSubtle">
              {kcal}
            </Text>
          </View>
        </View>
      </PressableScale>
      {showHeart ? (
        <View style={styles.heart}>
          <HeartButton recipeId={recipe.id} size={36} />
        </View>
      ) : null}
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.glassBorder,
      overflow: 'hidden',
      ...shadows.card,
    },
    image: {
      aspectRatio: 1.1,
    },
    body: {
      padding: spacing.md,
      gap: spacing.xs,
    },
    title: {
      minHeight: 40,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    heart: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
    },
  }),
);
