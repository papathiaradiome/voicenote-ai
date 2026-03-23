import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useUiStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import '../i18n';
import '../global.css'; // NativeWind v4
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const { theme } = useUiStore();
  const { initialize, isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
  const [isOnboardingDone, setIsOnboardingDone] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initialize();
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const value = await AsyncStorage.getItem('@onboarding_complete');
      setIsOnboardingDone(value === 'true');
    } catch (e) {
      setIsOnboardingDone(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading || isOnboardingDone === null) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    
    if (!isOnboardingDone && segments[0] !== 'onboarding') {
      router.replace('/onboarding');
    } else if (isOnboardingDone && !isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isOnboardingDone && isAuthenticated && !inTabsGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isOnboardingDone, isAuthLoading, segments]);

  if (isAuthLoading || isOnboardingDone === null) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
