import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import { mockLandmarks } from '@/features/landmarks/data/mockLandmarks';
import { getDistanceMeters } from '@/features/landmarks/utils/getDistanceMeters';
import type { GeoCoordinates, Landmark, LandmarkCategory } from '@/types';

export type NearbyCategoryFilter = 'all' | 'historical' | 'church' | 'viewpoint' | 'museum' | 'food' | 'nature';
export type NearbyLandmarksStatus = 'idle' | 'requesting-permission' | 'locating' | 'ready' | 'permission-denied' | 'error';

export interface NearbyLandmark extends Landmark {
  distanceMeters: number;
}

export interface CategoryFilterOption {
  label: string;
  value: NearbyCategoryFilter;
}

export interface UseNearbyLandmarksResult {
  status: NearbyLandmarksStatus;
  userLocation: GeoCoordinates | null;
  nearbyLandmarks: NearbyLandmark[];
  selectedCategory: NearbyCategoryFilter;
  categoryOptions: CategoryFilterOption[];
  isLoading: boolean;
  isPermissionDenied: boolean;
  errorMessage: string | null;
  setSelectedCategory: (category: NearbyCategoryFilter) => void;
  refreshLocation: () => Promise<void>;
}

const LOCATION_PERMISSION_DENIED_MESSAGE = 'Location permission is needed to show nearby places. You can enable it in device settings and refresh.';
const LOCATION_ERROR_MESSAGE = 'We could not get your current location. Please check location services and try again.';

export const nearbyCategoryOptions: CategoryFilterOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Historical', value: 'historical' },
  { label: 'Church', value: 'church' },
  { label: 'Viewpoint', value: 'viewpoint' },
  { label: 'Museum', value: 'museum' },
  { label: 'Food', value: 'food' },
  { label: 'Nature', value: 'nature' },
];

function isSupportedNearbyCategory(category: LandmarkCategory): category is Exclude<NearbyCategoryFilter, 'all'> {
  return nearbyCategoryOptions.some((option) => option.value === category);
}

export function useNearbyLandmarks(): UseNearbyLandmarksResult {
  const [status, setStatus] = useState<NearbyLandmarksStatus>('idle');
  const [userLocation, setUserLocation] = useState<GeoCoordinates | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<NearbyCategoryFilter>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshLocation = useCallback(async () => {
    setStatus('requesting-permission');
    setErrorMessage(null);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        setUserLocation(null);
        setStatus('permission-denied');
        setErrorMessage(LOCATION_PERMISSION_DENIED_MESSAGE);
        return;
      }

      setStatus('locating');
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      setStatus('ready');
    } catch {
      setUserLocation(null);
      setStatus('error');
      setErrorMessage(LOCATION_ERROR_MESSAGE);
    }
  }, []);

  useEffect(() => {
    void refreshLocation();
  }, [refreshLocation]);

  const nearbyLandmarks = useMemo(() => {
    if (!userLocation) {
      return [];
    }

    return mockLandmarks
      .filter((landmark) => selectedCategory === 'all' || (isSupportedNearbyCategory(landmark.category) && landmark.category === selectedCategory))
      .map((landmark) => ({
        ...landmark,
        distanceMeters: getDistanceMeters(userLocation, {
          latitude: landmark.latitude,
          longitude: landmark.longitude,
        }),
      }))
      .filter((landmark) => landmark.distanceMeters <= landmark.radiusMeters)
      .sort((first, second) => first.distanceMeters - second.distanceMeters);
  }, [selectedCategory, userLocation]);

  return {
    status,
    userLocation,
    nearbyLandmarks,
    selectedCategory,
    categoryOptions: nearbyCategoryOptions,
    isLoading: status === 'requesting-permission' || status === 'locating' || status === 'idle',
    isPermissionDenied: status === 'permission-denied',
    errorMessage,
    setSelectedCategory,
    refreshLocation,
  };
}
