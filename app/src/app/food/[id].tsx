import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button, EmptyState, haptics, IconButton, Text } from '@/components/ui';
import { FOODS_BY_ID } from '@/data/catalog';
import { useDiaryStore } from '@/data/stores/diary';
import type { DiaryMeal } from '@/data/types';
import { entryMacros } from '@/domain/diary';
import { AmountEditor } from '@/features/diary/AmountEditor';
import { format, formatInteger, strings } from '@/i18n';
import { today } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { colors, spacing } from '@/theme';

/** Adds a food from the search list: portion or grams, meal, macro preview. */
export default function FoodScreen() {
  const params = useLocalSearchParams<{ id: string; meal?: DiaryMeal; date?: string }>();
  const food = FOODS_BY_ID[params.id];
  const addEntry = useDiaryStore((s) => s.add);
  const removeEntry = useDiaryStore((s) => s.remove);
  const toggleFavorite = useDiaryStore((s) => s.toggleFavoriteFood);
  const isFavorite = useDiaryStore((s) => s.favoriteFoodIds.includes(params.id));
  const [grams, setGrams] = useState(food?.portions[0]?.grams ?? 100);
  const [meal, setMeal] = useState<DiaryMeal>(params.meal ?? 'snack');

  if (!food) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader />
        <EmptyState icon="search" title={strings.diaryAdd.noResultsTitle} body={strings.diaryAdd.noResultsBody} />
      </SafeAreaView>
    );
  }

  const basis = { kind: 'food' as const, foodId: food.id, per100g: food.per100g };
  const add = () => {
    const entry = addEntry({
      date: params.date ?? today(),
      meal,
      name: food.name,
      basis,
      quantity: grams,
      estimate: false,
    });
    haptics.success();
    showToast(format(strings.diaryAdd.added, { name: food.name }), {
      label: strings.common.undo,
      onPress: () => removeEntry(entry.id),
    });
    router.dismissTo('/diary');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader
        title={food.name}
        trailing={
          <IconButton
            icon="heart"
            variant="plain"
            iconColor={isFavorite ? 'danger' : 'textMuted'}
            fill={isFavorite ? 'danger' : undefined}
            accessibilityLabel={isFavorite ? strings.foodFavorites.remove : strings.foodFavorites.add}
            accessibilityState={{ selected: isFavorite }}
            haptic="select"
            onPress={() => toggleFavorite(food.id)}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.titleBlock}>
          <Text variant="display" accessibilityRole="header">
            {food.name}
          </Text>
          <Text variant="caption" color="textSubtle">
            {format(strings.diaryAdd.per100, { kcal: formatInteger(food.per100g.kcal) })}
          </Text>
        </View>
        <AmountEditor
          kind="food"
          grams={grams}
          onGramsChange={setGrams}
          portions={food.portions}
          meal={meal}
          onMealChange={setMeal}
          preview={entryMacros({ basis, quantity: grams })}
        />
      </ScrollView>
      <View style={styles.footer}>
        <Button label={strings.food.add} onPress={add} disabled={grams <= 0} haptic="none" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  titleBlock: {
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
});
