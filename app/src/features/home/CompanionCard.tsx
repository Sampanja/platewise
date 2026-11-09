import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Icon, PressableScale, Text } from '@/components/ui';
import { useGame } from '@/data/game';
import { useActivePlan } from '@/data/hooks';
import { useDiaryStore } from '@/data/stores/diary';
import { useWaterStore } from '@/data/stores/water';
import { mascotGreeting } from '@/domain/mascotMood';
import { mealDate } from '@/domain/plan';
import { MascotSays } from '@/features/mascot/SpeechBubble';
import { format, strings } from '@/i18n';
import { parseLocalDate, today } from '@/lib/dates';
import { colors, radii, spacing, themedStyles } from '@/theme';

const DAY_MS = 86_400_000;

/** Nuppu's greeting for the moment, a glance at streak, level and quests, and the way to the chat. */
export function CompanionCard() {
  const now = today();
  const game = useGame();
  const entries = useDiaryStore((s) => s.entries);
  const water = useWaterStore((s) => s.byDate[now] ?? 0);
  const waterGoal = useWaterStore((s) => s.goalMl);
  const plan = useActivePlan();

  const loggedToday = entries.filter((e) => e.date === now).length;
  const lastDate = entries.reduce<string | null>((latest, e) => (latest === null || e.date > latest ? e.date : latest), null);
  const daysAway = lastDate === null ? null : Math.round((parseLocalDate(now).getTime() - parseLocalDate(lastDate).getTime()) / DAY_MS);
  const dinnerPlanned = plan?.meals.some((m) => m.slot === 'dinner' && mealDate(plan, m) === now) ?? false;
  const mood = mascotGreeting({
    hour: new Date().getHours(),
    loggedToday,
    streak: game?.streak.current ?? 0,
    waterGoalReached: water >= waterGoal,
    dinnerPlanned,
    daysAway: lastDate === null ? null : daysAway,
  });
  const questsDone = game?.quests.filter((q) => q.done).length ?? 0;

  return (
    <Card style={styles.card}>
      <MascotSays state={mood.state} message={strings.mascot.greetings[mood.key]} size={76} />
      {game ? (
        <PressableScale
          onPress={() => router.push('/progress')}
          accessibilityRole="button"
          accessibilityLabel={`${strings.game.open}. ${format(strings.game.streakA11y, {
            count: game.streak.current,
            freezes: game.streak.freezes,
          })}. ${format(strings.game.level, { level: game.level.level })}. ${format(strings.game.questsDone, { done: questsDone })}`}
          style={styles.stats}
        >
          <Stat icon="flame" value={format(strings.game.streakDays, { count: game.streak.current })} label={strings.game.streak} />
          <Stat icon="star" value={String(game.level.level)} label={strings.game.levelShort} />
          <Stat icon="target" value={`${questsDone}/3`} label={strings.game.questsShort} />
          <Icon name="chevronRight" size={18} color="textSubtle" />
        </PressableScale>
      ) : null}
      <Button
        label={strings.chat.open}
        variant="secondary"
        size="compact"
        icon={<Icon name="chat" size={18} />}
        onPress={() => router.push('/chat')}
      />
    </Card>
  );
}

function Stat({ icon, value, label }: { icon: 'flame' | 'star' | 'target'; value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Icon name={icon} size={18} color="accentText" />
      <View>
        <Text variant="bodyStrong">{value}</Text>
        <Text variant="caption" color="textSubtle" numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    card: {
      gap: spacing.md,
    },
    stats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radii.lg,
      backgroundColor: colors.surfaceRaised,
    },
    stat: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
  }),
);
