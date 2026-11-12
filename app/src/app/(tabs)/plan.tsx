import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { withFreezeOnBlur } from '@/components/freezeOnBlur';
import { openRecipe } from '@/components/RecipeCard';
import { RecipeImage } from '@/components/RecipeImage';
import { useTabBarSpace } from '@/components/TabBar';
import { Button, Card, FadeInView, Icon, PressableScale, Text } from '@/components/ui';
import { CHAINS_BY_CODE, INGREDIENTS_BY_ID, RECIPES, RECIPES_BY_ID } from '@/data/catalog';
import { useActivePlan, useUserRules } from '@/data/hooks';
import { usePlansStore } from '@/data/stores/plans';
import type { MealPlan } from '@/data/types';
import { replacementDinner, replacePlanDinner } from '@/domain/generate';
import { lastDinnerDate, mealDate } from '@/domain/plan';
import { isRecipeAllowed } from '@/domain/recipes';
import { showToast } from '@/lib/toast';
import { ProposalCard } from '@/features/home/ProposalCard';
import { format, formatCents, strings } from '@/i18n';
import { relativeDayLabel, shortDate, today } from '@/lib/dates';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.plan;

/** Suunnittele tab: start the questionnaire, continue a proposal or look at the current plan. */
function PlanScreen() {
  const tabBarSpace = useTabBarSpace();
  const plan = useActivePlan();
  const proposal = usePlansStore((s) => s.proposal);
  const pinned = usePlansStore((s) => s.pinnedRecipeIds);
  const savePlan = usePlansStore((s) => s.savePlan);
  const rules = useUserRules();
  const start = () => router.push('/questionnaire');

  // The one strict gate, with the plan's own extra rules on top of the profile's.
  const suits = (target: MealPlan, recipeId: string) => {
    const recipe = RECIPES_BY_ID[recipeId];
    return (
      recipe !== undefined &&
      isRecipeAllowed(
        recipe,
        {
          allergens: [...rules.allergens, ...target.extraAllergens],
          diets: [...rules.diets, ...target.extraDiets],
        },
        INGREDIENTS_BY_ID,
      )
    );
  };
  const swapToSuitable = (target: MealPlan, dayOffset: number, dayLabel: string) => {
    const replacement = replacementDinner(target, dayOffset, RECIPES, INGREDIENTS_BY_ID, rules);
    if (!replacement) return;
    savePlan(replacePlanDinner(target, dayOffset, replacement.id, RECIPES_BY_ID, INGREDIENTS_BY_ID, rules.pantry));
    showToast(format(t.swappedToast, { day: dayLabel, title: replacement.title }));
  };
  const pinnedTitles = pinned
    .map((id) => RECIPES_BY_ID[id])
    .filter((recipe) => recipe && isRecipeAllowed(recipe, rules, INGREDIENTS_BY_ID))
    .map((recipe) => recipe.title);

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

        {pinnedTitles.length > 0 ? (
          <FadeInView>
            <Card style={styles.pinned}>
              <Icon name="sparkles" color="accentText" />
              <View style={styles.flex}>
                <Text variant="bodyStrong">{t.pinnedTitle}</Text>
                <Text variant="caption" color="textMuted">
                  {pinnedTitles.join(', ')}
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
                    if (!suits(plan, recipe.id)) {
                      // Never show an unsuitable dish; offer a suitable one instead.
                      return (
                        <View key={meal.dayOffset} style={[styles.mealRow, past && styles.past]}>
                          <View style={[styles.thumb, styles.blocked]}>
                            <Icon name="shield" size={22} color="textSubtle" />
                          </View>
                          <View style={styles.flex}>
                            <Text variant="caption" color="textSubtle">
                              {relativeDayLabel(date)}
                            </Text>
                            <Text variant="bodyStrong">{t.notSuitable}</Text>
                            <Text variant="caption" color="textSubtle">
                              {t.notSuitableBody}
                            </Text>
                          </View>
                          {!past ? (
                            <Button
                              size="compact"
                              variant="secondary"
                              label={t.swapToSuitable}
                              onPress={() => swapToSuitable(plan, meal.dayOffset, relativeDayLabel(date))}
                            />
                          ) : null}
                        </View>
                      );
                    }
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

const styles = themedStyles(() =>
  StyleSheet.create({
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
    blocked: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceRaised,
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
  }),
);

export default withFreezeOnBlur(PlanScreen);
