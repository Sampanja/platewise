import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button, Chip, EmptyState, haptics, Icon, Text } from '@/components/ui';
import { FOODS_BY_ID } from '@/data/catalog';
import { useDiaryStore } from '@/data/stores/diary';
import type { DiaryMeal } from '@/data/types';
import { entryMacros } from '@/domain/diary';
import { AmountEditor } from '@/features/diary/AmountEditor';
import { strings } from '@/i18n';
import { showToast } from '@/lib/toast';
import { colors, spacing } from '@/theme';

/** Edits or deletes a diary entry (amount and meal). */
export default function EntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = useDiaryStore((s) => s.entries.find((e) => e.id === id));
  const update = useDiaryStore((s) => s.update);
  const remove = useDiaryStore((s) => s.remove);
  const restore = useDiaryStore((s) => s.restore);
  const [quantity, setQuantity] = useState(entry?.quantity ?? 1);
  const [meal, setMeal] = useState<DiaryMeal>(entry?.meal ?? 'snack');

  if (!entry) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader />
        <EmptyState icon="diary" title={strings.errors.genericTitle} body={strings.errors.genericBody} />
      </SafeAreaView>
    );
  }

  const save = () => {
    update(entry.id, { quantity, meal });
    haptics.success();
    router.back();
  };
  const destroy = () => {
    const removed = remove(entry.id);
    haptics.warning();
    if (removed) showToast(strings.diary.deleted, { label: strings.common.undo, onPress: () => restore(removed) });
    router.back();
  };

  const preview = entryMacros({ basis: entry.basis, quantity });
  const portions = entry.basis.kind === 'food' ? (FOODS_BY_ID[entry.basis.foodId]?.portions ?? []) : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={strings.common.edit} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.titleBlock}>
          <Text variant="display" accessibilityRole="header">
            {entry.name}
          </Text>
          {entry.estimate ? (
            <View style={styles.estimate}>
              <Chip tone="accent" label={strings.common.estimate} />
              <Text variant="caption" color="textSubtle" style={styles.flex}>
                {strings.food.estimateNote}
              </Text>
            </View>
          ) : null}
        </View>
        {entry.basis.kind === 'food' ? (
          <AmountEditor
            kind="food"
            grams={quantity}
            onGramsChange={setQuantity}
            portions={portions}
            meal={meal}
            onMealChange={setMeal}
            preview={preview}
          />
        ) : (
          <AmountEditor
            kind="recipe"
            servings={quantity}
            onServingsChange={setQuantity}
            meal={meal}
            onMealChange={setMeal}
            preview={preview}
          />
        )}
        <Button
          label={strings.food.delete}
          variant="ghost"
          size="compact"
          icon={<Icon name="trash" size={18} color="danger" />}
          onPress={destroy}
          haptic="none"
        />
      </ScrollView>
      <View style={styles.footer}>
        <Button label={strings.food.save} onPress={save} disabled={quantity <= 0} haptic="none" />
      </View>
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
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  titleBlock: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  estimate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
});
