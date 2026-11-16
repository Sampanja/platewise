import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { TestModeBanner } from '@/components/TestModeBanner';
import { Sheet } from '@/components/Sheet';
import {
  Button,
  Card,
  Chip,
  EmptyState,
  FadeInView,
  haptics,
  Icon,
  PressableScale,
  SelectChip,
  Slider,
  Text,
  useReducedMotion,
} from '@/components/ui';
import { FOODS_BY_ID } from '@/data/catalog';
import { useDiaryStore } from '@/data/stores/diary';
import { useLogDraftStore } from '@/data/stores/logDraft';
import type { DiaryMeal, Food } from '@/data/types';
import { DIARY_MEALS, entryMacros, mealForHour, sumEntries } from '@/domain/diary';
import { closestGuide, portionGuides } from '@/domain/portionGuides';
import { FoodPickerSheet } from '@/features/diary/FoodPickerSheet';
import { format, formatInteger, strings } from '@/i18n';
import { today } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { foodRecognition, needsCheck, type RecognizedFood } from '@/services/foodRecognition';
import { colors, fixed, radii, spacing, themedStyles } from '@/theme';

const t = strings.photo;
const r = strings.photoResult;

type Phase = 'pick' | 'analyzing' | 'result' | 'error';
const MAX_GRAMS = 800;

function basisOf(food: Food) {
  return { kind: 'food' as const, foodId: food.id, per100g: food.per100g };
}

/**
 * Food from a photo. The photo comes from the app's camera (or the gallery)
 * and goes only to the recognition service; it is not stored. Every
 * recognised food shows grams, energy and macros (uncertain ones say "Tarkista"),
 * and can be changed, resized or removed before saving. Always "arvio".
 */
