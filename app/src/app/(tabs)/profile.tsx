import Constants from 'expo-constants';
import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTabBarSpace } from '@/components/TabBar';
import { Card, haptics, Icon, PressableScale, SwitchRow, Text, type IconName } from '@/components/ui';
import { CHAINS_BY_CODE } from '@/data/catalog';
import { resetAppData } from '@/data/reset';
import { useDiaryStore } from '@/data/stores/diary';
import { useProfileStore } from '@/data/stores/profile';
import { demoDiaryEntries } from '@/features/profile/demoDiary';
import { format, formatCents, formatInteger, strings } from '@/i18n';
import { today } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { colors, radii, spacing, touchTarget } from '@/theme';

const t = strings.profile;

function edit(section: string): Href {
  return { pathname: '/profile-edit/[section]', params: { section } };
}

export default function ProfileScreen() {
  const tabBarSpace = useTabBarSpace();
  const profile = useProfileStore();
  const addMany = useDiaryStore((s) => s.addMany);
  const version = Constants.expoConfig?.version ?? '1.0.0';

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

        <Section title={t.sectionHousehold}>
          <Row
            icon="users"
            label={t.household}
            value={format(t.householdValue, { count: profile.householdSize })}
            href={edit('household')}
          />
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
            last
          />
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
});
