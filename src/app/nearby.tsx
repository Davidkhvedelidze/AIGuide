import { Text, View } from 'react-native';
import { ScreenContainer } from '@/components/layout';
import { AppButton, AppCard, LoadingState } from '@/components/ui';

const nearbyPlaceholders = ['Historic district', 'Museum quarter', 'Public monument'] as const;

export default function NearbyScreen() {
  return (
    <ScreenContainer>
      <Text className="text-3xl font-bold text-slate-950">Nearby landmarks</Text>
      <Text className="mt-3 text-base leading-7 text-slate-600">Location services are isolated in the location feature module for safe permission handling.</Text>

      <View className="mt-6 gap-4">
        <LoadingState title="Location-ready scaffold" message="Connect Expo Location in a feature hook, then render verified nearby landmarks here." />
        {nearbyPlaceholders.map((place) => (
          <AppCard key={place}>
            <Text className="text-lg font-semibold text-slate-950">{place}</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-600">Placeholder card ready for distance, category, and trust metadata.</Text>
          </AppCard>
        ))}
      </View>

      <AppButton className="mt-6" title="Refresh nearby places" variant="secondary" />
    </ScreenContainer>
  );
}
