import { useEffect, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { Button, Card, FadeInView, haptics, Text, type IconName } from '@/components/ui';
import { useGame } from '@/data/game';
import { useGameStore } from '@/data/stores/game';
import { ACHIEVEMENTS } from '@/domain/gamification';
import { Mascot } from '@/features/mascot/Mascot';
import { useCharacter } from '@/features/mascot/useCharacter';
import { format, strings } from '@/i18n';
import { colors, spacing, themedStyles } from '@/theme';

import { Badge } from './Badge';
import { Confetti } from './Confetti';

type Celebration = { achievements: string[]; level: number | null };

/**
 * Celebrates new achievements and levels once: confetti, the mascot cheering
 * and a success haptic. On first run existing progress is marked as seen
 * without a celebration (no wall of pop-ups for long-time users).
 */
export function CelebrationHost() {
  const game = useGame();
  const { voice } = useCharacter();
  const { initialized, seenAchievements, seenLevel, markSeen } = useGameStore(
    useShallow((s) => ({ initialized: s.initialized, seenAchievements: s.seenAchievements, seenLevel: s.seenLevel, markSeen: s.markSeen })),
  );
  const [showing, setShowing] = useState<Celebration | null>(null);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (!game || showing) return;
    if (!initialized) {
      markSeen(game.unlocked, game.level.level);
      return;
    }
    const fresh = game.unlocked.filter((id) => !seenAchievements.includes(id));
    const level = game.level.level > seenLevel ? game.level.level : null;
    if (fresh.length === 0 && level === null) return;
    // A short delay so the celebration does not cover the action that earned it.
    const timer = setTimeout(() => {
      setShowing({ achievements: fresh, level });
      setRun((n) => n + 1);
      haptics.success();
    }, 700);
    return () => clearTimeout(timer);
  }, [game, initialized, seenAchievements, seenLevel, markSeen, showing]);

  if (!showing || !game) return null;
  const close = () => {
    markSeen(game.unlocked, game.level.level);
    setShowing(null);
  };
  const defs = ACHIEVEMENTS.filter((a) => showing.achievements.includes(a.id)).slice(0, 3);
  const levelTitle = strings.game.levelTitles[(game.level.level - 1) % strings.game.levelTitles.length];

  return (
    <Modal transparent animationType="fade" visible onRequestClose={close} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Confetti run={run} />
        <FadeInView style={styles.center}>
          <Card style={styles.card}>
            <Mascot state="celebrating" size={120} />
            <Text variant="display" style={styles.text} accessibilityRole="header">
              {showing.level !== null ? strings.celebrate.level : strings.celebrate.achievement}
            </Text>
            <Text variant="bodyStrong" color="accentText" style={styles.text}>
              {`“${showing.level !== null ? voice.celebrate.level : voice.celebrate.achievement}” – ${voice.name}`}
            </Text>
            {showing.level !== null ? (
              <Text variant="body" color="textMuted" style={styles.text}>
                {format(strings.celebrate.levelBody, { level: showing.level, title: levelTitle })}
              </Text>
            ) : null}
            {defs.map((def) => {
              const copy = strings.achievements[def.id as keyof typeof strings.achievements];
              return (
                <View key={def.id} style={styles.row}>
                  <Badge tier={def.tier} icon={def.icon as IconName} size={52} />
                  <View style={styles.flex}>
                    <Text variant="bodyStrong">{copy.title}</Text>
                    <Text variant="caption" color="textMuted">
                      {copy.body}
                    </Text>
                  </View>
                </View>
              );
            })}
            <Button label={strings.celebrate.close} onPress={close} haptic="none" style={styles.button} />
          </Card>
        </FadeInView>
      </View>
    </Modal>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.backdrop,
      justifyContent: 'center',
      padding: spacing.lg,
    },
    center: {
      alignItems: 'stretch',
    },
    card: {
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.xl,
    },
    text: {
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      alignSelf: 'stretch',
    },
    flex: {
      flex: 1,
    },
    button: {
      alignSelf: 'stretch',
    },
  }),
);
