import { Text, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { nearbyLandmarks } from '@/features/landmarks/services/sampleLandmarks';

export default function NearbyScreen(): JSX.Element {
  return (
    <ScreenContainer>
      <View className="gap-2">
        <Text className="text-3xl font-bold text-slate-950">Nearby landmarks</Text>
        <Text className="text-base leading-6 text-slate-600">
          Location-aware discovery will use Expo Location after explicit permission from the user.
        </Text>
      </View>

      {nearbyLandmarks.map((landmark) => (
        <AppCard key={landmark.id} className="gap-2">
          <Text className="text-lg font-semibold text-slate-950">{landmark.name}</Text>
          <Text className="text-sm leading-5 text-slate-600">{landmark.description}</Text>
          <Text className="text-xs font-semibold uppercase tracking-wide text-brand-700">{landmark.category}</Text>
        </AppCard>
      ))}

      <LoadingState title="Location service ready" description="Wire this state to real nearby landmark loading once the backend endpoint exists." />
    </ScreenContainer>
  );
}
