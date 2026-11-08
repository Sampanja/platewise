import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { openRecipe } from '@/components/RecipeCard';
import { RecipeImage } from '@/components/RecipeImage';
import { useTabBarSpace } from '@/components/TabBar';
import { Button, Card, FadeInView, Icon, PressableScale, Text } from '@/components/ui';
import { CHAINS_BY_CODE, RECIPES_BY_ID } from '@/data/catalog';
import { useActivePlan } from '@/data/hooks';
import { usePlansStore } from '@/data/stores/plans';
import { lastDinnerDate, mealDate } from '@/domain/plan';
import { ProposalCard } from '@/features/home/ProposalCard';
import { format, formatCents, strings } from '@/i18n';
import { relativeDayLabel, shortDate, today } from '@/lib/dates';
import { colors, radii, spacing } from '@/theme';

const t = strings.plan;

/** Suunnittele tab: start the questionnaire, continue a proposal or look at the current plan. */
export default function PlanScreen() {
  const tabBarSpace = useTabBarSpace();
  const plan = useActivePlan();
  const proposal = usePlansStore((s) => s.proposal);
  const pinned = usePlansStore((s) => s.pinnedRecipeIds);
  const start = () => router.push('/questionnaire');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}>
        <View style={styles.header}>
          <Text variant="displayLarge" accessibilityRole="header">
            {t.hubTitle}
          </Text>
          <Text variant="body" color="textMuted">
            {t.hubIntro}
          </Text>
        </View>

        {proposal ? (
          <FadeInView>
            <ProposalCard />
          </FadeInView>
        ) : null}

        {pinned.length > 0 ? (
          <FadeInView>
            <Card style={styles.pinned}>
              <Icon name="sparkles" color="accentText" />
              <View style={styles.flex}>
                <Text variant="bodyStrong">{t.pinnedTitle}</Text>
                <Text variant="caption" color="textMuted">
                  {pinned.map((id) => RECIPES_BY_ID[id]?.title).filter(Boolean).join(', ')}
                </Text>
              </View>
            </Card>
          </FadeInView>
        ) : null}

        {plan ? (
          <FadeInView delay={60}>
            <Card style={styles.current}>
              <View style={styles.currentHeader}>
                <View style={styles.flex}>
                  <Text variant="overline" color="accentText">
                    {t.currentTitle}
                  </Text>
                  <Text variant="title">
                    {format(t.currentRange, {
                      start: shortDate(plan.startDate),
                      end: shortDate(lastDinnerDate(plan)),
                    })}
                  </Text>
                  <Text variant="caption" color="textSubtle">
                    {`${formatCents(plan.estimatedTotalCents)} / ${formatCents(plan.budgetCents)} · ${
                      CHAINS_BY_CODE[plan.chainCode].name
                    }`}
                  </Text>
                </View>
              </View>
              <View>
                {plan.meals
                  .filter((meal) => meal.slot === 'dinner')
                  .sort((a, b) => a.dayOffset - b.dayOffset)
                  .map((meal) => {
                    const recipe = RECIPES_BY_ID[meal.recipeId];
                    if (!recipe) return null;
                    const date = mealDate(plan, meal);
                    const past = date < today();
                    return (
                      <PressableScale
                        key={meal.dayOffset}
                        onPress={() => openRecipe(recipe.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`${relativeDayLabel(date)}: ${recipe.title}`}
                        style={[styles.mealRow, past && styles.past]}
                      >
                        <RecipeImage recipe={recipe} style={styles.thumb} />
                        <View style={styles.flex}>
                          <Text variant="caption" color={date === today() ? 'accentText' : 'textSubtle'}>
                            {relativeDayLabel(date)}
                          </Text>
                          <Text variant="bodyStrong" numberOfLines={1}>
                            {recipe.title}
                          </Text>
                        </View>
                        <Icon name="chevronRight" size={18} color="textSubtle" />
                      </PressableScale>
                    );
                  })}
              </View>
              <Button
                label={t.openList}
                variant="secondary"
                icon={<Icon name="basket" size={20} />}
                onPress={() => router.push('/shopping-list')}
              />
            </Card>
          </FadeInView>
        ) : (
          <FadeInView delay={60}>
            <Card style={styles.how}>
              <Text variant="title" accessibilityRole="header">
                {t.howTitle}
              </Text>
              {[t.how1, t.how2, t.how3].map((text, i) => (
                <View key={text} style={styles.howRow}>
                  <View style={styles.howNumber}>
                    <Text variant="bodyStrong" color="textOnAccent">
                      {i + 1}
                    </Text>
                  </View>
                  <Text variant="body" style={styles.flex}>
                    {text}
                  </Text>
                </View>
              ))}
              <Text variant="caption" color="textSubtle">
                {strings.budget.explainer}
              </Text>
            </Card>
          </FadeInView>
        )}

        <FadeInView delay={120}>
          <Button label={plan ? t.startNew : t.start} onPress={start} />
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  pinned: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  current: {
    gap: spacing.lg,
  },
  currentHeader: {
    flexDirection: 'row',
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  past: {
    opacity: 0.5,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: radii.sm,
  },
  how: {
    gap: spacing.lg,
  },
  howRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  howNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
