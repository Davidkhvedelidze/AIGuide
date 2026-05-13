import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ROUTES } from '@/lib/constants/routes';

const onboardingItems = [
  'Scan monuments and museums with your camera.',
  'Use location only after permission is granted.',
  'Ask follow-up questions answered by a secure backend service.',
] as const;

export default function OnboardingScreen(): JSX.Element {
  return (
    <ScreenContainer>
      <View className="gap-3">
        <Text className="text-3xl font-bold text-slate-950">A guide that respects your privacy.</Text>
        <Text className="text-base leading-6 text-slate-600">
          AI Tour Guide is structured so sensitive credentials stay outside the mobile app and user permissions are explicit.
        </Text>
      </View>

      <AppCard className="gap-4">
        {onboardingItems.map((item, index) => (
          <View key={item} className="flex-row gap-3">
            <View className="h-7 w-7 items-center justify-center rounded-full bg-brand-100">
              <Text className="font-semibold text-brand-700">{index + 1}</Text>
            </View>
            <Text className="flex-1 text-base leading-6 text-slate-700">{item}</Text>
          </View>
        ))}
      </AppCard>

      <AppButton title="Continue" onPress={() => router.replace(ROUTES.home)} />
    </ScreenContainer>
  );
}
