import { StyleSheet, View } from 'react-native';

import { RecipeImage } from '@/components/RecipeImage';
import { Button, Card, Text } from '@/components/ui';
import { RECIPES_BY_ID } from '@/data/catalog';
import { strings } from '@/i18n';
import { radii, spacing, themedStyles } from '@/theme';

type Props = {
  onCreate: () => void;
};

const HERO_RECIPE = RECIPES_BY_ID['chicken-curry'];

/** No plan yet: an inviting photo card with the single main action. */
export function EmptyPlanCard({ onCreate }: Props) {
  const t = strings.home;
  return (
    <Card padding="flush">
      <View style={styles.hero}>
        {HERO_RECIPE ? <RecipeImage recipe={HERO_RECIPE} scrim style={StyleSheet.absoluteFill} /> : null}
        <View style={styles.heroText}>
          <Text variant="display" accessibilityRole="header">
            {t.emptyTitle}
          </Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text variant="body" color="textMuted">
          {t.emptyBody}
        </Text>
        <Button label={t.emptyCta} onPress={onCreate} />
        <Text variant="caption" color="textSubtle">
          {strings.budget.explainer}
        </Text>
      </View>
    </Card>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    hero: {
      aspectRatio: 16 / 10,
      justifyContent: 'flex-end',
      borderTopLeftRadius: radii.card,
      borderTopRightRadius: radii.card,
      overflow: 'hidden',
    },
    heroText: {
      padding: spacing.xl,
      paddingBottom: spacing.md,
    },
    body: {
      padding: spacing.xl,
      paddingTop: spacing.md,
      gap: spacing.lg,
    },
  }),
);
