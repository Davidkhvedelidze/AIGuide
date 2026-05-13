import { Text, View } from 'react-native';
import { ScreenContainer } from '@/components/layout';
import { AppButton, AppCard, ErrorState, LoadingState } from '@/components/ui';
import { CategoryFilter } from '@/features/landmarks/components/CategoryFilter';
import { LandmarkCard } from '@/features/landmarks/components/LandmarkCard';
import { useNearbyLandmarks } from '@/features/landmarks/hooks/useNearbyLandmarks';

function EmptyNearbyState() {
  return (
    <AppCard className="items-start">
      <Text className="text-lg font-semibold text-slate-950">No nearby places found</Text>
      <Text className="mt-2 text-sm leading-6 text-slate-600">
        We checked the local Tbilisi Old Town mock data, but none of the landmarks are within their nearby radius for your current location or selected category.
      </Text>
    </AppCard>
  );
}

export default function NearbyScreen() {
  const {
    nearbyLandmarks,
    selectedCategory,
    categoryOptions,
    isLoading,
    isPermissionDenied,
    errorMessage,
    setSelectedCategory,
    refreshLocation,
  } = useNearbyLandmarks();

  const hasResults = nearbyLandmarks.length > 0;

  return (
    <ScreenContainer>
      <View className="gap-6">
        <View>
          <Text className="text-sm font-semibold uppercase tracking-[3px] text-brand-700">Local discovery</Text>
          <Text className="mt-3 text-3xl font-bold text-slate-950">Places near me</Text>
          <Text className="mt-3 text-base leading-7 text-slate-600">
            Explore nearby Tbilisi Old Town landmarks using local mock data. Supabase and AI integrations are not connected yet.
          </Text>
        </View>

        <CategoryFilter options={categoryOptions} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

        {isLoading ? (
          <LoadingState title="Finding your location" message="We’re requesting foreground location access and checking nearby mock landmarks." />
        ) : null}

        {!isLoading && isPermissionDenied ? (
          <ErrorState
            actionLabel="Refresh location"
            message={errorMessage ?? 'Location permission is needed to show nearby places.'}
            onAction={refreshLocation}
            title="Location permission denied"
          />
        ) : null}

        {!isLoading && !isPermissionDenied && errorMessage ? (
          <ErrorState actionLabel="Refresh location" message={errorMessage} onAction={refreshLocation} title="Location unavailable" />
        ) : null}

        {!isLoading && !isPermissionDenied && !errorMessage ? (
          <View className="gap-4">
            {hasResults ? nearbyLandmarks.map((landmark) => <LandmarkCard key={landmark.id} landmark={landmark} />) : <EmptyNearbyState />}
          </View>
        ) : null}

        <AppButton isLoading={isLoading} onPress={refreshLocation} title="Refresh location" variant="secondary" />
      </View>
    </ScreenContainer>
  );
}
