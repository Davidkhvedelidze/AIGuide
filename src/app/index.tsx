import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ROUTES } from '@/lib/constants/routes';

export default function HomeScreen(): JSX.Element {
  return (
    <ScreenContainer>
      <View className="gap-3 pt-6">
        <Text className="text-sm font-semibold uppercase tracking-widest text-brand-700">AI Tour Guide</Text>
        <Text className="text-4xl font-bold leading-tight text-slate-950">Discover places with trustworthy AI guidance.</Text>
        <Text className="text-base leading-6 text-slate-600">
          Scan landmarks, explore nearby highlights, and ask contextual travel questions through a secure backend-powered AI guide.
        </Text>
      </View>

      <AppCard className="gap-4">
        <Text className="text-xl font-semibold text-slate-950">Start exploring</Text>
        <Text className="text-sm leading-5 text-slate-600">
          Your mobile app never stores AI provider secrets. Private AI requests should be proxied through your backend.
        </Text>
        <AppButton title="Scan a landmark" onPress={() => router.push(ROUTES.cameraScan)} />
        <AppButton title="View nearby places" variant="secondary" onPress={() => router.push(ROUTES.nearby)} />
      </AppCard>

      <AppButton title="See onboarding" variant="ghost" onPress={() => router.push(ROUTES.onboarding)} />
    </ScreenContainer>
  );
}
