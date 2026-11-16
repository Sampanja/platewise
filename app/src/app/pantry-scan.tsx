import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { TestModeBanner } from '@/components/TestModeBanner';
import { Button, EmptyState, FadeInView, haptics, Icon, PressableScale, Text } from '@/components/ui';
import { INGREDIENTS_BY_ID } from '@/data/catalog';
import { usePantryDraftStore, type DraftRow } from '@/data/stores/pantryDraft';
import { defaultLocation } from '@/domain/pantry';
import { Mascot } from '@/features/mascot/Mascot';
import { format, strings } from '@/i18n';
import { pantryRecognition } from '@/services/pantryRecognition';
import { activeCharacter, colors, fixed, palettes, radii, spacing, themedStyles, type Palette } from '@/theme';

const t = strings.pantryScan;
/** Enough for a fridge, a freezer and a couple of cupboards. */
const MAX_PHOTOS = 6;
const STEP_MS = 1100;

/** The camera UI sits on the live image: always dark, in the character's colours. */
const ink: Palette = new Proxy({} as Palette, {
  get: (_target, key: string) => palettes[activeCharacter()].dark[key as keyof Palette],
});

type Phase = 'camera' | 'recognizing' | 'error';

/**
 * Skannaa jääkaappi tai kaappi: one or more shelf photos → recognised
 * ingredients → the review screen (always, nothing is saved unseen). Photos
 * stay in memory only and are dropped after recognition.
 */
