import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, FadeInView, Text } from '@/components/ui';
import { RECIPES_BY_ID } from '@/data/catalog';
import { useActivePlan, useDayNutrition, useMonthSavingsCents } from '@/data/hooks';
import type { DayNutrition, MealPlan } from '@/data/types';
import { lastDinnerDate, upcomingDinners } from '@/domain/plan';
import { BudgetCard } from '@/features/home/BudgetCard';
import { NewListCard } from '@/features/home/NewListCard';
import { NutritionCard } from '@/features/home/NutritionCard';
import { TodayMealCard } from '@/features/home/TodayMealCard';
import { UpcomingMeals } from '@/features/home/UpcomingMeals';
import { strings } from '@/i18n';
import { addDays, greeting, longDate, today } from '@/lib/dates';
import { colors, spacing } from '@/theme';

const t = strings.home;
/** Delay between sections as they fade in, top to bottom. */
const STAGGER_MS = 70;

export default function HomeScreen() {
  const plan = useActivePlan();
  const monthSavingsCents = useMonthSavingsCents();
  const nutrition = useDayNutrition(today());

  const goToPlan = () => router.navigate('/plan');
  const goToDiary = () => router.navigate('/diary');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.padded, styles.header]}>
          <Text variant="overline" color="accentText">
            {longDate(today())}
          </Text>
          <Text variant="displayLarge" accessibilityRole="header">
            {greeting()}
          </Text>
        </View>

        {plan === null ? (
          <NoPlanContent nutrition={nutrition} onCreate={goToPlan} onOpenDiary={goToDiary} />
        ) : (
          <PlanContent
            plan={plan}
            monthSavingsCents={monthSavingsCents}
            nutrition={nutrition}
            onCreate={goToPlan}
            onOpenDiary={goToDiary}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

type ContentProps = {
  nutrition: DayNutrition | undefined;
  onCreate: () => void;
  onOpenDiary: () => void;
};

function PlanContent({
  plan,
  monthSavingsCents,
  nutrition,
  onCreate,
  onOpenDiary,
}: ContentProps & { plan: MealPlan; monthSavingsCents: number | undefined }) {
  const recipesById = RECIPES_BY_ID;
  const now = today();
  const [next, ...later] = upcomingDinners(plan, now);
  const endDate = lastDinnerDate(plan);
  // When the list is about to run out, making a new one is the most useful next step.
  const endingSoon = endDate <= addDays(now, 1);
  const nextRecipe = next ? recipesById[next.recipeId] : undefined;

  const newList = <NewListCard endDate={endDate} onPress={onCreate} />;
  let step = 0;
  const delay = () => STAGGER_MS * step++;

  return (
    <>
      {endingSoon ? (
        <FadeInView delay={delay()} style={styles.padded}>
          {newList}
        </FadeInView>
      ) : null}

      {next && nextRecipe ? (
        <FadeInView delay={delay()} style={styles.padded}>
          <TodayMealCard meal={next} recipe={nextRecipe} />
        </FadeInView>
      ) : null}

      {later.length > 0 ? (
        <FadeInView delay={delay()}>
          <UpcomingMeals meals={later} recipesById={recipesById} />
        </FadeInView>
      ) : null}

      {nutrition ? (
        <FadeInView delay={delay()} style={styles.padded}>
          <NutritionCard nutrition={nutrition} onOpenDiary={onOpenDiary} />
        </FadeInView>
      ) : null}

      <FadeInView delay={delay()} style={styles.padded}>
        <BudgetCard plan={plan} monthSavingsCents={monthSavingsCents} />
      </FadeInView>

      {!endingSoon ? (
        <FadeInView delay={delay()} style={styles.padded}>
          {newList}
        </FadeInView>
      ) : null}
    </>
  );
}

function NoPlanContent({ nutrition, onCreate, onOpenDiary }: ContentProps) {
  return (
    <>
      <FadeInView style={styles.padded}>
        <EmptyState
          icon="plate"
          title={t.emptyTitle}
          body={t.emptyBody}
          action={{ label: t.emptyCta, onPress: onCreate }}
        />
      </FadeInView>
      {nutrition ? (
        <FadeInView delay={STAGGER_MS} style={styles.padded}>
          <NutritionCard nutrition={nutrition} onOpenDiary={onOpenDiary} />
        </FadeInView>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    gap: spacing.xs,
    paddingHorizontal: spacing.lg + spacing.xs,
  },
});
