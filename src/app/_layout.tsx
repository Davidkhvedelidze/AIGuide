import '@/styles/global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#f8fafc' },
          headerTitleStyle: { color: '#0f172a', fontWeight: '700' },
          contentStyle: { backgroundColor: '#f8fafc' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ title: 'Get started' }} />
        <Stack.Screen name="camera-scan" options={{ title: 'Scan landmark' }} />
        <Stack.Screen name="result" options={{ title: 'Guide result' }} />
        <Stack.Screen name="nearby" options={{ title: 'Nearby' }} />
        <Stack.Screen name="ask-guide" options={{ title: 'Ask guide' }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
