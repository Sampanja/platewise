import Constants from 'expo-constants';
import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { withFreezeOnBlur } from '@/components/freezeOnBlur';
import { useTabBarSpace } from '@/components/TabBar';
import { Card, haptics, Icon, PressableScale, SwitchRow, Text, type IconName } from '@/components/ui';
import { CHAINS_BY_CODE } from '@/data/catalog';
import { useWaterGoal } from '@/data/hooks';
import { resetAppData } from '@/data/reset';
import { useDiaryStore } from '@/data/stores/diary';
import { useProfileStore } from '@/data/stores/profile';
import { useRemindersStore } from '@/data/stores/reminders';
import { useWeightStore } from '@/data/stores/weight';
import { useCharacter } from '@/features/mascot/useCharacter';
import { demoDiaryEntries, demoWeightEntries } from '@/features/profile/demoDiary';
import { format, formatCents, formatDecimal, formatInteger, strings } from '@/i18n';
import { today } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { colors, radii, spacing, themedStyles, touchTarget } from '@/theme';

const t = strings.profile;

function edit(section: string): Href {
  return { pathname: '/profile-edit/[section]', params: { section } };
}

function ProfileScreen() {
  const waterGoal = useWaterGoal(today());
  const tabBarSpace = useTabBarSpace();
  const profile = useProfileStore(
    useShallow((s) => ({
      allergens: s.allergens,
      body: s.body,
      chainCode: s.chainCode,
      diets: s.diets,
      gamificationEnabled: s.gamificationEnabled,
      goals: s.goals,
      hapticsEnabled: s.hapticsEnabled,
      hasCalorieGoal: s.hasCalorieGoal,
      hideCalories: s.hideCalories,
      name: s.name,
      pantry: s.pantry,
      themePreference: s.themePreference,
      update: s.update,
      weeklyBudgetCents: s.weeklyBudgetCents,
    })),
  );
  const { voice } = useCharacter();
  const addMany = useDiaryStore((s) => s.addMany);
  const latestWeight = useWeightStore((s) => s.entries.at(-1)?.kg);
  const logWeight = useWeightStore((s) => s.log);
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const reminders = useRemindersStore(useShallow((s) => ({ enabled: s.enabled, times: s.times })));
  const reminderCount = Object.values(reminders.times).filter((r) => r.on).length;

  const listOr = (items: string[]) => (items.length > 0 ? items.join(', ') : t.noneSelected);

  const confirmReset = () =>
    Alert.alert(t.resetTitle, t.resetBody, [
      { text: strings.common.cancel, style: 'cancel' },
      {
        text: t.resetConfirm,
        style: 'destructive',
        onPress: () => {
          haptics.warning();
          void resetAppData().then(() => router.replace('/onboarding'));
        },
      },
    ]);

  const fillDemo = () => {
    addMany(demoDiaryEntries(today()));
    for (const entry of demoWeightEntries(today(), (profile.body.weightKg ?? 76) + 1.5)) {
      logWeight(entry.date, entry.kg);
    }
    haptics.success();
    showToast(t.demoDataDone);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}>
        <PressableScale
          onPress={() => router.push(edit('name'))}
          accessibilityRole="button"
          accessibilityLabel={`${t.nameLabel}: ${profile.name || t.noName}`}
          style={styles.header}
        >
          <View style={styles.avatar}>
            {profile.name ? (
              <Text variant="display" color="textOnAccent">
                {profile.name.trim().charAt(0).toUpperCase()}
              </Text>
            ) : (
              <Icon name="profile" size={32} color="textOnAccent" />
            )}
          </View>
          <View style={styles.flex}>
            <Text variant="displayLarge" accessibilityRole="header" numberOfLines={1}>
              {profile.name || t.title}
            </Text>
            <Text variant="label" color="accentText">
              {strings.common.edit}
            </Text>
          </View>
        </PressableScale>

        <Section title={t.sectionShopping}>
          <Row icon="wallet" label={t.weeklyBudget} value={formatCents(profile.weeklyBudgetCents)} href={edit('budget')} />
          <Row icon="store" label={t.store} value={CHAINS_BY_CODE[profile.chainCode].name} href={edit('store')} last />
        </Section>

        <Section title={t.sectionFood}>
          <Row
            icon="shield"
            label={t.allergies}
            value={listOr(profile.allergens.map((c) => strings.allergens[c]))}
            href={edit('allergies')}
          />
          <Row icon="leaf" label={t.diet} value={listOr(profile.diets.map((c) => strings.diets[c]))} href={edit('diet')} />
          <Row
            icon="pot"
            label={t.pantry}
            value={format(t.pantryValue, { count: profile.pantry.length })}
            href={edit('pantry')}
            last
          />
        </Section>

        <Section title={t.sectionNutrition}>
          <Row
            icon="target"
            label={t.goals}
            value={
              profile.hasCalorieGoal
                ? format(strings.common.kcal, { value: formatInteger(profile.goals.kcal) })
                : t.goalsOff
            }
            href={edit('goals')}
          />
          <Row icon="flame" label={t.calculator} value={t.calculatorHint} href="/calculator" />
          <Row
            icon="chart"
            label={t.weight}
            value={latestWeight !== undefined ? format(strings.calculator.weightValue, { value: formatDecimal(latestWeight) }) : t.weightNone}
            href="/weight"
          />
          <Row
            icon="water"
            label={strings.water.goalTitle}
            value={`${formatDecimal(waterGoal.totalMl / 1000, 1)} l`}
            href="/water"
          />
          <View style={[styles.switchRow, styles.lastSwitch]}>
            <SwitchRow
              label={strings.hideCalories.label}
              hint={strings.hideCalories.hint}
              value={profile.hideCalories}
              onValueChange={(hideCalories) => profile.update({ hideCalories })}
            />
          </View>
        </Section>
        <Text variant="caption" color="textSubtle" style={styles.note}>
          {t.healthNote}
        </Text>

        <Section title={t.sectionApp}>
          <View style={styles.switchRow}>
            <SwitchRow
              label={t.haptics}
              hint={t.hapticsHint}
              value={profile.hapticsEnabled}
              onValueChange={(hapticsEnabled) => profile.update({ hapticsEnabled })}
            />
          </View>
          <Row icon="trophy" label={strings.game.title} value={strings.game.settingHint} href="/progress" />
          <Row icon="chat" label={format(strings.chat.title, { ablative: voice.ablative })} href="/chat" />
          <View style={styles.switchRow}>
            <SwitchRow
              label={strings.game.setting}
              hint={strings.game.settingHint}
              value={profile.gamificationEnabled}
              onValueChange={(gamificationEnabled) => profile.update({ gamificationEnabled })}
            />
          </View>
          <Row
            icon="bell"
            label={strings.reminders.row}
            value={reminders.enabled ? format(strings.reminders.onCount, { count: reminderCount }) : strings.reminders.off}
            href={edit('reminders')}
          />
          <Row icon="sparkles" label={strings.characters.profileRow} value={voice.name} href="/choose-character" />
          <Row icon="sun" label={strings.characters.modeTitle} value={strings.themes[profile.themePreference]} href={edit('theme')} />
          <Row icon="crown" label={t.subscription} value={t.subscriptionValue} href="/paywall" />
          <Row icon="shield" label={t.privacy} href={{ pathname: '/legal/[doc]', params: { doc: 'privacy' } }} />
          <Row icon="file" label={t.terms} href={{ pathname: '/legal/[doc]', params: { doc: 'terms' } }} />
          <Row icon="info" label={t.sources} href={{ pathname: '/legal/[doc]', params: { doc: 'sources' } }} />
          <Row icon="chart" label={t.demoData} value={t.demoDataHint} onPress={fillDemo} last />
        </Section>

        <PressableScale
          onPress={confirmReset}
          accessibilityRole="button"
          style={styles.reset}
          haptic="none"
        >
          <Icon name="trash" size={20} color="danger" />
          <Text variant="bodyStrong" color="danger">
            {t.reset}
          </Text>
        </PressableScale>

        <Text variant="caption" color="textSubtle" style={styles.version}>
          {format(t.version, { version })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="overline" color="textSubtle" accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      <Card padding="flush">{children}</Card>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  href,
  onPress,
  last = false,
}: {
  icon: IconName;
  label: string;
  value?: string;
  href?: Href;
  onPress?: () => void;
  last?: boolean;
}) {
  return (
    <PressableScale
      onPress={onPress ?? (() => href && router.push(href))}
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}: ${value}` : label}
      style={[styles.row, !last && styles.divider]}
    >
      <View style={styles.rowIcon}>
        <Icon name={icon} size={20} color="accentText" />
      </View>
      <View style={styles.flex}>
        <Text variant="body">{label}</Text>
        {value ? (
          <Text variant="caption" color="textSubtle" numberOfLines={2}>
            {value}
          </Text>
        ) : null}
      </View>
      <Icon name="chevronRight" size={18} color="textSubtle" />
    </PressableScale>
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
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      paddingHorizontal: spacing.xs,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    section: {
      gap: spacing.sm,
    },
    sectionTitle: {
      paddingHorizontal: spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: touchTarget + spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    divider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    rowIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    switchRow: {
      paddingHorizontal: spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    lastSwitch: {
      borderBottomWidth: 0,
    },
    note: {
      marginTop: -spacing.md,
      paddingHorizontal: spacing.xs,
    },
    reset: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      minHeight: touchTarget + spacing.sm,
      borderRadius: radii.pill,
      borderWidth: 1,
      borderColor: colors.dangerSoft,
    },
    version: {
      textAlign: 'center',
    },
  }),
);

export default withFreezeOnBlur(ProfileScreen);
