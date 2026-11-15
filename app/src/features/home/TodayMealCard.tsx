import { StyleSheet, View } from 'react-native';

import { openRecipe } from '@/components/RecipeCard';
import { RecipeImage } from '@/components/RecipeImage';
import { Card, Chip, Icon, PressableScale, Text } from '@/components/ui';
import type { Recipe } from '@/data/types';
import type { DatedMeal } from '@/domain/plan';
import { format, formatMoney, formatInteger, strings } from '@/i18n';
import { relativeDayLabel, today } from '@/lib/dates';
import { radii, spacing, themedStyles } from '@/theme';

type Props = {
  meal: DatedMeal;
  recipe: Recipe;
  /** Today's leftover lunch from yesterday's doubled dinner, if any. */
  lunchRecipe?: Recipe;
};

/** Large photo card for today's dinner (or the next one, if there is none today). */
export function TodayMealCard({ meal, recipe, lunchRecipe }: Props) {
  const isToday = meal.date === today();
  const overline = isToday
    ? strings.home.tonight
    : `${strings.home.nextMeal} · ${relativeDayLabel(meal.date)}`;
  const pricePerServing = meal.costCents / meal.servings;

  return (
    <PressableScale
      onPress={() => openRecipe(recipe.id)}
      accessibilityRole="button"
      accessibilityLabel={`${overline}: ${recipe.title}`}
    >
      <Card padding="flush">
        <View style={styles.hero}>
          <RecipeImage recipe={recipe} scrim style={StyleSheet.absoluteFill} />
          <View style={styles.heroTop}>
            <Chip tone="glass" label={format(strings.common.minutes, { count: recipe.totalTimeMin })} />
            <Chip
              tone="glass"
              label={format(strings.common.kcal, { value: formatInteger(recipe.perServing.kcal) })}
            />
          </View>
          <View style={styles.heroBottom}>
            <Text variant="overline" color="accentText">
              {overline}
            </Text>
            <Text variant="display" hyphenate>
              {recipe.title}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.price}>
            <Text variant="overline" color="textSubtle">
              {strings.common.priceEstimate}
            </Text>
            <Text variant="number" color="accentText">
              {formatMoney(pricePerServing)}{' '}
              <Text variant="caption" color="textSubtle">
                {strings.common.perServing}
              </Text>
            </Text>
          </View>
          {meal.cookDouble ? <Chip tone="success" label={strings.recipe.cookDouble} /> : null}
          <Icon name="chevronRight" color="textSubtle" />
        </View>
        {lunchRecipe ? (
          <View style={styles.lunch}>
            <Icon name="pot" size={18} color="success" />
            <Text variant="label" color="success" style={styles.flex}>
              {format(strings.home.lunchToday, { title: lunchRecipe.title })}
            </Text>
          </View>
        ) : null}
      </Card>
    </PressableScale>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    hero: {
      aspectRatio: 4 / 3,
      justifyContent: 'space-between',
      borderTopLeftRadius: radii.card,
      borderTopRightRadius: radii.card,
      overflow: 'hidden',
    },
    heroTop: {
      flexDirection: 'row',
      gap: spacing.sm,
      padding: spacing.lg,
    },
    heroBottom: {
      padding: spacing.xl,
      paddingBottom: spacing.lg,
      gap: spacing.xs,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: spacing.md,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
    },
    price: {
      gap: spacing.xxs,
      flex: 1,
    },
    lunch: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.lg,
    },
    flex: {
      flex: 1,
    },
  }),
);
