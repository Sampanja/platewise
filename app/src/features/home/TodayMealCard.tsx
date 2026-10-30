import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Card, Chip, Text } from '@/components/ui';
import type { Recipe } from '@/data/types';
import type { DatedMeal } from '@/domain/plan';
import { format, formatCents, formatInteger, strings } from '@/i18n';
import { relativeDayLabel, today } from '@/lib/dates';
import { colors, gradients, radii, spacing } from '@/theme';

type Props = {
  meal: DatedMeal;
  recipe: Recipe;
};

/** Large photo card for today's dinner (or the next one, if there is none today). */
export function TodayMealCard({ meal, recipe }: Props) {
  const isToday = meal.date === today();
  const overline = isToday
    ? strings.home.tonight
    : `${strings.home.nextMeal} · ${relativeDayLabel(meal.date)}`;
  const pricePerServing = meal.costCents / meal.servings;

  return (
    <Card padding="flush">
      <View style={styles.hero}>
        {recipe.imageUrl ? (
          <Image
            source={recipe.imageUrl}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={300}
            accessibilityLabel={format(strings.recipe.imageLabel, { title: recipe.title })}
          />
        ) : (
          <LinearGradient
            colors={[colors.surfaceRaised, colors.surface]}
            style={StyleSheet.absoluteFill}
          />
        )}
        <LinearGradient
          colors={gradients.scrim}
          locations={[0.3, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.heroTop}>
          <Chip tone="glass" label={format(strings.common.minutes, { count: recipe.cookTimeMin })} />
          <Chip
            tone="glass"
            label={format(strings.common.kcal, { value: formatInteger(recipe.perServing.kcal) })}
          />
        </View>

        <View style={styles.heroBottom}>
          <Text variant="overline" color="accentText">
            {overline}
          </Text>
          <Text variant="display" accessibilityRole="header">
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
            {formatCents(pricePerServing)}{' '}
            <Text variant="caption" color="textSubtle">
              {strings.common.perServing}
            </Text>
          </Text>
        </View>
        {meal.cookDouble ? <Chip tone="success" label={strings.recipe.cookDouble} /> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
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
  },
});
