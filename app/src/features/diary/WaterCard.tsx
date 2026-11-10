import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card, haptics, Icon, IconButton, PressableScale, ProgressMeter, Text } from '@/components/ui';
import { useWaterGoal } from '@/data/hooks';
import { useWaterStore } from '@/data/stores/water';
import { format, formatDecimal, strings } from '@/i18n';
import type { LocalDate } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.water;

export const litres = (ml: number) => formatDecimal(ml / 1000, 2);
export const decilitres = (ml: number) => format(t.dl, { value: formatDecimal(ml / 100, ml % 100 === 0 ? 0 : 1) });

/**
 * Drinks for the day in the diary: progress against the personal goal, a
 * one-tap glass (the size is set on the drinks screen) and a minus that
 * removes the latest drink. Tapping the card opens the drinks screen.
 */
export function WaterCard({ date, onGlass }: { date: LocalDate; onGlass?: (ml: number) => void }) {
  const ml = useWaterStore((s) => s.byDate[date] ?? 0);
  const glassMl = useWaterStore((s) => s.glassMl);
  const add = useWaterStore((s) => s.add);
  const removeLast = useWaterStore((s) => s.removeLast);
  const restore = useWaterStore((s) => s.restore);
  const goal = useWaterGoal(date).totalMl;
  const reached = ml >= goal;
  const glassCount = Math.ceil(goal / glassMl);
  const fullGlasses = Math.floor(ml / glassMl);
  const a11y = format(t.a11y, { value: litres(ml), goal: litres(goal) });

  const addGlass = () => {
    haptics.tap();
    const entry = add(date, glassMl);
    if (entry) onGlass?.(ml + entry.ml);
  };
  const undoLast = () => {
    const removed = removeLast(date);
    if (!removed) return;
    haptics.tap();
    showToast(t.deleted, { label: strings.common.undo, onPress: () => restore(removed) });
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <PressableScale
          onPress={() => router.push({ pathname: '/water', params: { date } })}
          accessibilityRole="button"
          accessibilityLabel={`${t.title}. ${a11y}. ${t.open}`}
          style={styles.open}
        >
          <View style={styles.icon}>
            <Icon name="water" size={20} color="water" />
          </View>
          <View style={styles.flex}>
            <View style={styles.titleRow}>
              <Text variant="heading">{t.title}</Text>
              <Icon name="chevronRight" size={16} color="textSubtle" />
            </View>
            <Text variant="caption" color="textSubtle">
              {format(t.amount, { value: litres(ml), goal: litres(goal) })}
            </Text>
          </View>
        </PressableScale>
        <IconButton icon="minus" accessibilityLabel={t.removeLast} onPress={undoLast} haptic="none" disabled={ml <= 0} />
        <IconButton
          icon="plus"
          variant="accent"
          accessibilityLabel={format(t.add, { amount: decilitres(glassMl) })}
          onPress={addGlass}
          haptic="none"
        />
      </View>
      <View style={styles.glasses} accessible={false} importantForAccessibility="no-hide-descendants">
        {Array.from({ length: Math.min(16, Math.max(glassCount, fullGlasses)) }, (_, i) => (
          <View key={i} style={[styles.glass, i < fullGlasses && styles.glassFull]} />
        ))}
      </View>
      <ProgressMeter value={ml / goal} size="thin" tone="success" accessibilityLabel={a11y} />
      <Text variant="caption" color={reached ? 'success' : 'textSubtle'}>
        {reached ? t.reached : format(t.left, { value: litres(goal - ml) })}
      </Text>
    </Card>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    card: {
      gap: spacing.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    open: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 48,
      borderRadius: radii.md,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    flex: {
      flex: 1,
    },
    icon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.waterSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    glasses: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    glass: {
      width: 18,
      height: 24,
      borderBottomLeftRadius: 6,
      borderBottomRightRadius: 6,
      borderTopLeftRadius: 2,
      borderTopRightRadius: 2,
      borderWidth: 1.5,
      borderColor: colors.water,
      opacity: 0.5,
    },
    glassFull: {
      backgroundColor: colors.water,
      opacity: 1,
    },
  }),
);
