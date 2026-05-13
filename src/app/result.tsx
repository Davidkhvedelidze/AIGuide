import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { featuredLandmark } from '@/features/landmarks/services/sampleLandmarks';
import { ROUTES } from '@/lib/constants/routes';

export default function ResultScreen(): JSX.Element {
  return (
    <ScreenContainer>
      <View className="gap-2">
        <Text className="text-sm font-semibold uppercase tracking-widest text-brand-700">High confidence match</Text>
        <Text className="text-3xl font-bold text-slate-950">{featuredLandmark.name}</Text>
        <Text className="text-base leading-6 text-slate-600">{featuredLandmark.description}</Text>
      </View>

      <AppCard className="gap-3">
        <Text className="text-lg font-semibold text-slate-950">Why it matters</Text>
        <Text className="text-sm leading-6 text-slate-600">
          {featuredLandmark.translations[0]?.historicalContext ?? 'Historical context will appear after backend enrichment.'}
        </Text>
      </AppCard>

      <AppButton title="Ask the AI guide" onPress={() => router.push(ROUTES.askGuide)} />
      <AppButton title="Find nearby landmarks" variant="secondary" onPress={() => router.push(ROUTES.nearby)} />
    </ScreenContainer>
  );
}
