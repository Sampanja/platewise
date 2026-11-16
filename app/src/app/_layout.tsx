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
import { useNotificationRouting, usePantryReminderSync } from '@/features/notifications/useNotificationRouting';
import { useWidgetSync } from '@/features/widget/useWidgetSync';
import { setHapticsEnabled } from '@/components/ui';
import { useHydrated, useKeepProposalSuitable, useLanguage, usePriceRegion, useUnitSystem } from '@/data/hooks';
import { usePlansStore } from '@/data/stores/plans';
import { useProfileStore } from '@/data/stores/profile';
import {
  activeFirstWeekday,
  activeLanguage,
  activePriceRegion,
  activeUnitSystem,
  setActiveLanguage,
  setActivePriceRegion,
  setActiveUnitSystem,
  setFirstWeekday,
} from '@/i18n/locale';
import { useDeviceLocale } from '@/lib/deviceLocale';
import { rescheduleReminders } from '@/services/reminders';
import { colors, DEFAULT_CHARACTER, isCharacterId, resolveTheme, setActiveTheme, themeKey } from '@/theme';


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
  usePantryReminderSync(hydrated);
  useKeepProposalSuitable();
  const hapticsEnabled = useProfileStore((s) => s.hapticsEnabled);
  useEffect(() => setHapticsEnabled(hapticsEnabled), [hapticsEnabled]);

  // Theme: the saved preference, or the phone's setting. It is activated during
  // render, before any child reads `colors`. Every screen must then re-render
  // with the new palette: the navigator is unmounted for one synchronous pass
  // and mounted again in a layout effect. A keyed remount would register two
  // navigators at once; this way the navigation container keeps its state and
  // the user stays on the same screen.
  const preference = useProfileStore((s) => s.themePreference);
  const mode = resolveTheme(preference, useColorScheme());
  const savedCharacter = useProfileStore((s) => s.characterId);
  const character = isCharacterId(savedCharacter) ? savedCharacter : DEFAULT_CHARACTER;
  // The theme is the character's palette in light or dark mode.
  const themeName = `${character}-${mode}`;
  if (themeKey() !== themeName) setActiveTheme(mode, character);
  // Prices and currency follow the price region; like the theme it is read at
  // render time, so a change remounts the screens the same way.
  const priceRegion = usePriceRegion();
  if (activePriceRegion() !== priceRegion) setActivePriceRegion(priceRegion);
  // Language, units and the first weekday work the same way: strings and
  // formatting read them at render time, and a change remounts the screens.
  const language = useLanguage();
  if (activeLanguage() !== language) setActiveLanguage(language);
  useWidgetSync(hydrated, language);
  const unitSystem = useUnitSystem();
  if (activeUnitSystem() !== unitSystem) setActiveUnitSystem(unitSystem);
  setFirstWeekday(useDeviceLocale().firstWeekday, priceRegion);
  const theme = `${themeName}|${priceRegion}|${language}|${unitSystem}|${activeFirstWeekday()}`;
  // Scheduled reminders keep the words they were made with: re-create them in the new language.
  const scheduledLanguage = useRef(language);
  useEffect(() => {
    if (!hydrated || scheduledLanguage.current === language) return;
    scheduledLanguage.current = language;
    rescheduleReminders();
  }, [language, hydrated]);
  // Saved budgets are amounts in a currency: move them to a new region with the same purchasing power.
  useEffect(() => {
    if (!hydrated) return;
    useProfileStore.getState().alignBudgetTo(priceRegion);
    usePlansStore.getState().alignAnswersTo(priceRegion);
  }, [priceRegion, hydrated]);
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
  useNotificationRouting(hydrated && Boolean(fontsLoaded || fontError) && mountedTheme === theme);
  const barStyle = mode === 'dark' ? 'light' : 'dark';

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
