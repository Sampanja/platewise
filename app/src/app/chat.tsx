import { useMemo, useRef, useState, type ComponentRef } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import {
  Card,
  FadeInView,
  haptics,
  IconButton,
  PressableScale,
  SwitchRow,
  Text,
  TextField,
} from '@/components/ui';
import { openRecipe } from '@/components/RecipeCard';
import { RecipeImage } from '@/components/RecipeImage';
import { catalogName, RECIPES_BY_ID } from '@/data/catalog';
import { useDayNutrition, useRecipeAllowed, useWaterGoal } from '@/data/hooks';
import { useAllowedRecipesQuery } from '@/data/queries';
import { useChatStore } from '@/data/stores/chat';
import { useProfileStore } from '@/data/stores/profile';
import { useWaterStore } from '@/data/stores/water';
import { DAILY_MESSAGE_LIMIT, type AssistantContext, type RecipeHint } from '@/domain/assistantRules';
import { entriesOn } from '@/domain/diary';
import { useDiaryStore } from '@/data/stores/diary';
import { Mascot } from '@/features/mascot/Mascot';
import { MascotSays } from '@/features/mascot/SpeechBubble';
import { useCharacter } from '@/features/mascot/useCharacter';
import { format, strings } from '@/i18n';
import { today } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { assistant } from '@/services/assistant';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.chat;

/**
 * "Kysy Nupulta" (or whichever character the user picked): chat with the character. Today's diary and goals are shared
 * only with consent. Answers come from services/assistant.ts (test answers
 * now, Claude through the backend later). Daily message limit for cost control.
 */
