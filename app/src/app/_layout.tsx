import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { NavigationBar } from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { ToastHost } from '@/components/Toast';
import { setHapticsEnabled } from '@/components/ui';
import { useHydrated } from '@/data/hooks';
import { useProfileStore } from '@/data/stores/profile';
import { colors } from '@/theme';

export default function RootLayout() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } }),
  );
  const [fontsLoaded, fontError] = useFonts({
    DMSerifDisplay_400Regular,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });
  const hydrated = useHydrated();
  const hapticsEnabled = useProfileStore((s) => s.hapticsEnabled);
  useEffect(() => setHapticsEnabled(hapticsEnabled), [hapticsEnabled]);

  // Keep the dark background while fonts and saved data load; fall back to system fonts on error.
  if ((!fontsLoaded && !fontError) || !hydrated) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="generating" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="questionnaire" options={{ gestureEnabled: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false, animation: 'fade' }} />
      </Stack>
      <ToastHost />
      <StatusBar style="light" />
      {/*
        Android: hide the system navigation bar immersively. It reappears briefly
        with a swipe up from the bottom edge. No-op on iOS, whose home indicator
        apps cannot hide.
      */}
      <NavigationBar hidden style="light" />
    </QueryClientProvider>
  );
}
