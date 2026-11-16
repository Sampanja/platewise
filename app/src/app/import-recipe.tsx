import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button, Card, haptics, Icon, Stepper, Text, TextField } from '@/components/ui';
import { useImportDraftStore } from '@/data/stores/importDraft';
import { strings } from '@/i18n';
import { matchIngredientLines, recipeImport } from '@/services/recipeImport';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.recipeImport;

type Problem = 'invalidUrl' | 'offline' | 'noRecipe' | null;

/**
 * Reseptit → Omat → "Tuo linkistä": a link (pasted, or given as `url`) is
 * read for its schema.org recipe; without one, or by choice, the recipe is
 * typed in. Both go to the ingredient review before anything is saved.
 */
export default function ImportRecipeScreen() {
  const params = useLocalSearchParams<{ url?: string; manual?: string }>();
  const [url, setUrl] = useState(params.url ?? '');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<Problem>(null);
  const [manual, setManual] = useState(params.manual === '1');
  const [title, setTitle] = useState('');
  const [servings, setServings] = useState(4);
  const [lines, setLines] = useState('');
  const [steps, setSteps] = useState('');
  const setDraft = useImportDraftStore((s) => s.set);

  const fetchRecipe = async () => {
    if (busy || !url.trim()) return;
    setBusy(true);
    setProblem(null);
    try {
      const result = await recipeImport.fromUrl(url);
      if (result.status !== 'found') {
        setProblem(result.status);
        haptics.warning();
        return;
      }
      const { draft } = result;
      setDraft({
        title: draft.title,
        sourceUrl: url.trim(),
        servings: draft.servings,
        totalTimeMin: draft.totalTimeMin,
        activeTimeMin: draft.activeTimeMin,
        ingredients: matchIngredientLines(draft.ingredientLines),
        steps: draft.steps,
      });
      haptics.success();
      router.push('/import-review');
    } finally {
      setBusy(false);
    }
  };

  const paste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) setUrl(text.trim());
  };

  const continueManual = () => {
    const ingredientLines = lines.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!title.trim() || ingredientLines.length === 0) return;
    setDraft({
      title: title.trim(),
      sourceUrl: null,
      servings,
      totalTimeMin: null,
      activeTimeMin: null,
      ingredients: matchIngredientLines(ingredientLines),
      steps: steps.split('\n').map((s) => s.trim()).filter(Boolean),
    });
    router.push('/import-review');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={manual ? t.manualTitle : t.title} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {manual ? (
            <>
              <Field label={t.nameLabel}>
                <TextField value={title} onChangeText={setTitle} accessibilityLabel={t.nameLabel} maxLength={80} />
              </Field>
              <View style={styles.servings}>
                <Text variant="bodyStrong" style={styles.flex}>
                  {t.servingsLabel}
                </Text>
                <Stepper value={servings} min={1} max={20} onChange={setServings} accessibilityLabel={t.servingsLabel} />
              </View>
              <Field label={t.linesLabel}>
                <TextField value={lines} onChangeText={setLines} placeholder={t.linesPlaceholder} accessibilityLabel={t.linesLabel} multiline />
              </Field>
              <Field label={t.stepsLabel}>
                <TextField value={steps} onChangeText={setSteps} accessibilityLabel={t.stepsLabel} multiline />
              </Field>
              <Button label={t.next} disabled={!title.trim() || !lines.trim()} onPress={continueManual} />
            </>
          ) : (
            <>
              <Field label={t.urlLabel}>
                <TextField
                  icon="link"
                  value={url}
                  onChangeText={(value) => {
                    setUrl(value);
                    setProblem(null);
                  }}
                  placeholder={t.urlPlaceholder}
                  accessibilityLabel={t.urlLabel}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  returnKeyType="go"
                  onSubmitEditing={() => void fetchRecipe()}
                />
              </Field>
              <Button label={t.paste} variant="secondary" size="compact" icon={<Icon name="copy" size={18} />} onPress={() => void paste()} />
              <Button label={busy ? t.fetching : t.fetch} disabled={busy || !url.trim()} onPress={() => void fetchRecipe()} />
              {problem ? (
                <Card style={styles.problem}>
                  <Text variant="body" color="textMuted" accessibilityRole="alert">
                    {t[problem]}
                  </Text>
                  {problem === 'noRecipe' ? <Button label={t.manual} variant="secondary" onPress={() => setManual(true)} /> : null}
                </Card>
              ) : null}
              <Text variant="caption" color="textSubtle">
                {t.privacy}
              </Text>
              <Button label={t.manual} variant="ghost" size="compact" onPress={() => setManual(true)} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text variant="label" color="textSubtle">
        {label}
      </Text>
      {children}
    </View>
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
      gap: spacing.lg,
    },
    field: {
      gap: spacing.sm,
    },
    servings: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    problem: {
      gap: spacing.md,
      borderRadius: radii.lg,
    },
  }),
);
