import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { ScreenContainer } from '@/components/layout';
import { AppButton, AppCard } from '@/components/ui';
import { copy } from '@/lib/constants/theme';

const steps = [
  'Scan landmarks using Expo Camera only after permission is granted.',
  'Use location to suggest nearby cultural sites when you opt in.',
  'Route AI requests through your backend so provider keys never ship in the app.',
] as const;

export default function OnboardingScreen() {
  return (
    <ScreenContainer>
      <Text className="text-3xl font-bold text-slate-950">A secure guide for every stop</Text>
      <Text className="mt-3 text-base leading-7 text-slate-600">{copy.noSecretsNotice}</Text>

      <View className="mt-6 gap-4">
        {steps.map((step, index) => (
          <AppCard key={step}>
            <Text className="text-sm font-semibold text-brand-700">Step {index + 1}</Text>
            <Text className="mt-2 text-base leading-6 text-slate-800">{step}</Text>
          </AppCard>
        ))}
      </View>

      <Link asChild href="/camera-scan">
        <AppButton className="mt-8" title="Start scanning" />
      </Link>
    </ScreenContainer>
  );
}
