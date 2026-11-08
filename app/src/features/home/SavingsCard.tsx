import { StyleSheet, View } from 'react-native';

import { Card, Icon, Text } from '@/components/ui';
import { format, formatCents, strings } from '@/i18n';
import { colors, spacing } from '@/theme';

type Props = {
  /** Budget minus price estimate over this month's accepted plans (never negative). */
  savingsCents: number;
};

/** Säästömittari: this month's savings against the budgets the user set. */
export function SavingsCard({ savingsCents }: Props) {
  const t = strings.home;
  const hasSavings = savingsCents > 0;
  return (
    <Card style={styles.card}>
      <View style={styles.badge}>
        <Icon name="savings" size={28} color="success" />
      </View>
      <View style={styles.texts}>
        <Text variant="overline" color="textSubtle" accessibilityRole="header">
          {t.savingsTitle}
        </Text>
        {hasSavings ? (
          <>
            <Text variant="display" color="success" style={styles.tabular}>
              {formatCents(savingsCents)}
            </Text>
            <Text variant="caption" color="textMuted">
              {format(t.savings, { amount: formatCents(savingsCents) })}
            </Text>
          </>
        ) : (
          <Text variant="body" color="textMuted">
            {t.savingsNone}
          </Text>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
