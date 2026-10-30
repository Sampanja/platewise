import { StyleSheet } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import { format, strings } from '@/i18n';
import { shortDate, today, type LocalDate } from '@/lib/dates';
import { colors, spacing } from '@/theme';

type Props = {
  /** Last dinner of the current plan. */
  endDate: LocalDate;
  onPress: () => void;
};

/** The home screen's single primary call to action when a plan exists. */
export function NewListCard({ endDate, onPress }: Props) {
  const t = strings.home;
  const body =
    endDate <= today() ? t.newListEndsToday : format(t.newListBody, { date: shortDate(endDate) });

  return (
    <Card style={styles.card}>
      <Text variant="title" accessibilityRole="header">
        {t.newListTitle}
      </Text>
      <Text variant="body" color="textMuted">
        {body}
      </Text>
      <Button label={t.newListCta} onPress={onPress} style={styles.button} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    backgroundColor: colors.surfaceRaised,
  },
  button: {
    marginTop: spacing.md,
  },
});