export default function PhotoScreen() {
  // source 'text': foods from typed or spoken text (log-text.tsx), reviewed here the same way.
  const params = useLocalSearchParams<{ meal?: DiaryMeal; date?: string; uri?: string; source?: 'text' }>();
  const fromText = params.source === 'text';
  const draft = useLogDraftStore();
  const [meal, setMeal] = useState<DiaryMeal>(params.meal ?? mealForHour(new Date().getHours()));
  const addMany = useDiaryStore((s) => s.addMany);
  const [uri, setUri] = useState<string | null>(params.uri ?? null);
  const [phase, setPhase] = useState<Phase>(fromText ? 'result' : params.uri ? 'analyzing' : 'pick');
  const [items, setItems] = useState<RecognizedFood[]>(fromText ? draft.foods : []);
  const [editing, setEditing] = useState<number | null>(null);
  const [picker, setPicker] = useState<{ mode: 'replace'; index: number } | { mode: 'add' } | null>(null);

  useEffect(() => {
    if (phase !== 'analyzing' || !uri) return;
    let cancelled = false;
    foodRecognition
      .recognize(uri)
      .then((result) => {
        if (cancelled) return;
        // Only foods from the closed list are accepted (CLAUDE.md, principle 2).
        setItems(result.filter((item) => FOODS_BY_ID[item.foodId]));
        haptics.success();
        setPhase('result');
      })
      .catch(() => {
        if (!cancelled) setPhase('error');
      });
    return () => {
      cancelled = true;
    };
  }, [phase, uri]);

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (result.canceled || !result.assets[0]) return;
    setUri(result.assets[0].uri);
    setPhase('analyzing');
  };

  const update = (index: number, patch: Partial<RecognizedFood>) =>
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const remove = (index: number) => {
    haptics.tap();
    setEditing(null);
    setItems((current) => current.filter((_, i) => i !== index));
  };

  const entries = items
    .filter((item) => item.grams > 0)
    .map((item) => {
      const food = FOODS_BY_ID[item.foodId];
      return {
        date: params.date || today(),
        meal,
        name: food.name,
        basis: basisOf(food),
        quantity: item.grams,
        estimate: true,
      };
    });
  const total = sumEntries(entries);

  const save = () => {
    addMany(entries);
    haptics.success();
    showToast(format(t.saved, { count: entries.length }));
    router.dismissTo('/diary');
  };

  const editingItem = editing !== null ? items[editing] : undefined;
  const editingFood = editingItem ? FOODS_BY_ID[editingItem.foodId] : undefined;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader variant="close" title={fromText ? strings.textLog.reviewTitle : t.title} />
      <ScrollView contentContainerStyle={styles.content}>
        {!fromText && foodRecognition.mode === 'test' ? <TestModeBanner title={r.testModeTitle} body={r.testModeBody} /> : null}
        {uri ? (
          <View style={styles.photoWrap}>
            <Image source={uri} style={styles.photo} contentFit="cover" accessibilityLabel={t.title} />
            {phase === 'analyzing' ? <ScanOverlay /> : null}
          </View>
        ) : null}

        {phase === 'pick' ? (
          <View style={styles.gap}>
            <View style={styles.placeholder}>
              <Icon name="camera" size={48} color="accentText" />
            </View>
            <Text variant="body" color="textMuted">
              {t.intro}
            </Text>
            <Button
              label={r.openCamera}
              icon={<Icon name="camera" size={20} color="textOnAccent" />}
              onPress={() =>
                router.replace({ pathname: '/camera', params: { mode: 'photo', meal, date: params.date ?? '' } })
              }
            />
            <Button label={r.fromGallery} variant="secondary" onPress={() => void pickFromGallery()} />
          </View>
        ) : null}

        {phase === 'analyzing' ? <AnalyzingSteps /> : null}

        {phase === 'error' ? (
          <EmptyState
            icon="alert"
            tone="danger"
            title={t.errorTitle}
            body={t.errorBody}
            action={{ label: strings.common.retry, variant: 'secondary', onPress: () => setPhase('analyzing') }}
          />
        ) : null}

        {phase === 'result' ? (
          <FadeInView style={styles.gap}>
            {fromText ? (
              <View style={styles.gap}>
                <Text variant="body" color="textMuted">
                  {format(strings.textLog.understood, { text: draft.text })}
                </Text>
                {draft.unmatched.length > 0 ? (
                  <Text variant="caption" color="textSubtle">
                    {format(strings.textLog.unmatched, { items: draft.unmatched.join(', ') })}
                  </Text>
                ) : null}
              </View>
            ) : null}
            <View style={styles.meals} accessibilityRole="radiogroup" accessibilityLabel={strings.textLog.mealTitle}>
              {DIARY_MEALS.map((value) => (
                <SelectChip
                  key={value}
                  role="radio"
                  label={strings.diaryMeals[value]}
                  selected={meal === value}
                  onPress={() => setMeal(value)}
                />
              ))}
            </View>
            <Card style={styles.summary}>
              <View style={styles.row}>
                <Text variant="overline" color="textSubtle" style={styles.flex}>
                  {r.total}
                </Text>
                <Chip tone="accent" label={strings.common.estimate} />
              </View>
              <Text variant="displayLarge" color="accentText" style={styles.tabular}>
                {format(strings.common.kcal, { value: formatInteger(total.kcal) })}
              </Text>
              <MacroLine proteinG={total.proteinG} carbsG={total.carbsG} fatG={total.fatG} />
              <Text variant="caption" color="textSubtle">
                {t.resultNote}
              </Text>
            </Card>

            {items.length === 0 ? (
              <Text variant="body" color="textMuted">
                {t.emptyResult}
              </Text>
            ) : (
              items.map((item, index) => {
                const food = FOODS_BY_ID[item.foodId];
                const macros = entryMacros({ basis: basisOf(food), quantity: item.grams });
                const check = needsCheck(item);
                const guide = closestGuide(food.category, item.grams);
                return (
                  <FadeInView key={`${item.foodId}-${index}`} delay={index * 60}>
                    <Card style={styles.item}>
                      <PressableScale
                        onPress={() => setEditing(index)}
                        accessibilityRole="button"
                        accessibilityLabel={`${food.name}, ${item.grams} g, ${format(strings.common.kcal, {
                          value: formatInteger(macros.kcal),
                        })}. ${check ? `${r.checkA11y}. ` : ''}${r.edit}`}
                        style={styles.itemBody}
                      >
                        <View style={styles.row}>
                          <Text variant="bodyStrong" style={styles.flex} numberOfLines={2}>
                            {food.name}
                          </Text>
                          <Text variant="number">{format(strings.common.kcal, { value: formatInteger(macros.kcal) })}</Text>
                        </View>
                        <View style={styles.row}>
                          <Text variant="label" color="textMuted" style={styles.flex}>
                            {`${item.grams} g${guide ? ` · ${format(r.about, { guide: strings.guides[guide.key].toLowerCase() })}` : ''}`}
                          </Text>
                          {check ? <Chip tone="accent" label={r.check} /> : null}
                        </View>
                        <MacroLine proteinG={macros.proteinG} carbsG={macros.carbsG} fatG={macros.fatG} />
                      </PressableScale>
                    </Card>
                  </FadeInView>
                );
              })
            )}

            <Button
              label={r.addMissing}
              variant="ghost"
              size="compact"
              icon={<Icon name="plus" size={18} color="accentText" />}
              onPress={() => setPicker({ mode: 'add' })}
            />
          </FadeInView>
        ) : null}
      </ScrollView>

      {phase === 'result' ? (
        <View style={styles.footer}>
          <Button label={t.save} onPress={save} disabled={entries.length === 0} haptic="none" />
        </View>
      ) : null}

      <Sheet
        visible={editingFood !== undefined}
        onClose={() => setEditing(null)}
        title={editingFood ? format(r.editTitle, { name: editingFood.name }) : ''}
      >
        {editingItem && editingFood && editing !== null ? (
          <View style={styles.gap}>
            <View style={styles.row}>
              <Text variant="displayLarge" style={[styles.flex, styles.tabular]}>
                {`${editingItem.grams} g`}
              </Text>
              <Text variant="number" color="accentText">
                {format(strings.common.kcal, {
                  value: formatInteger(entryMacros({ basis: basisOf(editingFood), quantity: editingItem.grams }).kcal),
                })}
              </Text>
            </View>
            <Slider
              value={editingItem.grams}
              min={0}
              max={MAX_GRAMS}
              step={5}
              onChange={(grams) => update(editing, { grams })}
              accessibilityLabel={r.amountSlider}
              accessibilityValueText={`${editingItem.grams} g`}
            />
            <Text variant="overline" color="textSubtle">
              {r.guidesTitle}
            </Text>
            <View style={styles.guides}>
              {portionGuides(editingFood.category).map((guide) => (
                <SelectChip
                  key={guide.key}
                  icon="hand"
                  label={`${strings.guides[guide.key]} · ${guide.grams} g`}
                  selected={editingItem.grams === guide.grams}
                  role="radio"
                  onPress={() => update(editing, { grams: guide.grams })}
                />
              ))}
            </View>
            <View style={styles.sheetActions}>
              <Button
                label={r.replace}
                variant="secondary"
                size="compact"
                icon={<Icon name="swap" size={18} />}
                onPress={() => {
                  setPicker({ mode: 'replace', index: editing });
                  setEditing(null);
                }}
              />
              <Button
                label={r.remove}
                variant="secondary"
                size="compact"
                icon={<Icon name="trash" size={18} color="danger" />}
                onPress={() => remove(editing)}
              />
            </View>
            <Button label={r.done} onPress={() => setEditing(null)} />
          </View>
        ) : null}
      </Sheet>

      <FoodPickerSheet
        visible={picker !== null}
        title={picker?.mode === 'add' ? r.addMissingTitle : t.changeTitle}
        onClose={() => setPicker(null)}
        onPick={(foodId) => {
          const food = FOODS_BY_ID[foodId];
          if (picker?.mode === 'replace') {
            // A corrected food is the user's choice: no longer uncertain.
            update(picker.index, { foodId, confidence: undefined });
          } else if (food) {
            setItems((current) => [
              ...current,
              { foodId, grams: portionGuides(food.category)[0]?.grams ?? 100 },
            ]);
          }
          haptics.select();
          setPicker(null);
        }}
      />
    </SafeAreaView>
  );
}

