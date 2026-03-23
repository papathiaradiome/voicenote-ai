import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useUiStore } from '../stores/uiStore';
import '../i18n';
import '../global.css'; // NativeWind v4
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const { theme } = useUiStore();
  
  // Simulation de chargement initial
  const isReady = true; 

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
