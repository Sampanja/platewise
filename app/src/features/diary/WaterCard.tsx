import { StyleSheet, View } from 'react-native';

import { Card, haptics, Icon, IconButton, ProgressMeter, Text } from '@/components/ui';
import { GLASS_ML, useWaterStore } from '@/data/stores/water';
import { format, formatDecimal, strings } from '@/i18n';
import type { LocalDate } from '@/lib/dates';
import { colors, spacing, themedStyles } from '@/theme';

const t = strings.water;

/** Water for the day in glasses (2.5 dl). One tap adds a glass; reaching the goal is celebrated gently. */
export function WaterCard({ date, onGlass }: { date: LocalDate; onGlass?: (ml: number) => void }) {
  const ml = useWaterStore((s) => s.byDate[date] ?? 0);
  const goalMl = useWaterStore((s) => s.goalMl);
  const add = useWaterStore((s) => s.add);
  const glasses = Math.round(ml / GLASS_ML);
  const goalGlasses = Math.ceil(goalMl / GLASS_ML);
  const liters = (value: number) => formatDecimal(value / 1000, 2);

  const change = (delta: number) => {
    if (delta < 0 && ml <= 0) return;
    haptics.tap();
    add(date, delta);
    onGlass?.(ml + delta);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Icon name="water" size={20} color="water" />
        </View>
        <View style={styles.flex}>
          <Text variant="heading">{t.title}</Text>
          <Text
            variant="caption"
            color="textSubtle"
            accessibilityLabel={format(t.a11y, { value: liters(ml), goal: liters(goalMl) })}
          >
            {`${format(t.amount, { value: liters(ml), goal: liters(goalMl) })} · ${format(t.glasses, { count: glasses })}`}
          </Text>
        </View>
        <IconButton icon="minus" accessibilityLabel={t.remove} onPress={() => change(-GLASS_ML)} haptic="none" disabled={ml <= 0} />
        <IconButton icon="plus" variant="accent" accessibilityLabel={t.add} onPress={() => change(GLASS_ML)} haptic="none" />
      </View>
      <View style={styles.glasses} accessible={false} importantForAccessibility="no-hide-descendants">
        {Array.from({ length: Math.max(goalGlasses, glasses) }, (_, i) => (
          <View key={i} style={[styles.glass, i < glasses && styles.glassFull]} />
        ))}
      </View>
      <ProgressMeter value={ml / goalMl} size="thin" tone="success" accessibilityLabel={format(t.a11y, { value: liters(ml), goal: liters(goalMl) })} />
      <Text variant="caption" color="textSubtle">
        {t.hint}
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
      gap: spacing.md,
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
