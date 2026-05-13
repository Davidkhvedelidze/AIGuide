import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/lib/theme/tokens';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'AI Guide' }} />
        <Stack.Screen name="camera-scan" options={{ title: 'Scan' }} />
        <Stack.Screen name="result" options={{ title: 'Your Guide' }} />
      </Stack>
    </>
  );
}
