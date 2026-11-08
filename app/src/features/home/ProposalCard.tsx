import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card, Icon, PressableScale, Text } from '@/components/ui';
import { strings } from '@/i18n';
import { colors, spacing } from '@/theme';

/** A generated proposal is waiting for approval. */
export function ProposalCard() {
  const t = strings.home;
  return (
    <PressableScale
      onPress={() => router.push('/proposal')}
      accessibilityRole="button"
      accessibilityLabel={`${t.proposalWaitingTitle}. ${t.proposalWaitingCta}`}
    >
      <Card style={styles.card}>
        <View style={styles.badge}>
          <Icon name="sparkles" size={24} color="textOnAccent" />
        </View>
        <View style={styles.texts}>
          <Text variant="heading">{t.proposalWaitingTitle}</Text>
          <Text variant="caption" color="textMuted">
            {t.proposalWaitingBody}
          </Text>
        </View>
        <Icon name="chevronRight" color="accentText" />
      </Card>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderColor: colors.accent,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
});
