import { router, type Href } from 'expo-router';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Sheet } from '@/components/Sheet';
import { Icon, PressableScale, Text, type IconName } from '@/components/ui';
import type { DiaryMeal } from '@/data/types';
import { mealForHour } from '@/domain/diary';
import { format, strings } from '@/i18n';
import { today } from '@/lib/dates';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.quick;

type Tile = { key: string; icon: IconName; label: () => string; href: (meal: DiaryMeal) => Href };

/** Ways to log a meal, in the order of the sheet's top row. */
const LOG_TILES: readonly Tile[] = [
  {
    key: 'photo',
    icon: 'camera',
    label: () => t.photo,
    href: (meal) => ({ pathname: '/camera', params: { mode: 'photo', meal, date: today() } }),
  },
  {
    key: 'speak',
    icon: 'mic',
    label: () => t.speak,
    href: (meal) => ({ pathname: '/log-text', params: { mode: 'speak', meal, date: today() } }),
  },
  {
    key: 'write',
    icon: 'write',
    label: () => t.write,
    href: (meal) => ({ pathname: '/log-text', params: { mode: 'write', meal, date: today() } }),
  },
  {
    key: 'barcode',
    icon: 'barcode',
    label: () => t.barcode,
    href: (meal) => ({ pathname: '/camera', params: { mode: 'barcode', meal, date: today() } }),
  },
  {
    key: 'search',
    icon: 'search',
    label: () => t.search,
    href: (meal) => ({ pathname: '/diary-add', params: { meal, date: today() } }),
  },
];

type Row = { key: string; icon: IconName; title: () => string; hint: () => string; href: Href };

const ROWS: readonly Row[] = [
  { key: 'pantry', icon: 'fridge', title: () => t.scanPantry, hint: () => t.scanPantryHint, href: '/pantry-scan' },
  { key: 'plan', icon: 'calendarCheck', title: () => t.makePlan, hint: () => t.makePlanHint, href: '/plan' },
  { key: 'weight', icon: 'lineChart', title: () => t.addWeight, hint: () => t.addWeightHint, href: '/weight' },
];

export type QuickActionsProps = {
  visible: boolean;
  onClose: () => void;
};

/**
 * The centre ＋ button's sheet: every way to add something in one place. The
 * meal follows the time of day, so logging is one tap from anywhere.
 */
export const QuickActions = memo(function QuickActions({ visible, onClose }: QuickActionsProps) {
  const meal = mealForHour(new Date().getHours());
  const go = (href: Href) => {
    onClose();
    router.push(href);
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={t.title}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="heading">{t.logMeal}</Text>
          <Text variant="caption" color="textSubtle">
            {format(t.logMealTo, { meal: strings.diaryMeals[meal].toLowerCase() })}
          </Text>
        </View>
        <View style={styles.tiles}>
          {LOG_TILES.map((tile) => (
            <PressableScale
              key={tile.key}
              haptic="tap"
              onPress={() => go(tile.href(meal))}
              accessibilityRole="button"
              accessibilityLabel={`${t.logMeal}: ${tile.label()}`}
              style={styles.tile}
            >
              <View style={styles.tileIcon}>
                <Icon name={tile.icon} size={26} color="textOnAccent" />
              </View>
              <Text
                variant="label"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                maxFontSizeMultiplier={1.3}
                style={styles.tileLabel}
              >
                {tile.label()}
              </Text>
            </PressableScale>
          ))}
        </View>
      </View>

      {ROWS.map((row) => (
        <PressableScale
          key={row.key}
          haptic="tap"
          onPress={() => go(row.href)}
          accessibilityRole="button"
          accessibilityLabel={`${row.title()}, ${row.hint()}`}
          style={styles.row}
        >
          <View style={styles.rowIcon}>
            <Icon name={row.icon} size={24} color="accentText" />
          </View>
          <View style={styles.rowTexts}>
            <Text variant="bodyStrong">{row.title()}</Text>
            <Text variant="caption" color="textSubtle">
              {row.hint()}
            </Text>
          </View>
          <Icon name="chevronRight" size={20} color="textSubtle" />
        </PressableScale>
      ))}
    </Sheet>
  );
});

const styles = themedStyles(() =>
  StyleSheet.create({
    section: {
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radii.card,
      backgroundColor: colors.accentSoft,
      marginBottom: spacing.xs,
    },
    sectionHeader: {
      gap: 2,
    },
    tiles: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    tile: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.xs,
      minHeight: 76,
    },
    tileIcon: {
      width: 52,
      height: 52,
      borderRadius: radii.lg,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tileLabel: {
      alignSelf: 'stretch',
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 68,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radii.lg,
      backgroundColor: colors.surfaceRaised,
    },
    rowIcon: {
      width: 44,
      height: 44,
      borderRadius: radii.md,
      backgroundColor: colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowTexts: {
      flex: 1,
      gap: 2,
    },
  }),
);