export default function ChatScreen() {
  const now = today();
  const { id: character, voice } = useCharacter();
  const names = { name: voice.name, ablative: voice.ablative };
  const messages = useChatStore((s) => s.messages);
  const sentToday = useChatStore((s) => s.sentByDate[now] ?? 0);
  const add = useChatStore((s) => s.add);
  const countSent = useChatStore((s) => s.countSent);
  const clear = useChatStore((s) => s.clear);
  const consent = useProfileStore((s) => s.chatShareConsent);
  const hasGoal = useProfileStore((s) => s.hasCalorieGoal);
  const hideCalories = useProfileStore((s) => s.hideCalories);
  const update = useProfileStore((s) => s.update);
  const nutrition = useDayNutrition(now);
  // Select the stable array and derive in a memo: a selector returning a new array loops forever.
  const allEntries = useDiaryStore((s) => s.entries);
  const dayEntries = useMemo(() => entriesOn(allEntries, now), [allEntries, now]);
  const waterMl = useWaterStore((s) => s.byDate[now] ?? 0);
  const waterGoalMl = useWaterGoal(now).totalMl;
  // The assistant may only suggest recipes that pass the strict allergy and diet gate.
  const allowedRecipes = useAllowedRecipesQuery().data;
  const allowed = useRecipeAllowed();
  const recipeHints = useMemo<RecipeHint[]>(
    () =>
      (allowedRecipes ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        proteinG: r.perServing.proteinG,
        dinner: r.meals.includes('dinner'),
        legumes: r.mainProtein === 'legumes',
      })),
    [allowedRecipes],
  );
  const [text, setText] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);

  const left = Math.max(0, DAILY_MESSAGE_LIMIT - sentToday);

  const context: AssistantContext = consent
    ? {
        eaten: {
          kcal: nutrition.eaten.kcal,
          proteinG: nutrition.eaten.proteinG,
          entries: dayEntries.map((e) => catalogName(e.basis, e.name)),
        },
        goals: hasGoal ? { kcal: nutrition.goals.kcal, proteinG: nutrition.goals.proteinG } : null,
        waterMl,
        waterGoalMl,
        hideCalories,
      }
    : null;

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || waiting || left <= 0) return;
    haptics.tap();
    setText('');
    setFailed(null);
    add('user', trimmed);
    countSent(now);
    setWaiting(true);
    try {
      const answer = await assistant.reply({
        messages: [...useChatStore.getState().messages],
        context,
        character,
        recipes: recipeHints,
      });
      add('assistant', answer.text, answer.recipeIds);
    } catch {
      setFailed(trimmed);
    } finally {
      setWaiting(false);
      requestAnimationFrame(() => scroll.current?.scrollToEnd({ animated: true }));
    }
  };

  const confirmClear = () =>
    Alert.alert(t.clear, undefined, [
      { text: strings.common.cancel, style: 'cancel' },
      {
        text: t.clear,
        style: 'destructive',
        onPress: () => {
          clear();
          showToast(t.cleared);
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader
        title={format(t.title, names)}
        trailing={
          messages.length > 0 ? (
            <IconButton icon="trash" variant="plain" accessibilityLabel={t.clear} onPress={confirmClear} />
          ) : undefined
        }
      />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}
        >
          <MascotSays state="happy" message={voice.chat.intro} size={72} />

          <Card padding="flush">
            <View style={styles.consent}>
              <SwitchRow
                label={format(consent ? t.shareOn : t.shareOff, names)}
                hint={format(t.shareBody, names)}
                value={consent}
                onValueChange={(chatShareConsent) => update({ chatShareConsent })}
              />
            </View>
          </Card>

          {messages.map((message) =>
            message.role === 'user' ? (
              <FadeInView key={message.id} style={styles.userRow}>
                <View style={styles.userBubble} accessible accessibilityLabel={`${t.you}: ${message.text}`}>
                  <Text variant="body" color="textOnAccent">
                    {message.text}
                  </Text>
                </View>
              </FadeInView>
            ) : (
              <FadeInView key={message.id} style={styles.botRow}>
                <Mascot state="idle" size={36} />
                <View style={styles.botColumn}>
                  <View style={styles.botBubble} accessible accessibilityLabel={`${voice.name}: ${message.text}`}>
                    <Text variant="body">{message.text}</Text>
                  </View>
                  {(message.recipeIds ?? [])
                    .map((id) => RECIPES_BY_ID[id])
                    // Checked again: the user's rules may have changed since the answer.
                    .filter((recipe) => recipe && allowed(recipe))
                    .map((recipe) => (
                      <PressableScale
                        key={recipe.id}
                        onPress={() => openRecipe(recipe.id)}
                        accessibilityRole="button"
                        accessibilityLabel={recipe.title}
                        style={styles.recipeLink}
                      >
                        <RecipeImage recipe={recipe} style={styles.recipeThumb} />
                        <Text variant="label" numberOfLines={2} style={styles.flex}>
                          {recipe.title}
                        </Text>
                      </PressableScale>
                    ))}
                </View>
              </FadeInView>
            ),
          )}

          {waiting ? (
            <View style={styles.botRow} accessible accessibilityLabel={voice.chat.thinking} accessibilityLiveRegion="polite">
              <Mascot state="thinking" size={36} />
              <View style={styles.botBubble}>
                <Text variant="body" color="textMuted">
                  {voice.chat.thinking}
                </Text>
              </View>
            </View>
          ) : null}

          {failed ? (
            <PressableScale onPress={() => void ask(failed)} accessibilityRole="button" style={styles.error}>
              <Text variant="label" color="danger">
                {t.error}
              </Text>
              <Text variant="label" color="accentText">
                {strings.common.retry}
              </Text>
            </PressableScale>
          ) : null}

          {messages.length < 2 && !waiting ? (
            <View style={styles.suggestions}>
              {t.suggestions.map((suggestion) => (
                <PressableScale
                  key={suggestion}
                  onPress={() => void ask(suggestion)}
                  accessibilityRole="button"
                  style={styles.suggestion}
                >
                  <Text variant="label" color="accentText">
                    {suggestion}
                  </Text>
                </PressableScale>
              ))}
            </View>
          ) : null}

          <Text variant="caption" color="textSubtle" style={styles.disclaimer}>
            {format(t.disclaimer, names)}
          </Text>
        </ScrollView>

        <View style={styles.composer}>
          <Text variant="caption" color="textSubtle">
            {left > 0 ? format(t.limit, { left }) : t.limitReached}
          </Text>
          <View style={styles.inputRow}>
            <TextField
              value={text}
              onChangeText={setText}
              placeholder={t.placeholder}
              accessibilityLabel={t.placeholder}
              style={styles.flex}
              maxLength={400}
              editable={left > 0}
              returnKeyType="send"
              onSubmitEditing={() => void ask(text)}
            />
            <IconButton
              icon="send"
              variant="accent"
              accessibilityLabel={t.send}
              disabled={!text.trim() || waiting || left <= 0}
              onPress={() => void ask(text)}
              haptic="none"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    flex: {
      flex: 1,
    },
    content: {
      padding: spacing.lg,
      gap: spacing.md,
    },
    consent: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    userRow: {
      alignItems: 'flex-end',
    },
    userBubble: {
      maxWidth: '82%',
      padding: spacing.md,
      borderRadius: radii.lg,
      borderBottomRightRadius: radii.sm,
      backgroundColor: colors.accent,
    },
    botRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: spacing.sm,
    },
    botColumn: {
      flexShrink: 1,
      maxWidth: '82%',
      gap: spacing.sm,
    },
    recipeLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.sm,
      paddingRight: spacing.md,
      borderRadius: radii.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    recipeThumb: {
      width: 44,
      height: 44,
      borderRadius: radii.sm,
    },
    botBubble: {
      flexShrink: 1,
      padding: spacing.md,
      borderRadius: radii.lg,
      borderBottomLeftRadius: radii.sm,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    error: {
      flexDirection: 'row',
      gap: spacing.md,
      alignSelf: 'center',
      padding: spacing.sm,
    },
    suggestions: {
      gap: spacing.sm,
    },
    suggestion: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radii.pill,
      backgroundColor: colors.accentSoft,
    },
    disclaimer: {
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    composer: {
      gap: spacing.xs,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
  }),
);
