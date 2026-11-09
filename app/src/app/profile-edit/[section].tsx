import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import {
  Button,
  Card,
  EmptyState,
  OptionRow,
  Slider,
  Stepper,
  SwitchRow,
  Text,
  TextField,
} from '@/components/ui';
import { MIN_KCAL_GOAL, PANTRY_ELIGIBLE } from '@/data/catalog';
import { useProfileStore } from '@/data/stores/profile';
import { ChainPicker } from '@/features/shared/ChainPicker';
import { RemindersEditor } from '@/features/profile/RemindersEditor';
import { DietPicker } from '@/features/shared/DietPicker';
import { format, formatCents, formatInteger, strings } from '@/i18n';
import { colors, spacing, themedStyles } from '@/theme';

const t = strings.profileEdit;

const THEME_OPTIONS = [
  { value: 'system', hint: 'systemHint', icon: 'phone' },
  { value: 'light', hint: 'lightHint', icon: 'sun' },
  { value: 'dark', hint: 'darkHint', icon: 'moon' },
] as const;

type Section = 'name' | 'budget' | 'store' | 'allergies' | 'diet' | 'pantry' | 'goals' | 'theme' | 'reminders';

/**
 * Edits one profile setting. Changes are saved as they are made (to the local
 * profile repository), so "Valmis" only closes the screen.
 */