function MacroLine({ proteinG, carbsG, fatG }: { proteinG: number; carbsG: number; fatG: number }) {
  return (
    <Text variant="caption" color="textSubtle">
      {`${strings.macros.protein} ${formatInteger(proteinG)} g · ${strings.macros.carbs} ${formatInteger(
        carbsG,
      )} g · ${strings.macros.fat} ${formatInteger(fatG)} g`}
    </Text>
  );
}

/** Sweeping line and soft pulse over the photo while recognising. */
function ScanOverlay() {
  const reducedMotion = useReducedMotion();
  const [sweep] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reducedMotion) return;
    const loop = Animated.loop(
      Animated.timing(sweep, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [sweep, reducedMotion]);
  return (
    <View style={[StyleSheet.absoluteFill, styles.scanWrap]} pointerEvents="none">
      <View style={styles.scanTint} />
      <Animated.View
        style={[
          styles.scanLine,
          { transform: [{ translateY: sweep.interpolate({ inputRange: [0, 1], outputRange: [0, PHOTO_HEIGHT - 4] }) }] },
        ]}
      />
    </View>
  );
}

/** Changing status lines while the recognition service works. */
function AnalyzingSteps() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, r.analyzingSteps.length - 1)), 550);
    return () => clearInterval(timer);
  }, []);
  return (
    <View style={styles.analyzing} accessible accessibilityLabel={t.analyzing} accessibilityLiveRegion="polite">
      {r.analyzingSteps.map((text, i) => (
        <View key={text} style={styles.stepRow}>
          <Icon name={i < step ? 'checkCircle' : 'sparkles'} size={20} color={i <= step ? 'accentText' : 'textSubtle'} />
          <Text variant={i === step ? 'bodyStrong' : 'body'} color={i <= step ? 'text' : 'textSubtle'}>
            {text}
          </Text>
        </View>
      ))}
    </View>
  );
}

