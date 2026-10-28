import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Chip, Text } from '@/components/ui';
import { format, formatEuro, strings } from '@/i18n';
import { colors, gradients, radii, spacing } from '@/theme';

/** Display model for a recipe card. Macros come from Fineli, price from our price table. */
export type RecipeCardData = {
  id: string;
  title: string;
  description: string | null;
  cookTimeMin: number;
  servings: number;
  kcalPerServing: number;
  proteinGPerServing: number;
  carbsGPerServing: number;
  fatGPerServing: number;
  /** Chain-adjusted estimate for all servings, in cents. */
  priceEstimateCents: number;
  goodForLeftovers: boolean;
  /** Null while the image is still being generated. */
  imageUrl: string | null;
};

export type RecipeCardProps = {
  recipe: RecipeCardData;
  added: boolean;
  onAdd: () => void;
  onSwap: () => void;
};

const t = strings;

export function RecipeCard({ recipe, added, onAdd, onSwap }: RecipeCardProps) {
  const pricePerServing = recipe.priceEstimateCents / 100 / recipe.servings;

  return (
    <Card padding="flush">
      <View style={styles.hero}>
        {recipe.imageUrl ? (
          <Image
            source={recipe.imageUrl}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={300}
            accessibilityLabel={format(t.recipe.imageLabel, { title: recipe.title })}
          />
        ) : (
          <LinearGradient
            colors={[colors.surfaceRaised, colors.surface]}
            style={StyleSheet.absoluteFill}
          />
        )}
        <LinearGradient
          colors={gradients.scrim}
          locations={[0.35, 0.65, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.heroTop}>
          <Chip tone="glass" label={format(t.common.minutes, { count: recipe.cookTimeMin })} />
          <Chip tone="glass" label={format(t.common.servings, { count: recipe.servings })} />
        </View>

        <View style={styles.heroBottom}>
          <Text variant="display" accessibilityRole="header">
            {recipe.title}
          </Text>
          {recipe.description ? (
            <Text variant="body" color="textMuted" numberOfLines={2}>
              {recipe.description}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.macros}>
          <Macro value={Math.round(recipe.kcalPerServing)} unit="kcal" label={t.macros.energy} />
          <Macro value={Math.round(recipe.proteinGPerServing)} unit="g" label={t.macros.protein} />
          <Macro value={Math.round(recipe.carbsGPerServing)} unit="g" label={t.macros.carbs} />
          <Macro value={Math.round(recipe.fatGPerServing)} unit="g" label={t.macros.fat} />
        </View>

        <View style={styles.priceRow}>
          <View style={styles.price}>
            <Text variant="overline" color="textSubtle">
              {t.common.priceEstimate}
            </Text>
            <Text variant="title" color="accentText" style={styles.tabular}>
              {formatEuro(recipe.priceEstimateCents / 100)}
            </Text>
            <Text variant="caption" color="textSubtle">
              {formatEuro(pricePerServing)} {t.common.perServing}
            </Text>
          </View>
          {recipe.goodForLeftovers ? <Chip tone="success" label={t.recipe.lunchTomorrow} /> : null}
        </View>

        <Button
          label={added ? `✓  ${t.recipe.addedToPlan}` : t.recipe.addToPlan}
          variant={added ? 'secondary' : 'primary'}
          haptic={added ? 'tap' : 'success'}
          onPress={onAdd}
          accessibilityState={{ selected: added }}
        />
        <Button label={t.recipe.swap} variant="ghost" size="compact" onPress={onSwap} />
      </View>
    </Card>
  );
}

function Macro({ value, unit, label }: { value: number; unit: string; label: string }) {
  return (
    <View
      style={styles.macro}
      accessible
      accessibilityLabel={format(t.macros.a11yPerServing, { value, unit, label })}
    >
      <Text variant="number">
        {value}
        <Text variant="caption" color="textSubtle">
          {' '}
          {unit}
        </Text>
      </Text>
      <Text variant="caption" color="textSubtle" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    aspectRatio: 4 / 5,
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
    gap: spacing.xs,
  },
  body: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  macros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  macro: {
    flex: 1,
    gap: spacing.xxs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  price: {
    gap: spacing.xxs,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
