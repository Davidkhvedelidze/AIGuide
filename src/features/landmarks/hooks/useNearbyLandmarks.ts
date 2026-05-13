import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import { getNearbyLandmarks } from '@/features/landmarks/api/landmarkApi';
import type { GeoCoordinates, LandmarkCategory } from '@/types';
import type { SupabaseNearbyLandmark } from '@/features/landmarks/types/supabase';

export type NearbyCategoryFilter = 'all' | 'historical' | 'church' | 'viewpoint' | 'museum' | 'food' | 'nature';
export type NearbyLandmarksStatus = 'idle' | 'requesting-permission' | 'locating' | 'loading-landmarks' | 'ready' | 'permission-denied' | 'error';

export type NearbyLandmark = SupabaseNearbyLandmark;

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
  const [landmarks, setLandmarks] = useState<NearbyLandmark[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<NearbyCategoryFilter>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshLocation = useCallback(async () => {
    setStatus('requesting-permission');
    setErrorMessage(null);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        setUserLocation(null);
        setLandmarks([]);
        setStatus('permission-denied');
        setErrorMessage(LOCATION_PERMISSION_DENIED_MESSAGE);
        return;
      }

      setStatus('locating');
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const nextUserLocation: GeoCoordinates = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setUserLocation(nextUserLocation);
      setStatus('loading-landmarks');

      const result = await getNearbyLandmarks(nextUserLocation);

      if (!result.success) {
        setLandmarks([]);
        setStatus('error');
        setErrorMessage(result.error.message);
        return;
      }

      setLandmarks(result.data);
      setStatus('ready');
    } catch {
      setUserLocation(null);
      setLandmarks([]);
      setStatus('error');
      setErrorMessage(LOCATION_ERROR_MESSAGE);
    }
  }, []);

  useEffect(() => {
    void refreshLocation();
  }, [refreshLocation]);

  const nearbyLandmarks = useMemo(() => {
    return landmarks.filter(
      (landmark: NearbyLandmark) => selectedCategory === 'all' || (isSupportedNearbyCategory(landmark.category) && landmark.category === selectedCategory),
    );
  }, [landmarks, selectedCategory]);

  return {
    status,
    userLocation,
    nearbyLandmarks,
    selectedCategory,
    categoryOptions: nearbyCategoryOptions,
    isLoading: status === 'requesting-permission' || status === 'locating' || status === 'loading-landmarks' || status === 'idle',
    isPermissionDenied: status === 'permission-denied',
    errorMessage,
    setSelectedCategory,
    refreshLocation,
  };
}