const PHOTO_HEIGHT = 240;

const styles = themedStyles(() =>
  StyleSheet.create({
    meals: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.lg,
    },
    gap: {
      gap: spacing.md,
    },
    flex: {
      flex: 1,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    tabular: {
      fontVariant: ['tabular-nums'],
    },
    photoWrap: {
      height: PHOTO_HEIGHT,
      borderRadius: radii.card,
      overflow: 'hidden',
      backgroundColor: colors.surfaceRaised,
    },
    photo: {
      width: '100%',
      height: '100%',
    },
    placeholder: {
      height: 180,
      borderRadius: radii.card,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scanWrap: {
      overflow: 'hidden',
    },
    scanTint: {
      ...StyleSheet.absoluteFill,
      backgroundColor: fixed.photoDim,
    },
    scanLine: {
      height: 4,
      backgroundColor: colors.accent,
      shadowColor: colors.accent,
      shadowOpacity: 0.9,
      shadowRadius: 12,
      elevation: 6,
    },
    analyzing: {
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radii.card,
      backgroundColor: colors.surface,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    summary: {
      gap: spacing.xs,
    },
    item: {
      padding: 0,
    },
    itemBody: {
      padding: spacing.lg,
      gap: spacing.xs,
    },
    guides: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    sheetActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      flexWrap: 'wrap',
    },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
  }),
);
