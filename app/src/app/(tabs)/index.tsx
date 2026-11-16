import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { withFreezeOnBlur } from '@/components/freezeOnBlur';
import { useTabBarSpace } from '@/components/TabBar';
import { FadeInView, Text } from '@/components/ui';
import { INGREDIENTS_BY_ID, RECIPES_BY_ID } from '@/data/catalog';
import {
  useRecipeAllowed,
  useActivePlan,
  useCurrentShoppingList,
  useDayNutrition,
  useMonthSavingsCents,
  useUserRules,
} from '@/data/hooks';
import { useAllowedRecipesQuery } from '@/data/queries';
import { useDiaryStore } from '@/data/stores/diary';
import { useFavoritesStore } from '@/data/stores/favorites';
import { usePlansStore } from '@/data/stores/plans';
import { useProfileStore } from '@/data/stores/profile';
import type { MealPlan } from '@/data/types';
import { lastDinnerDate, mealDate, upcomingDinners } from '@/domain/plan';
import { daySeed, recommendRecipes } from '@/domain/recommend';
import { BudgetCard } from '@/features/home/BudgetCard';
import { CompanionCard } from '@/features/home/CompanionCard';
import { EmptyPlanCard } from '@/features/home/EmptyPlanCard';
import { NewListCard } from '@/features/home/NewListCard';
import { NutritionCard } from '@/features/home/NutritionCard';
import { ProposalCard } from '@/features/home/ProposalCard';
import { RecipeRow } from '@/features/home/RecipeRow';
import { SavingsCard } from '@/features/home/SavingsCard';
import { TodayMealCard } from '@/features/home/TodayMealCard';
import { format, strings } from '@/i18n';
import { addDays, greeting, longDate, relativeDayLabel, today } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { useCharacter } from '@/features/mascot/useCharacter';
import { colors, spacing, themedStyles } from '@/theme';

const t = strings.home;
/** Delay between sections as they fade in, top to bottom. */
const STAGGER_MS = 70;

function HomeScreen() {
  const tabBarSpace = useTabBarSpace();
  const now = today();
  const name = useProfileStore((s) => s.name);
  const hasGoal = useProfileStore((s) => s.hasCalorieGoal);
  const hideCalories = useProfileStore((s) => s.hideCalories);
  const todayEntryCount = useDiaryStore((s) => s.entries.filter((e) => e.date === now).length);
  const plan = useActivePlan();
  const proposal = usePlansStore((s) => s.proposal);
  const savings = useMonthSavingsCents();
  const nutrition = useDayNutrition(now);
  const shopping = useCurrentShoppingList();
  const rules = useUserRules();
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const recipesQuery = useAllowedRecipesQuery();
  const characterRenewed = useProfileStore((s) => s.characterRenewed);
  const character = useCharacter();

  // The saved character was retired: say once which one took its place.
  useEffect(() => {
    if (!characterRenewed) return;
    useProfileStore.getState().update({ characterRenewed: false });
    showToast(format(strings.castRenewed, { name: character.voice.name }));
  }, [characterRenewed, character.voice.name]);

  const recommended = useMemo(() => {
    if (!recipesQuery.data) return [];
    const inPlan = new Set(plan?.meals.map((meal) => meal.recipeId) ?? []);
    return recommendRecipes(recipesQuery.data, INGREDIENTS_BY_ID, rules, favoriteIds, inPlan, daySeed(now));
  }, [recipesQuery.data, plan, rules, favoriteIds, now]);

  const goToPlan = () => router.navigate('/plan');
  const goToDiary = () => router.navigate('/diary');

  let step = 0;
  const delay = () => STAGGER_MS * step++;
  const hello = greeting();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}>
        <View style={[styles.padded, styles.header]}>
          <Text variant="overline" color="accentText">
            {longDate(now)}
          </Text>
          <Text variant="displayLarge" accessibilityRole="header">
            {name.trim() ? format(strings.greetings.withName, { greeting: hello, name: name.trim() }) : hello}
          </Text>
        </View>

        <FadeInView delay={delay()} style={styles.padded}>
          <CompanionCard />
        </FadeInView>

        {proposal ? (
          <FadeInView delay={delay()} style={styles.padded}>
            <ProposalCard />
          </FadeInView>
        ) : null}

        {plan ? (
          <PlanSection
            plan={plan}
            shoppingDone={shopping.list.items.filter((i) => shopping.state.checked.includes(i.ingredientId)).length}
            shoppingTotal={shopping.list.items.length}
            delay={delay}
            onCreate={goToPlan}
          />
        ) : proposal ? null : (
          <FadeInView delay={delay()} style={styles.padded}>
            <EmptyPlanCard onCreate={goToPlan} />
          </FadeInView>
        )}

        <FadeInView delay={delay()} style={styles.padded}>
          <NutritionCard
            nutrition={nutrition}
            hasGoal={hasGoal}
            hideCalories={hideCalories}
            entryCount={todayEntryCount}
            onOpenDiary={goToDiary}
          />
        </FadeInView>

        <FadeInView delay={delay()} style={styles.padded}>
          <SavingsCard savingsCents={savings} />
        </FadeInView>

        <FadeInView delay={delay()}>
          <RecipeRow
            title={t.recommended}
            hint={t.recommendedHint}
            loading={recipesQuery.isPending}
            items={recommended.map((recipe) => ({ key: recipe.id, recipe }))}
          />
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}

