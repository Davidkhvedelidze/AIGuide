import { Text, View } from 'react-native';
import { AppCard } from '@/components/ui';
import { formatDistance } from '@/features/landmarks/utils/getDistanceMeters';
import type { NearbyLandmark } from '@/features/landmarks/hooks/useNearbyLandmarks';

interface LandmarkCardProps {
  landmark: NearbyLandmark;
}

function formatCategory(category: string): string {
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function LandmarkCard({ landmark }: LandmarkCardProps) {
  return (
    <AppCard accessibilityLabel={`${landmark.name}, ${formatDistance(landmark.distanceMeters)} away`} className="gap-3">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-xl font-bold text-slate-950">{landmark.name}</Text>
          <Text className="mt-1 text-xs font-semibold uppercase tracking-[2px] text-brand-700">{formatCategory(landmark.category)}</Text>
        </View>
        <View className="rounded-full bg-brand-50 px-3 py-2">
          <Text className="text-sm font-bold text-brand-700">{formatDistance(landmark.distanceMeters)}</Text>
        </View>
      </View>

      <Text className="text-sm leading-6 text-slate-600">{landmark.shortDescription}</Text>

      <View className="rounded-2xl bg-slate-50 p-3">
        <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-slate-500">Best time to visit</Text>
        <Text className="mt-1 text-sm font-medium leading-5 text-slate-800">{landmark.bestTimeToVisit}</Text>
      </View>
    </AppCard>
  );
}
