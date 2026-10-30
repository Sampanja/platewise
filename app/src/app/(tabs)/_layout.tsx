import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/TabBar';
import { strings } from '@/i18n';
import { colors } from '@/theme';

const t = strings.tabs;

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t.home }} />
      <Tabs.Screen name="recipes" options={{ title: t.recipes }} />
      <Tabs.Screen name="plan" options={{ title: t.plan }} />
      <Tabs.Screen name="diary" options={{ title: t.diary }} />
      <Tabs.Screen name="profile" options={{ title: t.profile }} />
    </Tabs>
  );
}