type PlanSectionProps = {
  plan: MealPlan;
  shoppingDone: number;
  shoppingTotal: number;
  delay: () => number;
  onCreate: () => void;
};

function PlanSection({ plan, shoppingDone, shoppingTotal, delay, onCreate }: PlanSectionProps) {
  const now = today();
  const allowed = useRecipeAllowed();
  // A dinner that stopped suiting the user (rules changed after accepting) is
  // not shown here; the Suunnittele tab offers a suitable replacement.
  const suits = (recipeId: string) => RECIPES_BY_ID[recipeId] !== undefined && allowed(RECIPES_BY_ID[recipeId]);
  const [next, ...later] = upcomingDinners(plan, now).filter((meal) => suits(meal.recipeId));
  const endDate = lastDinnerDate(plan);
  // When the list is about to run out, making a new one is the most useful next step.
  const endingSoon = endDate <= addDays(now, 1);
  const nextRecipe = next ? RECIPES_BY_ID[next.recipeId] : undefined;
  const lunchToday = plan.meals.find(
    (meal) => meal.slot === 'lunch' && mealDate(plan, meal) === now && suits(meal.recipeId),
  );

  return (
    <>
      {endingSoon ? (
        <FadeInView delay={delay()} style={styles.padded}>
          <NewListCard endDate={endDate} onPress={onCreate} />
        </FadeInView>
      ) : null}

      {next && nextRecipe ? (
        <FadeInView delay={delay()} style={styles.padded}>
          <TodayMealCard
            meal={next}
            recipe={nextRecipe}
            lunchRecipe={lunchToday ? RECIPES_BY_ID[lunchToday.recipeId] : undefined}
          />
        </FadeInView>
      ) : null}

      {later.length > 0 ? (
        <FadeInView delay={delay()}>
          <RecipeRow
            title={t.upcoming}
            items={later
              .filter((meal) => RECIPES_BY_ID[meal.recipeId])
              .map((meal) => ({
                key: `${meal.dayOffset}-${meal.slot}`,
                recipe: RECIPES_BY_ID[meal.recipeId],
                overline: relativeDayLabel(meal.date),
              }))}
          />
        </FadeInView>
      ) : null}

      <FadeInView delay={delay()} style={styles.padded}>
        <BudgetCard plan={plan} shoppingDone={shoppingDone} shoppingTotal={shoppingTotal} />
      </FadeInView>

      {!endingSoon ? (
        <FadeInView delay={delay()} style={styles.padded}>
          <NewListCard endDate={endDate} onPress={onCreate} />
        </FadeInView>
      ) : null}
    </>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      paddingTop: spacing.sm,
      gap: spacing.xl,
    },
    padded: {
      paddingHorizontal: spacing.lg,
    },
    header: {
      gap: spacing.xs,
      paddingHorizontal: spacing.lg + spacing.xs,
    },
  }),
);

export default withFreezeOnBlur(HomeScreen);
