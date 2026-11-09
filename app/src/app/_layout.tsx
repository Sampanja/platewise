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
import { Stack, useNavigationContainerRef } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useColorScheme, View } from 'react-native';

import { ToastHost } from '@/components/Toast';
import { CelebrationHost } from '@/features/game/CelebrationHost';
import { setHapticsEnabled } from '@/components/ui';
import { useHydrated } from '@/data/hooks';
import { useProfileStore } from '@/data/stores/profile';
import { activeTheme, colors, resolveTheme, setActiveTheme } from '@/theme';


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

  // Theme: the saved preference, or the phone's setting. It is activated during
  // render, before any child reads `colors`. Every screen must then re-render
  // with the new palette: the navigator is unmounted for one synchronous pass
  // and mounted again in a layout effect. A keyed remount would register two
  // navigators at once; this way the navigation container keeps its state and
  // the user stays on the same screen.
  const preference = useProfileStore((s) => s.themePreference);
  const theme = resolveTheme(preference, useColorScheme());
  if (activeTheme() !== theme) setActiveTheme(theme);
  const [mountedTheme, setMountedTheme] = useState(theme);
  const navigation = useNavigationContainerRef();
  const savedNavigation = useRef<ReturnType<typeof navigation.getRootState> | null>(null);
  useEffect(() => {
    const saved = savedNavigation.current;
    if (!saved) return;
    savedNavigation.current = null;
    const frame = requestAnimationFrame(() => {
      // A complete snapshot of the container's own state: the remounted navigators adopt it.
      if (navigation.isReady()) navigation.reset(saved);
    });
    return () => cancelAnimationFrame(frame);
  }, [mountedTheme, navigation]);
  useLayoutEffect(() => {
    if (mountedTheme === theme) return;
    // The navigator was just unmounted, but the container still holds its state
    // (navigators clear it only after a timeout): remember where the user was.
    if (navigation.isReady()) savedNavigation.current = navigation.getRootState();
    // Intentional second pass: mount the navigator again with the new theme.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMountedTheme(theme);
  }, [mountedTheme, theme, navigation]);
  const barStyle = theme === 'dark' ? 'light' : 'dark';

  // Keep the dark background while fonts and saved data load; fall back to system fonts on error.
  if ((!fontsLoaded && !fontError) || !hydrated) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {mountedTheme === theme ? (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="generating" options={{ gestureEnabled: false, animation: 'fade' }} />
          <Stack.Screen name="questionnaire" options={{ gestureEnabled: false, animation: 'slide_from_bottom' }} />
          <Stack.Screen name="onboarding" options={{ gestureEnabled: false, animation: 'fade' }} />
        </Stack>
      ) : (
        <View style={{ flex: 1, backgroundColor: colors.bg }} />
      )}
      <ToastHost key={theme} />
      {mountedTheme === theme ? <CelebrationHost /> : null}
      <StatusBar style={barStyle} />
      {/*
        Android: hide the system navigation bar immersively. It reappears briefly
        with a swipe up from the bottom edge. No-op on iOS, whose home indicator
        apps cannot hide.
      */}
      <NavigationBar hidden style={barStyle} />
    </QueryClientProvider>
  );
}
