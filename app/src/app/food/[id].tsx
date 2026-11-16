import { Image } from 'expo-image';
import { foodQuality } from '@/data/catalog/quality';
import { QualityButton } from '@/features/quality/QualityButton';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button, Chip, EmptyState, haptics, Icon, IconButton, Text } from '@/components/ui';
import { useFood } from '@/data/foods';
import { useCustomFoodsStore } from '@/data/stores/customFoods';
import { useDiaryStore } from '@/data/stores/diary';
import type { DiaryMeal, Food } from '@/data/types';
import { entryMacros } from '@/domain/diary';
import { AmountEditor } from '@/features/diary/AmountEditor';
import { NutrientTable } from '@/features/diary/NutrientTable';
import { format, formatInteger, strings } from '@/i18n';
import { today } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { colors, fixed, radii, spacing, themedStyles } from '@/theme';

/**
 * Adds a food to the diary: portion or grams, meal, macro preview and the
 * full nutrient table. Works for Fineli foods, own foods and barcode products
 * (their source is always shown).
 */
export default function FoodScreen() {
  const params = useLocalSearchParams<{ id: string; meal?: DiaryMeal | ''; date?: string }>();
  const food = useFood(params.id);
  const addEntry = useDiaryStore((s) => s.add);
  const removeEntry = useDiaryStore((s) => s.remove);
  const toggleFavorite = useDiaryStore((s) => s.toggleFavoriteFood);
  const isFavorite = useDiaryStore((s) => s.favoriteFoodIds.includes(params.id));
  const removeCustom = useCustomFoodsStore((s) => s.remove);
  const [grams, setGrams] = useState(food?.portions[0]?.grams ?? 100);
  const [meal, setMeal] = useState<DiaryMeal>(params.meal || 'snack');
  const [imageFailed, setImageFailed] = useState(false);

  if (!food) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader />
        <EmptyState icon="search" title={strings.diaryAdd.noResultsTitle} body={strings.diaryAdd.noResultsBody} />
      </SafeAreaView>
    );
  }

  const source = food.source ?? 'fineli';
  const custom = source !== 'fineli';
  const basis = { kind: 'food' as const, foodId: food.id, per100g: food.per100g };
  const add = () => {
    const entry = addEntry({
      date: params.date || today(),
      meal,
      name: food.brand ? `${food.name} (${food.brand})` : food.name,
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

  const confirmDelete = () =>
    Alert.alert(strings.customFood.delete, food.name, [
      { text: strings.common.cancel, style: 'cancel' },
      {
        text: strings.common.delete,
        style: 'destructive',
        onPress: () => {
          removeCustom(food.id);
          showToast(format(strings.customFood.deleted, { name: food.name }));
          router.back();
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader
        title={food.name}
        trailing={
          <View style={styles.headerActions}>
            {custom ? (
              <IconButton
                icon="pencil"
                variant="plain"
                accessibilityLabel={strings.common.edit}
                onPress={() => router.push({ pathname: '/custom-food', params: { id: food.id } })}
              />
            ) : null}
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
          </View>
        }
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.titleBlock}>
          {food.imageUrl && !imageFailed ? (
            <Image
              source={food.imageUrl}
              style={styles.image}
              contentFit="contain"
              onError={() => setImageFailed(true)}
              accessibilityIgnoresInvertColors
            />
          ) : null}
          <Text variant="display" accessibilityRole="header">
            {food.name}
          </Text>
          <FoodQuality food={food} />
          {food.brand ? (
            <Text variant="body" color="textMuted">
              {food.brand}
            </Text>
          ) : null}
          <View style={styles.chips}>
            <Chip tone={custom ? 'accent' : 'neutral'} label={strings.source[source]} />
            <Text variant="caption" color="textSubtle">
              {format(strings.diaryAdd.per100, { kcal: formatInteger(food.per100g.kcal) })}
            </Text>
          </View>
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
        <NutrientTable values={food.per100g} />
        {custom ? (
          <View style={styles.sourceNote}>
            <Icon name="info" size={16} color="textSubtle" />
            <Text variant="caption" color="textSubtle" style={styles.flex}>
              {strings.sourceNote[source as 'barcode' | 'own' | 'label']}
            </Text>
          </View>
        ) : null}
        {custom ? <Button label={strings.customFood.delete} variant="ghost" size="compact" onPress={confirmDelete} /> : null}
      </ScrollView>
      <View style={styles.footer}>
        <Button label={strings.food.add} onPress={add} disabled={grams <= 0} haptic="none" />
      </View>
    </SafeAreaView>
  );
}

/** The food's grade: Open Food Facts' Nutri-Score for products that have one, otherwise PlatePal's own. */
function FoodQuality({ food }: { food: Food }) {
  if (food.nutriScore) return <QualityButton title={food.name} grade={food.nutriScore} score={null} />;
  const score = foodQuality(food);
  return <QualityButton title={food.name} grade={score.grade} score={score} />;
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
      paddingBottom: spacing.xxl,
      gap: spacing.xl,
    },
    headerActions: {
      flexDirection: 'row',
    },
    titleBlock: {
      gap: spacing.xs,
      paddingHorizontal: spacing.xs,
    },
    image: {
      height: 160,
      borderRadius: radii.card,
      backgroundColor: fixed.productBackdrop,
      marginBottom: spacing.sm,
    },
    chips: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flexWrap: 'wrap',
    },
    sourceNote: {
      flexDirection: 'row',
      gap: spacing.sm,
      alignItems: 'flex-start',
    },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
  }),
);
