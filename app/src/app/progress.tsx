import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Sheet } from '@/components/Sheet';
import { Card, Chip, EmptyState, FadeInView, Icon, PressableScale, ProgressMeter, Text, type IconName } from '@/components/ui';
import { useGame } from '@/data/game';
import { ACHIEVEMENTS, XP, type AchievementDef } from '@/domain/gamification';
import { Badge } from '@/features/game/Badge';
import { MascotSays } from '@/features/mascot/SpeechBubble';
import { format, formatInteger, strings } from '@/i18n';
import { diaryDayLabel } from '@/lib/dates';
import { colors, spacing, themedStyles } from '@/theme';

const t = strings.game;

/** Level, streak with freezes, today's quests, the weekly challenge and all achievements. */
export default function ProgressScreen() {
  const game = useGame();
  const [open, setOpen] = useState<AchievementDef | null>(null);

  if (!game) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title={t.title} />
        <EmptyState
          icon="trophy"
          title={t.disabledTitle}
          body={t.disabledBody}
          action={{ label: strings.profile.title, variant: 'secondary', onPress: () => router.push('/profile') }}
        />
      </SafeAreaView>
    );
  }

  const levelTitle = t.levelTitles[(game.level.level - 1) % t.levelTitles.length];
  const questsDone = game.quests.filter((q) => q.done).length;
  const openCopy = open ? strings.achievements[open.id as keyof typeof strings.achievements] : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={t.title} />
      <ScrollView contentContainerStyle={styles.content}>
        <FadeInView>
          <Card style={styles.gap}>
            <View style={styles.row}>
              <View style={styles.levelBadge}>
                <Text variant="title" color="textOnAccent">
                  {game.level.level}
                </Text>
              </View>
              <View style={styles.flex}>
                <Text variant="overline" color="accentText">
                  {format(t.level, { level: game.level.level })}
                </Text>
                <Text variant="title">{levelTitle}</Text>
              </View>
              <Text variant="number" color="textMuted">
                {format(t.xp, { xp: formatInteger(game.xp) })}
              </Text>
            </View>
            <ProgressMeter value={game.level.progress} accessibilityLabel={format(t.toNext, { value: game.level.xpForLevel - game.level.xpIntoLevel })} />
            <Text variant="caption" color="textSubtle">
              {format(t.toNext, { value: formatInteger(game.level.xpForLevel - game.level.xpIntoLevel) })}
            </Text>
          </Card>
        </FadeInView>

        <Card style={styles.gap}>
          <View
            style={styles.row}
            accessible
            accessibilityLabel={format(t.streakA11y, { count: game.streak.current, freezes: game.streak.freezes })}
          >
            <View style={[styles.circle, styles.streakCircle]}>
              <Icon name="flame" size={28} color="accentText" />
            </View>
            <View style={styles.flex}>
              <Text variant="overline" color="textSubtle">
                {t.streak}
              </Text>
              <Text variant="display">{format(t.streakDays, { count: game.streak.current })}</Text>
              <Text variant="caption" color="textSubtle">
                {format(t.best, { count: game.streak.best })}
              </Text>
            </View>
            <View style={styles.freezes}>
              {[0, 1].map((i) => (
                <Icon key={i} name="freeze" size={22} color={i < game.streak.freezes ? 'water' : 'border'} />
              ))}
            </View>
          </View>
          <Text variant="body" color={game.streak.todayPending ? 'textMuted' : 'success'}>
            {game.streak.todayPending ? t.streakPending : t.streakKept}
          </Text>
          {game.streak.frozenDays.slice(-1).map((date) => (
            <Text key={date} variant="caption" color="textSubtle">
              {format(t.freezeUsed, { date: diaryDayLabel(date).toLowerCase() })}
            </Text>
          ))}
          <Text variant="caption" color="textSubtle">
            {t.freezesHint}
          </Text>
        </Card>

        <Card style={styles.gap}>
          <View style={styles.row}>
            <Text variant="heading" style={styles.flex} accessibilityRole="header">
              {t.questsTitle}
            </Text>
            <Chip tone={questsDone === 3 ? 'success' : 'neutral'} label={format(t.questsDone, { done: questsDone })} />
          </View>
          {game.quests.map((quest) => (
            <View key={quest.id} style={styles.quest} accessible accessibilityLabel={`${t.quests[quest.id]}: ${quest.progress}/${quest.target}`}>
              <Icon name={quest.done ? 'checkCircle' : 'target'} size={22} color={quest.done ? 'success' : 'textSubtle'} />
              <View style={styles.flex}>
                <Text variant="body" color={quest.done ? 'textMuted' : 'text'}>
                  {t.quests[quest.id]}
                </Text>
                {quest.target > 1 ? (
                  <ProgressMeter value={quest.progress / quest.target} size="thin" tone="success" accessibilityLabel={t.quests[quest.id]} />
                ) : null}
              </View>
              <Text variant="label" color="accentText">
                {`+${XP.quest}`}
              </Text>
            </View>
          ))}
        </Card>

        <Card style={styles.gap}>
          <View style={styles.row}>
            <Icon name="trophy" size={22} color="gold" />
            <Text variant="heading" style={styles.flex} accessibilityRole="header">
              {t.challengeTitle}
            </Text>
            <Text variant="label" color="accentText">
              {format(t.challengeReward, { xp: XP.weeklyChallenge })}
            </Text>
          </View>
          <Text variant="body">{t.challenges[game.challenge.id]}</Text>
          <ProgressMeter
            value={game.challenge.progress / game.challenge.target}
            tone="success"
            celebrateOnComplete
            accessibilityLabel={`${t.challenges[game.challenge.id]} ${game.challenge.progress}/${game.challenge.target}`}
          />
          <Text variant="caption" color="textSubtle">
            {`${game.challenge.progress}/${game.challenge.target}`}
          </Text>
        </Card>

        <View style={styles.gapSm}>
          <View style={styles.row}>
            <Text variant="heading" style={styles.flex} accessibilityRole="header">
              {t.achievementsTitle}
            </Text>
            <Text variant="label" color="textMuted">
              {format(t.achievementsCount, { done: game.unlocked.length, total: ACHIEVEMENTS.length })}
            </Text>
          </View>
          <View style={styles.grid}>
            {ACHIEVEMENTS.map((def) => {
              const unlocked = game.unlocked.includes(def.id);
              const copy = strings.achievements[def.id as keyof typeof strings.achievements];
              return (
                <PressableScale
                  key={def.id}
                  onPress={() => setOpen(def)}
                  accessibilityRole="button"
                  accessibilityLabel={`${copy.title}, ${unlocked ? t.unlocked : t.locked}`}
                  style={styles.cell}
                >
                  <Badge tier={def.tier} icon={def.icon as IconName} size={56} locked={!unlocked} />
                  <Text variant="caption" color={unlocked ? 'text' : 'textSubtle'} numberOfLines={2} style={styles.center}>
                    {copy.title}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        </View>

        <MascotSays state="encouraging" message={t.rules} size={64} />
      </ScrollView>

      <Sheet visible={open !== null} onClose={() => setOpen(null)} title={openCopy?.title ?? ''}>
        {open && openCopy ? (
          <View style={styles.detail}>
            <Badge tier={open.tier} icon={open.icon as IconName} size={96} locked={!game.unlocked.includes(open.id)} />
            <Text variant="body" style={styles.center}>
              {openCopy.body}
            </Text>
            <View style={styles.row}>
              <Chip label={t.tiers[open.tier]} />
              <Chip
                tone={game.unlocked.includes(open.id) ? 'success' : 'neutral'}
                label={game.unlocked.includes(open.id) ? t.unlocked : t.locked}
              />
            </View>
          </View>
        ) : null}
      </Sheet>
    </SafeAreaView>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      padding: spacing.lg,
      gap: spacing.lg,
    },
    gap: {
      gap: spacing.md,
    },
    gapSm: {
      gap: spacing.sm,
    },
    flex: {
      flex: 1,
    },
    center: {
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    levelBadge: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    streakCircle: {
      backgroundColor: colors.accentSoft,
    },
    freezes: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    quest: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 44,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      rowGap: spacing.md,
    },
    cell: {
      width: '33.33%',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.xs,
    },
    detail: {
      alignItems: 'center',
      gap: spacing.md,
      paddingBottom: spacing.md,
    },
  }),
);