export default function ProfileEditScreen() {
  const { section } = useLocalSearchParams<{ section: Section }>();
  const profile = useProfileStore();
  const [budgetText, setBudgetText] = useState(String(Math.round(profile.weeklyBudgetCents / 100)));

  const screens: Record<Section, { title: string; body?: string; node: ReactNode }> = {
    name: {
      title: strings.profile.nameLabel,
      node: (
        <TextField
          value={profile.name}
          onChangeText={(name) => profile.update({ name })}
          placeholder={strings.profile.namePlaceholder}
          accessibilityLabel={strings.profile.nameLabel}
          autoCapitalize="words"
          autoFocus
          maxLength={30}
          returnKeyType="done"
          onSubmitEditing={() => router.back()}
        />
      ),
    },
    budget: {
      title: t.budgetTitle,
      body: `${t.budgetBody} ${strings.budget.explainer}`,
      node: (
        <Card style={styles.gap}>
          <TextField
            large
            value={budgetText}
            keyboardType="number-pad"
            maxLength={3}
            accessibilityLabel={strings.plan.budget.inputA11y}
            onChangeText={(text) => {
              const digits = text.replace(/\D/g, '');
              setBudgetText(digits);
              const eur = Number(digits);
              if (eur >= 10) profile.update({ weeklyBudgetCents: Math.min(300, eur) * 100 });
            }}
            onBlur={() => setBudgetText(String(Math.round(profile.weeklyBudgetCents / 100)))}
            trailing={
              <Text variant="title" color="textMuted">
                {strings.common.euroSign}
              </Text>
            }
          />
          <Slider
            value={Math.round(profile.weeklyBudgetCents / 100)}
            min={10}
            max={300}
            step={1}
            onChange={(eur) => {
              setBudgetText(String(eur));
              profile.update({ weeklyBudgetCents: eur * 100 });
            }}
            accessibilityLabel={strings.plan.budget.sliderA11y}
            accessibilityValueText={formatCents(profile.weeklyBudgetCents)}
          />
        </Card>
      ),
    },
    store: {
      title: t.storeTitle,
      body: t.storeBody,
      node: <ChainPicker value={profile.chainCode} onChange={(chainCode) => profile.update({ chainCode })} />,
    },
    reminders: {
      title: strings.reminders.title,
      body: strings.reminders.body,
      node: <RemindersEditor />,
    },
    theme: {
      title: t.themeTitle,
      body: t.themeBody,
      node: (
        <View style={styles.gap} accessibilityRole="radiogroup">
          {THEME_OPTIONS.map((option) => (
            <OptionRow
              key={option.value}
              icon={option.icon}
              title={strings.themes[option.value]}
              hint={strings.themes[option.hint]}
              selected={profile.themePreference === option.value}
              onPress={() => profile.update({ themePreference: option.value })}
            />
          ))}
        </View>
      ),
    },
    allergies: {
      title: t.allergiesTitle,
      body: t.allergiesBody,
      node: (
        <DietPicker
          show="allergens"
          allergens={profile.allergens}
          diets={profile.diets}
          onToggleAllergen={profile.toggleAllergen}
          onToggleDiet={profile.toggleDiet}
        />
      ),
    },
    diet: {
      title: t.dietTitle,
      body: t.dietBody,
      node: (
        <DietPicker
          show="diets"
          allergens={profile.allergens}
          diets={profile.diets}
          onToggleAllergen={profile.toggleAllergen}
          onToggleDiet={profile.toggleDiet}
        />
      ),
    },
    pantry: {
      title: t.pantryTitle,
      body: t.pantryBody,
      node: (
        <View style={styles.list}>
          {PANTRY_ELIGIBLE.map((ingredient) => (
            <OptionRow
              key={ingredient.id}
              role="checkbox"
              title={ingredient.name}
              selected={profile.pantry.includes(ingredient.id)}
              onPress={() => profile.togglePantry(ingredient.id)}
            />
          ))}
        </View>
      ),
    },
    goals: {
      title: t.goalsTitle,
      body: format(t.goalsBody, { min: formatInteger(MIN_KCAL_GOAL) }),
      node: (
        <Card style={styles.gap}>
          <SwitchRow
            label={t.goalsEnabled}
            value={profile.hasCalorieGoal}
            onValueChange={(hasCalorieGoal) => profile.update({ hasCalorieGoal })}
          />
          {profile.hasCalorieGoal ? (
            <View style={styles.goals}>
              <GoalRow label={t.kcal}>
                <Stepper
                  value={profile.goals.kcal}
                  min={MIN_KCAL_GOAL}
                  max={4000}
                  step={50}
                  onChange={(kcal) => profile.setGoals({ ...profile.goals, kcal })}
                  format={(v) => formatInteger(v)}
                  accessibilityLabel={t.kcal}
                />
              </GoalRow>
              <Text variant="caption" color="textSubtle">
                {format(t.minNote, { min: formatInteger(MIN_KCAL_GOAL) })}
              </Text>
              <GoalRow label={t.protein}>
                <Stepper
                  value={profile.goals.proteinG}
                  min={20}
                  max={300}
                  step={5}
                  onChange={(proteinG) => profile.setGoals({ ...profile.goals, proteinG })}
                  accessibilityLabel={t.protein}
                />
              </GoalRow>
              <GoalRow label={t.carbs}>
                <Stepper
                  value={profile.goals.carbsG}
                  min={20}
                  max={500}
                  step={5}
                  onChange={(carbsG) => profile.setGoals({ ...profile.goals, carbsG })}
                  accessibilityLabel={t.carbs}
                />
              </GoalRow>
              <GoalRow label={t.fat}>
                <Stepper
                  value={profile.goals.fatG}
                  min={20}
                  max={250}
                  step={5}
                  onChange={(fatG) => profile.setGoals({ ...profile.goals, fatG })}
                  accessibilityLabel={t.fat}
                />
              </GoalRow>
            </View>
          ) : null}
        </Card>
      ),
    },
  };

  const screen = section ? screens[section] : undefined;
  if (!screen) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader />
        <EmptyState icon="profile" title={strings.errors.genericTitle} body={strings.errors.genericBody} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={strings.profile.title} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.titleBlock}>
            <Text variant="display" accessibilityRole="header">
              {screen.title}
            </Text>
            {screen.body ? (
              <Text variant="body" color="textMuted">
                {screen.body}
              </Text>
            ) : null}
          </View>
          {screen.node}
        </ScrollView>
        <View style={styles.footer}>
          <Button label={strings.common.done} onPress={() => router.back()} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function GoalRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.goalRow}>
      <Text variant="bodyStrong" style={styles.flex}>
        {label}
      </Text>
      {children}
    </View>
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
    titleBlock: {
      gap: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    gap: {
      gap: spacing.lg,
    },
    list: {
      gap: spacing.sm,
    },
    goals: {
      gap: spacing.md,
    },
    goalRow: {
      flexDirection: 'row',
      alignItems: 'center',
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
