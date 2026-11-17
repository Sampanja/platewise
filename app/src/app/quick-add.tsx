import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button, Card, haptics, SelectChip, SwitchRow, Text, TextField } from '@/components/ui';
import { useDiaryStore } from '@/data/stores/diary';
import type { DiaryMeal } from '@/data/types';
import { DIARY_MEALS } from '@/domain/diary';
import { parseAmount } from '@/domain/nutrition';
import { format, strings } from '@/i18n';
import { EnergyField } from '@/features/shared/EnergyField';
import { formatEnergy } from '@/lib/amounts';
import { today } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { colors, spacing, themedStyles } from '@/theme';

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
  const [withMacros, setWithMacros] = useState(false);
  const [macros, setMacros] = useState({ proteinG: '', carbsG: '', fatG: '' });

  const add = () => {
    const entry = addEntry({
      date: params.date ?? today(),
      meal,
      name: name.trim() || t.title,
      basis: withMacros
        ? {
            kind: 'quick',
            macros: {
              proteinG: parseAmount(macros.proteinG) ?? 0,
              carbsG: parseAmount(macros.carbsG) ?? 0,
              fatG: parseAmount(macros.fatG) ?? 0,
            },
          }
        : { kind: 'quick' },
      quantity: kcal,
      estimate: false,
    });
    haptics.success();
    showToast(format(t.added, { value: formatEnergy(kcal) }), {
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
            <EnergyField large value={kcal} onChange={setKcal} max={MAX_KCAL} accessibilityLabel={t.kcal} />
            <View style={styles.chips}>
              {PRESETS.map((value) => (
                <SelectChip
                  key={value}
                  role="radio"
                  label={formatEnergy(value)}
                  selected={kcal === value}
                  onPress={() => setKcal(value)}
                />
              ))}
            </View>
          </Card>
          <Card style={styles.gap}>
            <SwitchRow label={strings.quickMacros.toggle} value={withMacros} onValueChange={setWithMacros} />
            {withMacros
              ? (['proteinG', 'carbsG', 'fatG'] as const).map((key) => {
                  const label = strings.quickMacros[key === 'proteinG' ? 'protein' : key === 'carbsG' ? 'carbs' : 'fat'];
                  return (
                    <View key={key} style={styles.macroRow}>
                      <Text variant="body" style={styles.flex}>
                        {label}
                      </Text>
                      <TextField
                        value={macros[key]}
                        onChangeText={(text) => setMacros((m) => ({ ...m, [key]: text.replace(/[^d,.]/g, '') }))}
                        keyboardType="decimal-pad"
                        accessibilityLabel={label}
                        placeholder="0"
                        style={styles.macroField}
                        maxLength={5}
                      />
                    </View>
                  );
                })
              : null}
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
            label={format(t.add, { value: formatEnergy(kcal) })}
            onPress={add}
            disabled={kcal <= 0}
            haptic="none"
          />
        </View>
      </KeyboardAvoidingView>
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
      paddingBottom: spacing.xxl,
      gap: spacing.xl,
    },
    gap: {
      gap: spacing.md,
    },
    gapSm: {
      gap: spacing.sm,
    },
    macroRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    macroField: {
      width: 104,
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
  }),
);