export default function PantryScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>('camera');
  const [step, setStep] = useState(0);
  const setDraft = usePantryDraftStore((s) => s.set);

  useEffect(() => {
    if (phase !== 'recognizing') return;
    const timer = setInterval(() => setStep((s) => (s + 1) % t.steps.length), STEP_MS);
    return () => clearInterval(timer);
  }, [phase]);

  const addPhoto = (uri: string) => setPhotos((list) => (list.length >= MAX_PHOTOS ? list : [...list, uri]));

  const capture = async () => {
    if (!camera.current || busy || photos.length >= MAX_PHOTOS) return;
    setBusy(true);
    haptics.tap();
    try {
      const picture = await camera.current.takePictureAsync({ quality: 0.5 });
      if (picture?.uri) addPhoto(picture.uri);
    } finally {
      setBusy(false);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!result.canceled && result.assets[0]) addPhoto(result.assets[0].uri);
  };

  const recognize = async () => {
    if (photos.length === 0) return;
    setStep(0);
    setPhase('recognizing');
    try {
      const found = await pantryRecognition.recognize(photos);
      const rows: DraftRow[] = found
        .filter((item) => INGREDIENTS_BY_ID[item.ingredientId])
        .map((item) => ({
          key: item.ingredientId,
          ingredientId: item.ingredientId,
          amount: { kind: 'level', level: item.level },
          location: defaultLocation(INGREDIENTS_BY_ID[item.ingredientId]),
          confidence: item.confidence,
        }));
      setDraft(rows, photos.length);
      haptics.success();
      router.replace('/pantry-review');
    } catch {
      setPhase('error');
    }
  };

  if (phase === 'recognizing') {
    return (
      <SafeAreaView style={styles.themed} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Mascot state="thinking" size={140} />
          <FadeInView key={step}>
            <Text variant="title" style={styles.centerText} accessibilityLiveRegion="polite">
              {t.steps[step]}
            </Text>
          </FadeInView>
          <Text variant="caption" color="textSubtle">
            {photos.length === 1 ? t.photosOne : format(t.photos, { count: photos.length })}
          </Text>
        </View>
        {pantryRecognition.mode === 'test' ? (
          <View style={styles.banner}>
            <TestModeBanner title={strings.photoResult.testModeTitle} body={t.testModeBody} />
          </View>
        ) : null}
      </SafeAreaView>
    );
  }

  if (phase === 'error') {
    return (
      <SafeAreaView style={styles.themed} edges={['top', 'bottom']}>
        <ScreenHeader title={t.title} />
        <EmptyState
          icon="alert"
          mascot="thinking"
          title={strings.errors.genericTitle}
          body={t.error}
          action={{ label: t.retry, onPress: () => void recognize() }}
        />
      </SafeAreaView>
    );
  }

  if (!permission) return <View style={styles.black} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.themed} edges={['top', 'bottom']}>
        <ScreenHeader title={t.title} variant="close" />
        <View style={styles.permission}>
          <View style={styles.permissionIcon}>
            <Icon name="camera" size={48} color="accentText" />
          </View>
          <Text variant="title" style={styles.centerText}>
            {t.permissionTitle}
          </Text>
          <Text variant="body" color="textMuted" style={styles.centerText}>
            {t.permissionBody}
          </Text>
          {permission.canAskAgain ? (
            <Button label={strings.camera.permissionAllow} onPress={() => void requestPermission()} />
          ) : (
            <Button label={strings.camera.permissionSettings} onPress={() => void Linking.openSettings()} />
          )}
          <Button label={strings.camera.gallery} variant="secondary" onPress={() => void pickFromGallery()} />
          {photos.length > 0 ? <Button label={t.recognize} onPress={() => void recognize()} /> : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.black}>
      <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" onCameraReady={() => setReady(true)} />
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        <View style={styles.top}>
          <PressableScale
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={strings.common.close}
            style={styles.round}
          >
            <Icon name="close" size={22} tint={ink.text} />
          </PressableScale>
          <View style={styles.guide}>
            <Text variant="bodyStrong" style={styles.inkText}>
              {t.guide}
            </Text>
            <Text variant="caption" style={styles.inkMuted}>
              {t.tip}
            </Text>
            {pantryRecognition.mode === 'test' ? (
              <Text variant="caption" style={styles.inkGold}>
                {strings.photoResult.testModeTitle}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.frame} pointerEvents="none" />

        <View style={styles.bottom}>
          {photos.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbs}>
              {photos.map((uri, index) => (
                <View key={uri} style={styles.thumbWrap}>
                  <Image source={{ uri }} style={styles.thumb} contentFit="cover" />
                  <PressableScale
                    onPress={() => setPhotos((list) => list.filter((u) => u !== uri))}
                    accessibilityRole="button"
                    accessibilityLabel={format(t.removePhoto, { index: index + 1 })}
                    style={styles.thumbRemove}
                  >
                    <Icon name="close" size={14} tint={ink.text} />
                  </PressableScale>
                </View>
              ))}
            </ScrollView>
          ) : null}
          <View style={styles.controls}>
            <PressableScale
              onPress={() => void pickFromGallery()}
              accessibilityRole="button"
              accessibilityLabel={strings.camera.gallery}
              style={styles.round}
            >
              <Icon name="gallery" size={22} tint={ink.text} />
            </PressableScale>
            <PressableScale
              onPress={() => void capture()}
              disabled={!ready || busy || photos.length >= MAX_PHOTOS}
              accessibilityRole="button"
              accessibilityLabel={t.capture}
              style={styles.shutter}
            >
              <View style={styles.shutterInner} />
            </PressableScale>
            <View style={styles.round}>
              <Text variant="label" style={styles.inkText}>
                {photos.length}
              </Text>
            </View>
          </View>
          <Button
            label={t.recognize}
            disabled={photos.length === 0}
            icon={<Icon name="sparkles" size={20} color="textOnAccent" />}
            onPress={() => void recognize()}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    black: {
      flex: 1,
      backgroundColor: fixed.black,
    },
    themed: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.lg,
      padding: spacing.xl,
    },
    centerText: {
      textAlign: 'center',
    },
    banner: {
      padding: spacing.lg,
    },
    permission: {
      flex: 1,
      justifyContent: 'center',
      gap: spacing.lg,
      padding: spacing.xl,
      alignItems: 'stretch',
    },
    permissionIcon: {
      alignSelf: 'center',
    },
    overlay: {
      flex: 1,
      justifyContent: 'space-between',
      padding: spacing.lg,
    },
    top: {
      gap: spacing.md,
    },
    guide: {
      gap: spacing.xs,
      padding: spacing.md,
      borderRadius: radii.lg,
      backgroundColor: fixed.cameraPanel,
    },
    inkText: {
      color: palettes[activeCharacter()].dark.text,
    },
    inkMuted: {
      color: palettes[activeCharacter()].dark.textMuted,
    },
    inkGold: {
      color: palettes[activeCharacter()].dark.gold,
    },
    frame: {
      flex: 1,
      marginVertical: spacing.lg,
      borderRadius: radii.card,
      borderWidth: 2,
      borderColor: fixed.cameraFrame,
      borderStyle: 'dashed',
    },
    bottom: {
      gap: spacing.md,
    },
    thumbs: {
      gap: spacing.md,
      paddingTop: spacing.sm,
      paddingRight: spacing.sm,
    },
    thumbWrap: {
      width: 64,
      height: 64,
    },
    thumb: {
      width: 64,
      height: 64,
      borderRadius: radii.md,
      borderWidth: 2,
      borderColor: fixed.cameraFrame,
    },
    thumbRemove: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: fixed.cameraPanel,
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
    },
    round: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: fixed.cameraPanel,
    },
    shutter: {
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 4,
      borderColor: fixed.white,
      alignItems: 'center',
      justifyContent: 'center',
    },
    shutterInner: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: fixed.white,
    },
  }),
);
