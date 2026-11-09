import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Linking, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Sheet } from '@/components/Sheet';
import { Button, haptics, Icon, PressableScale, Text, TextField, useReducedMotion } from '@/components/ui';
import type { DiaryMeal } from '@/data/types';
import { isValidBarcode } from '@/domain/openFoodFacts';
import { strings } from '@/i18n';
import { activeCharacter, fixed, palettes, radii, spacing, themedStyles, type Palette } from '@/theme';

const t = strings.camera;
type Mode = 'photo' | 'barcode' | 'label';
const MODES: readonly Mode[] = ['photo', 'barcode', 'label'];

/** The camera UI is always dark (it sits on the live image) but in the character's colours. */
const ink: Palette = new Proxy({} as Palette, {
  get: (_target, key: string) => palettes[activeCharacter()].dark[key as keyof Palette],
});

/**
 * One camera for the diary: food photo (with a plate guide), barcode (live
 * scanning with Open Food Facts) and nutrition label. Nothing is stored: the
 * photo goes to the recognition service and is dropped.
 */
export default function CameraScreen() {
  const params = useLocalSearchParams<{ mode?: Mode; meal?: DiaryMeal; date?: string }>();
  const [mode, setMode] = useState<Mode>(params.mode ?? 'photo');
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const scanned = useRef(false);
  const camera = useRef<CameraView>(null);
  const context = { meal: params.meal ?? 'snack', date: params.date ?? '' };

  const openProduct = (code: string) => {
    router.replace({ pathname: '/product/[code]', params: { code, ...context } });
  };

  const onBarcode = ({ data }: BarcodeScanningResult) => {
    if (scanned.current || mode !== 'barcode' || !isValidBarcode(data)) return;
    scanned.current = true;
    haptics.success();
    openProduct(data);
  };

  const capture = async () => {
    if (!camera.current || busy) return;
    setBusy(true);
    haptics.tap();
    try {
      const picture = await camera.current.takePictureAsync({ quality: 0.5 });
      if (!picture?.uri) return;
      if (mode === 'label') router.replace({ pathname: '/custom-food', params: { mode: 'label', uri: picture.uri, ...context } });
      else router.replace({ pathname: '/photo', params: { uri: picture.uri, ...context } });
    } finally {
      setBusy(false);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    if (mode === 'label') router.replace({ pathname: '/custom-food', params: { mode: 'label', uri, ...context } });
    else router.replace({ pathname: '/photo', params: { uri, ...context } });
  };

  const submitManual = () => {
    const code = manualCode.replace(/\D/g, '');
    if (!isValidBarcode(code)) return;
    setManualOpen(false);
    openProduct(code);
  };

  if (!permission) return <View style={styles.black} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.black, styles.permission]}>
        <CloseButton />
        <View style={styles.permissionBody}>
          <Icon name="camera" size={48} color="accentText" />
          <Text variant="title" style={[styles.center, styles.inkText]}>
            {t.permissionTitle}
          </Text>
          <Text variant="body" style={[styles.center, styles.inkMuted]}>
            {t.permissionBody}
          </Text>
          {permission.canAskAgain ? (
            <Button label={t.permissionAllow} onPress={() => void requestPermission()} />
          ) : (
            <Button label={t.permissionSettings} onPress={() => void Linking.openSettings()} />
          )}
          {mode !== 'barcode' ? (
            <Button label={t.gallery} variant="secondary" onPress={() => void pickFromGallery()} />
          ) : (
            <Button label={t.manual} variant="secondary" onPress={() => setManualOpen(true)} />
          )}
        </View>
        <ManualSheet
          visible={manualOpen}
          value={manualCode}
          onChange={setManualCode}
          onClose={() => setManualOpen(false)}
          onSubmit={submitManual}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.black}>
      <CameraView
        ref={camera}
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        onCameraReady={() => setReady(true)}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
        onBarcodeScanned={mode === 'barcode' ? onBarcode : undefined}
      />
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <CloseButton />
          <PressableScale
            onPress={() => setTorch((on) => !on)}
            accessibilityRole="button"
            accessibilityLabel={torch ? t.torchOff : t.torchOn}
            accessibilityState={{ selected: torch }}
            haptic="select"
            style={[styles.roundButton, torch && styles.roundButtonOn]}
          >
            <Icon name="zap" size={22} tint={torch ? ink.textOnAccent : ink.text} />
          </PressableScale>
        </View>

        <View style={styles.guideArea} pointerEvents="none">
          <Guide mode={mode} />
          <View style={styles.tip}>
            <Text variant="label" style={[styles.center, styles.inkText]} accessibilityLiveRegion="polite">
              {ready ? t.tips[mode] : t.notReady}
            </Text>
          </View>
        </View>

        <View style={styles.bottom}>
          <View style={styles.modes} accessibilityRole="tablist">
            {MODES.map((value) => {
              const selected = value === mode;
              return (
                <PressableScale
                  key={value}
                  haptic="select"
                  onPress={() => {
                    scanned.current = false;
                    setMode(value);
                  }}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  style={[styles.mode, selected && styles.modeSelected]}
                >
                  <Text variant="label" style={selected ? styles.modeTextSelected : styles.inkText}>
                    {t.modes[value]}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
          <View style={styles.controls}>
            {mode === 'barcode' ? (
              <PressableScale
                onPress={() => setManualOpen(true)}
                accessibilityRole="button"
                style={styles.textButton}
              >
                <Icon name="pencil" size={18} tint={ink.text} />
                <Text variant="label" style={styles.inkText}>
                  {t.manual}
                </Text>
              </PressableScale>
            ) : (
              <>
                <PressableScale
                  onPress={() => void pickFromGallery()}
                  accessibilityRole="button"
                  accessibilityLabel={t.gallery}
                  style={styles.roundButton}
                >
                  <Icon name="gallery" size={22} tint={ink.text} />
                </PressableScale>
                <PressableScale
                  onPress={() => void capture()}
                  accessibilityRole="button"
                  accessibilityLabel={t.shutter}
                  disabled={!ready || busy}
                  haptic="none"
                  style={styles.shutter}
                >
                  <View style={styles.shutterInner} />
                </PressableScale>
                <View style={styles.roundButtonSpacer} />
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
      <ManualSheet
        visible={manualOpen}
        value={manualCode}
        onChange={setManualCode}
        onClose={() => setManualOpen(false)}
        onSubmit={submitManual}
      />
    </View>
  );
}

function CloseButton() {
  return (
    <PressableScale
      onPress={() => router.back()}
      accessibilityRole="button"
      accessibilityLabel={t.close}
      style={styles.roundButton}
    >
      <Icon name="close" size={22} tint={ink.text} />
    </PressableScale>
  );
}

/** Framing guide: corner brackets, a plate circle for food, a scan line for barcodes. */
function Guide({ mode }: { mode: Mode }) {
  const reducedMotion = useReducedMotion();
  const [line] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (mode !== 'barcode' || reducedMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(line, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(line, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [mode, line, reducedMotion]);

  const size = mode === 'barcode' ? styles.frameBarcode : mode === 'label' ? styles.frameLabel : styles.framePhoto;
  const height = mode === 'barcode' ? 150 : mode === 'label' ? 380 : 300;
  return (
    <View style={[styles.frame, size]}>
      <View style={[styles.corner, styles.tl]} />
      <View style={[styles.corner, styles.tr]} />
      <View style={[styles.corner, styles.bl]} />
      <View style={[styles.corner, styles.br]} />
      {mode === 'photo' ? <View style={styles.plate} /> : null}
      {mode === 'barcode' ? (
        <Animated.View
          style={[
            styles.scanLine,
            { transform: [{ translateY: line.interpolate({ inputRange: [0, 1], outputRange: [12, height - 14] }) }] },
          ]}
        />
      ) : null}
    </View>
  );
}

function ManualSheet({
  visible,
  value,
  onChange,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const digits = value.replace(/\D/g, '');
  const invalid = digits.length >= 8 && !isValidBarcode(digits);
  return (
    <Sheet visible={visible} onClose={onClose} title={t.manualTitle}>
      <Text variant="body" color="textMuted">
        {t.manualBody}
      </Text>
      <TextField
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        placeholder={t.manualPlaceholder}
        accessibilityLabel={t.manualTitle}
        maxLength={14}
        autoFocus
        returnKeyType="search"
        onSubmitEditing={onSubmit}
      />
      {invalid ? (
        <Text variant="caption" color="textMuted">
          {t.invalidCode}
        </Text>
      ) : null}
      <Button label={t.manualSearch} onPress={onSubmit} disabled={!isValidBarcode(digits)} />
    </Sheet>
  );
}

const CORNER = 28;

const styles = themedStyles(() =>
  StyleSheet.create({
    black: {
      flex: 1,
      backgroundColor: fixed.black,
    },
    overlay: {
      flex: 1,
      justifyContent: 'space-between',
    },
    permission: {
      padding: spacing.lg,
    },
    permissionBody: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'stretch',
      gap: spacing.lg,
    },
    center: {
      textAlign: 'center',
    },
    inkText: {
      color: ink.text,
    },
    inkMuted: {
      color: ink.textMuted,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
    },
    roundButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: fixed.cameraPanelLight,
      borderWidth: 1,
      borderColor: fixed.cameraHairline,
    },
    roundButtonOn: {
      backgroundColor: ink.accent,
    },
    roundButtonSpacer: {
      width: 48,
    },
    guideArea: {
      alignItems: 'center',
      gap: spacing.lg,
    },
    frame: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    framePhoto: {
      width: 300,
      height: 300,
    },
    frameBarcode: {
      width: 300,
      height: 150,
    },
    frameLabel: {
      width: 260,
      height: 380,
    },
    corner: {
      position: 'absolute',
      width: CORNER,
      height: CORNER,
      borderColor: ink.text,
    },
    tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: radii.md },
    tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: radii.md },
    bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: radii.md },
    br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: radii.md },
    plate: {
      width: 240,
      height: 240,
      borderRadius: 120,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: fixed.cameraFrame,
    },
    scanLine: {
      position: 'absolute',
      top: 0,
      left: 16,
      right: 16,
      height: 2,
      borderRadius: 1,
      backgroundColor: ink.accent,
    },
    tip: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radii.pill,
      backgroundColor: fixed.cameraPanel,
      maxWidth: 340,
    },
    bottom: {
      gap: spacing.lg,
      paddingBottom: spacing.lg,
    },
    modes: {
      flexDirection: 'row',
      alignSelf: 'center',
      padding: spacing.xs,
      borderRadius: radii.pill,
      backgroundColor: fixed.cameraPanel,
    },
    mode: {
      minHeight: 40,
      paddingHorizontal: spacing.lg,
      borderRadius: radii.pill,
      justifyContent: 'center',
    },
    modeSelected: {
      backgroundColor: ink.accent,
    },
    modeTextSelected: {
      color: ink.textOnAccent,
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      minHeight: 84,
    },
    shutter: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 4,
      borderColor: ink.text,
      alignItems: 'center',
      justifyContent: 'center',
    },
    shutterInner: {
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: ink.text,
    },
    textButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: 48,
      paddingHorizontal: spacing.lg,
      borderRadius: radii.pill,
      backgroundColor: fixed.cameraPanel,
    },
  }),
);
