import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button, Card, haptics, SelectChip, Text, TextField } from '@/components/ui';
import { useDiaryStore } from '@/data/stores/diary';
import type { DiaryMeal } from '@/data/types';
import { DIARY_MEALS } from '@/domain/diary';
import { format, formatInteger, strings } from '@/i18n';
import { today } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { colors, spacing } from '@/theme';

const t = strings.quickAdd;
const PRESETS = [100, 200, 300, 500, 800];
const MAX_KCAL = 5000;

/** "Pikalisäys": calories without choosing a food. */
export default function QuickAddScreen() {
  const params = useLocalSearchParams<{ meal?: DiaryMeal; date?: string }>();
  const addEntry = useDiaryStore((s) => s.add);
  const removeEntry = useDiaryStore((s) => s.remove);
  const [kcal, setKcal] = useState(300);
  const [name, setName] = useState('');
  const [meal, setMeal] = useState<DiaryMeal>(params.meal ?? 'snack');

  const add = () => {
    const entry = addEntry({
      date: params.date ?? today(),
      meal,
      name: name.trim() || t.title,
      basis: { kind: 'quick' },
      quantity: kcal,
      estimate: false,
    });
    haptics.success();
    showToast(format(t.added, { value: formatInteger(kcal) }), {
      label: strings.common.undo,
      onPress: () => removeEntry(entry.id),
    });
    router.dismissTo('/diary');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={t.title} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text variant="body" color="textMuted">
            {t.body}
          </Text>
          <Card style={styles.gap}>
            <Text variant="overline" color="textSubtle">
              {t.kcal}
            </Text>
            <TextField
              large
              value={kcal > 0 ? String(kcal) : ''}
              onChangeText={(text) => setKcal(Math.min(MAX_KCAL, Number(text.replace(/\D/g, ''))))}
              keyboardType="number-pad"
              maxLength={4}
              accessibilityLabel={t.kcal}
              trailing={
                <Text variant="title" color="textMuted">
                  {strings.common.kcalUnit}
                </Text>
              }
            />
            <View style={styles.chips}>
              {PRESETS.map((value) => (
                <SelectChip
                  key={value}
                  role="radio"
                  label={format(strings.common.kcal, { value })}
                  selected={kcal === value}
                  onPress={() => setKcal(value)}
                />
              ))}
            </View>
          </Card>
          <View style={styles.gapSm}>
            <Text variant="overline" color="textSubtle">
              {t.nameLabel}
            </Text>
            <TextField
              value={name}
              onChangeText={setName}
              placeholder={t.namePlaceholder}
              accessibilityLabel={t.nameLabel}
              maxLength={40}
            />
          </View>
          <View style={styles.gapSm}>
            <Text variant="overline" color="textSubtle">
              {strings.diaryAdd.meal}
            </Text>
            <View style={styles.chips} accessibilityRole="radiogroup">
              {DIARY_MEALS.map((option) => (
                <SelectChip
                  key={option}
                  role="radio"
                  label={strings.diaryMeals[option]}
                  selected={meal === option}
                  onPress={() => setMeal(option)}
                />
              ))}
            </View>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Button
            label={format(t.add, { value: formatInteger(kcal) })}
            onPress={add}
            disabled={kcal <= 0}
            haptic="none"
          />
        </View>
      </KeyboardAvoidingView>
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
  gap: {
    gap: spacing.md,
  },
  gapSm: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
});
