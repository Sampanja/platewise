import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button, EmptyState, Skeleton, Text } from '@/components/ui';
import { format, strings } from '@/i18n';
import { lookupBarcode, type BarcodeResult } from '@/services/barcode';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.product;

/**
 * Looks a scanned barcode up from Open Food Facts. A found product opens in
 * the normal food view; otherwise the user can add it from the package.
 */
export default function ProductScreen() {
  const params = useLocalSearchParams<{ code: string; meal?: string; date?: string }>();
  const code = params.code;
  const [result, setResult] = useState<BarcodeResult | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void lookupBarcode(code).then((value) => {
      if (cancelled) return;
      if (value.status === 'found') {
        router.replace({
          pathname: '/food/[id]',
          params: { id: value.food.id, meal: params.meal ?? '', date: params.date ?? '' },
        });
      } else {
        setResult(value);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [code, attempt, params.meal, params.date]);

  const addOwn = (name = '', brand = '') =>
    router.replace({
      pathname: '/custom-food',
      params: { mode: 'barcode', barcode: code, name, brand, meal: params.meal ?? '', date: params.date ?? '' },
    });
  const scanAgain = () =>
    router.replace({ pathname: '/camera', params: { mode: 'barcode', meal: params.meal ?? '', date: params.date ?? '' } });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader variant="close" title={strings.methods.barcode} />
      <View style={styles.content}>
        {result === null ? (
          <View style={styles.loading} accessible accessibilityLabel={t.loading} accessibilityLiveRegion="polite">
            <Skeleton height={180} radius={radii.card} />
            <Skeleton height={28} radius={radii.sm} />
            <Skeleton height={20} radius={radii.sm} />
            <Text variant="body" color="textMuted" style={styles.center}>
              {t.loading}
            </Text>
          </View>
        ) : null}

        {result?.status === 'notFound' ? (
          <EmptyState
            icon="barcode"
            title={t.notFoundTitle}
            body={format(t.notFoundBody, { code })}
            action={{ label: t.addOwn, onPress: () => addOwn() }}
          />
        ) : null}

        {result?.status === 'incomplete' ? (
          <EmptyState
            icon="barcode"
            title={t.incompleteTitle}
            body={format(t.incompleteBody, { name: result.name })}
            action={{ label: t.addOwn, onPress: () => addOwn(result.name, result.brand ?? '') }}
          />
        ) : null}

        {result?.status === 'offline' ? (
          <EmptyState
            icon="alert"
            tone="danger"
            title={t.offlineTitle}
            body={t.offlineBody}
            action={{
              label: strings.common.retry,
              onPress: () => {
                setResult(null);
                setAttempt((n) => n + 1);
              },
            }}
          />
        ) : null}

        {result !== null ? (
          <View style={styles.secondary}>
            {result.status === 'offline' ? (
              <Button label={t.addOwn} variant="secondary" onPress={() => addOwn()} />
            ) : null}
            <Button label={t.scanAgain} variant="ghost" onPress={scanAgain} />
          </View>
        ) : null}
      </View>
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
      flex: 1,
      padding: spacing.lg,
      gap: spacing.lg,
    },
    loading: {
      gap: spacing.md,
    },
    center: {
      textAlign: 'center',
    },
    secondary: {
      gap: spacing.sm,
    },
  }),
);
