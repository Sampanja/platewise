import { StyleSheet, View } from 'react-native';

import { FoodIllustration } from '@/components/FoodIllustration';
import { Button, Card, Text } from '@/components/ui';
import { MascotSays } from '@/features/mascot/SpeechBubble';
import { useCharacter } from '@/features/mascot/useCharacter';
import { strings } from '@/i18n';
import { radii, spacing, themedStyles } from '@/theme';

type Props = {
  onCreate: () => void;
};

/**
 * No plan yet: an inviting card with the single main action. The hero is a
 * neutral vegetable bowl illustration, never a specific dish that might not
 * suit the user's diet.
 */
export function EmptyPlanCard({ onCreate }: Props) {
  const t = strings.home;
  const { voice } = useCharacter();
  return (
    <Card padding="flush">
      <View style={styles.hero}>
        <FoodIllustration dishType="bowl" protein="none" seed="home-hero" style={StyleSheet.absoluteFill} />
        <View style={styles.heroText}>
          <Text variant="display" accessibilityRole="header">
            {t.emptyTitle}
          </Text>
        </View>
      </View>
      <View style={styles.body}>
        <MascotSays state="cooking" message={voice.empty.plan} size={60} />
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
