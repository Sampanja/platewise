import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import {
  Button,
  Card,
  Chip,
  EmptyState,
  haptics,
  Icon,
  IconButton,
  Skeleton,
  Text,
} from '@/components/ui';
import { FOODS_BY_ID } from '@/data/catalog';
import { useDiaryStore } from '@/data/stores/diary';
import type { DiaryMeal } from '@/data/types';
import { entryMacros, sumEntries } from '@/domain/diary';
import { recognizePhoto, type RecognizedFood } from '@/domain/photoRecognition';
import { format, formatInteger, strings } from '@/i18n';
import { formatGrams } from '@/lib/amounts';
import { today } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { colors, radii, spacing } from '@/theme';

const t = strings.photo;
/** Simulated recognition time with test data. */
const ANALYZE_MS = 1600;

type Phase = 'pick' | 'analyzing' | 'result' | 'denied';

/**
 * Food from a photo. The real camera or gallery is used; recognition is test
 * data (stand-in for `recognize-food-photo`). The photo is not stored. The
 * result is always marked "arvio" and can be corrected before saving.
 */
export default function PhotoScreen() {
  const params = useLocalSearchParams<{ meal?: DiaryMeal; date?: string }>();
  const meal: DiaryMeal = params.meal ?? 'snack';
  const addMany = useDiaryStore((s) => s.addMany);
  const [phase, setPhase] = useState<Phase>('pick');
  const [uri, setUri] = useState<string | null>(null);
  const [items, setItems] = useState<RecognizedFood[]>([]);

  useEffect(() => {
    if (phase !== 'analyzing' || !uri) return;
    const timer = setTimeout(() => {
      setItems(recognizePhoto(uri).filter((item) => FOODS_BY_ID[item.foodId]));
      haptics.success();
      setPhase('result');
    }, ANALYZE_MS);
    return () => clearTimeout(timer);
  }, [phase, uri]);

  const pick = async (source: 'camera' | 'gallery') => {
    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.6 };
    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setPhase('denied');
        return;
      }
    }
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
    if (result.canceled || !result.assets[0]) return;
    setUri(result.assets[0].uri);
    setPhase('analyzing');
  };

  const setGrams = (index: number, grams: number) =>
    setItems((current) => current.map((item, i) => (i === index ? { ...item, grams: Math.max(0, grams) } : item)));
  const removeItem = (index: number) => {
    haptics.tap();
    setItems((current) => current.filter((_, i) => i !== index));
  };

  const asEntries = items
    .filter((item) => item.grams > 0)
    .map((item) => {
      const food = FOODS_BY_ID[item.foodId];
      return {
        date: params.date ?? today(),
        meal,
        name: food.name,
        basis: { kind: 'food' as const, foodId: food.id, per100g: food.per100g },
        quantity: item.grams,
        estimate: true,
      };
    });

  const save = () => {
    addMany(asEntries);
    haptics.success();
    showToast(format(t.saved, { count: asEntries.length }));
    router.dismissTo('/diary');
  };

  const total = sumEntries(asEntries);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader variant="close" title={t.title} />
      <ScrollView contentContainerStyle={styles.content}>
        {uri ? (
          <Image source={uri} style={styles.photo} contentFit="cover" accessibilityLabel={t.title} />
        ) : (
          <View style={styles.placeholder}>
            <Icon name="camera" size={48} color="accentText" />
          </View>
        )}

        {phase === 'pick' ? (
          <View style={styles.gap}>
            <Text variant="body" color="textMuted">
              {t.intro}
            </Text>
            <Text variant="caption" color="textSubtle">
              {t.testDataNote}
            </Text>
          </View>
        ) : null}

        {phase === 'denied' ? (
          <EmptyState icon="camera" tone="danger" title={t.permissionTitle} body={t.permissionBody} />
        ) : null}

        {phase === 'analyzing' ? (
          <View style={styles.gap} accessible accessibilityLabel={t.analyzing} accessibilityLiveRegion="polite">
            <Text variant="heading">{t.analyzing}</Text>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} height={64} radius={radii.md} />
            ))}
          </View>
        ) : null}

        {phase === 'result' ? (
          <View style={styles.gap}>
            <View style={styles.resultHeader}>
              <Text variant="title" accessibilityRole="header" style={styles.flex}>
                {t.resultTitle}
              </Text>
              <Chip tone="accent" label={strings.common.estimate} />
            </View>
            <Text variant="caption" color="textSubtle">
              {t.resultNote}
            </Text>
            {items.length === 0 ? (
              <Text variant="body" color="textMuted">
                {t.emptyResult}
              </Text>
            ) : (
              items.map((item, index) => {
                const food = FOODS_BY_ID[item.foodId];
                const kcal = entryMacros({
                  basis: { kind: 'food', foodId: food.id, per100g: food.per100g },
                  quantity: item.grams,
                }).kcal;
                return (
                  <Card key={`${item.foodId}-${index}`} style={styles.item}>
                    <View style={styles.flex}>
                      <Text variant="bodyStrong">{food.name}</Text>
                      <Text variant="caption" color="textSubtle">
                        {format(strings.common.kcal, { value: formatInteger(kcal) })}
                      </Text>
                    </View>
                    <IconButton
                      icon="minus"
                      size={40}
                      haptic="select"
                      accessibilityLabel={`${strings.food.minus10}: ${food.name}`}
                      onPress={() => setGrams(index, item.grams - 10)}
                    />
                    <Text variant="number" style={styles.grams}>
                      {formatGrams(item.grams)}
                    </Text>
                    <IconButton
                      icon="plus"
                      size={40}
                      haptic="select"
                      accessibilityLabel={`${strings.food.plus10}: ${food.name}`}
                      onPress={() => setGrams(index, item.grams + 10)}
                    />
                    <IconButton
                      icon="close"
                      variant="plain"
                      size={40}
                      haptic="none"
                      accessibilityLabel={format(t.removeFood, { name: food.name })}
                      onPress={() => removeItem(index)}
                    />
                  </Card>
                );
              })
            )}
            {asEntries.length > 0 ? (
              <Text variant="bodyStrong" style={styles.total}>
                {format(strings.common.kcal, { value: formatInteger(total.kcal) })}
              </Text>
            ) : null}
            <Button
              label={t.addFood}
              variant="ghost"
              size="compact"
              icon={<Icon name="search" size={18} color="accentText" />}
              onPress={() =>
                router.push({ pathname: '/diary-add', params: { meal, date: params.date ?? today(), tab: 'search' } })
              }
            />
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {phase === 'result' ? (
          <>
            <Button label={t.save} onPress={save} disabled={asEntries.length === 0} haptic="none" />
            <Button label={t.retake} variant="ghost" size="compact" onPress={() => pick('camera')} />
          </>
        ) : phase === 'analyzing' ? null : (
          <>
            <Button label={t.camera} icon={<Icon name="camera" size={20} color="textOnAccent" />} onPress={() => pick('camera')} />
            <Button
              label={t.gallery}
              variant="secondary"
              icon={<Icon name="gallery" size={20} />}
              onPress={() => pick('gallery')}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  photo: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radii.lg,
  },
  placeholder: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  gap: {
    gap: spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
  },
  grams: {
    minWidth: 56,
    textAlign: 'center',
  },
  total: {
    textAlign: 'right',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
});
