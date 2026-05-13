import '@/styles/global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout(): JSX.Element {
  return (
    <>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#F8FAFC' },
          headerTitleStyle: { color: '#0F172A', fontWeight: '700' },
          contentStyle: { backgroundColor: '#F8FAFC' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ title: 'Welcome' }} />
        <Stack.Screen name="camera-scan" options={{ title: 'Scan Landmark' }} />
        <Stack.Screen name="result" options={{ title: 'Scan Result' }} />
        <Stack.Screen name="nearby" options={{ title: 'Nearby' }} />
        <Stack.Screen name="ask-guide" options={{ title: 'Ask Guide' }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
