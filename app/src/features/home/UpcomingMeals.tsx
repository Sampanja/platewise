import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import type { Recipe } from '@/data/types';
import type { DatedMeal } from '@/domain/plan';
import { format, formatInteger, strings } from '@/i18n';
import { relativeDayLabel } from '@/lib/dates';
import { colors, radii, shadows, spacing } from '@/theme';

type Props = {
  meals: readonly DatedMeal[];
  recipesById: Readonly<Record<string, Recipe>>;
};

const CARD_WIDTH = 168;

/** Horizontally scrolling strip of the plan's remaining dinners. */
export function UpcomingMeals({ meals, recipesById }: Props) {
  return (
    <View style={styles.section}>
      <Text variant="title" accessibilityRole="header" style={styles.heading}>
        {strings.home.upcoming}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + spacing.md}
        decelerationRate="fast"
        contentContainerStyle={styles.strip}
      >
        {meals.map((meal) => {
          const recipe = recipesById[meal.recipeId];
          if (!recipe) return null;
          const day = relativeDayLabel(meal.date);
          const kcal = formatInteger(recipe.perServing.kcal);
          return (
            <View
              key={`${meal.dayOffset}-${meal.slot}`}
              style={styles.card}
              accessible
              accessibilityLabel={format(strings.home.upcomingA11y, {
                day,
                title: recipe.title,
                kcal,
              })}
            >
              <View style={styles.image}>
                {recipe.imageUrl ? (
                  <Image
                    source={recipe.imageUrl}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={300}
                  />
                ) : (
                  <LinearGradient
                    colors={[colors.surfaceRaised, colors.surface]}
                    style={StyleSheet.absoluteFill}
                  />
                )}
              </View>
              <View style={styles.texts}>
                <Text variant="overline" color="accentText">
                  {day}
                </Text>
                <Text variant="label" numberOfLines={2}>
                  {recipe.title}
                </Text>
                <Text variant="caption" color="textSubtle">
                  {format(strings.common.kcal, { value: kcal })}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  heading: {
    paddingHorizontal: spacing.lg + spacing.xs,
  },
  strip: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    // Room for the card shadows, which would otherwise be clipped by the scroll view.
    paddingBottom: spacing.lg,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
    ...shadows.card,
  },
  image: {
    height: 112,
    backgroundColor: colors.surfaceRaised,
  },
  texts: {
    padding: spacing.md,
    gap: spacing.xxs,
  },
});
