import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTabBarSpace } from '@/components/TabBar';

import { Chip, EmptyState, FadeInView, Text, type IconName } from '@/components/ui';
import { strings } from '@/i18n';
import { colors, spacing } from '@/theme';

type Props = {
  title: string;
  body: string;
  icon: IconName;
};

/** Temporary screen for tabs that are built in a later part of the UI phase. */
export function PlaceholderScreen({ title, body, icon }: Props) {
  const tabBarSpace = useTabBarSpace();
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}>
        <Text variant="displayLarge" accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        <FadeInView style={styles.body}>
          <View style={styles.chip}>
            <Chip tone="accent" label={strings.common.comingSoon} />
          </View>
          <EmptyState icon={icon} title={title} body={body} />
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  title: {
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.sm,
  },
  body: {
    paddingTop: spacing.xxl,
  },
  chip: {
    alignItems: 'center',
  },
});
