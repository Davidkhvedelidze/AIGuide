import { useCallback, useState } from 'react';
import * as Location from 'expo-location';

import type { GeoCoordinates } from '@/features/guide/types/AiGuideResult';

type LocationStatus = 'idle' | 'requesting-permission' | 'fetching-location' | 'ready' | 'denied' | 'error';

interface UseCurrentLocationResult {
  coordinates: GeoCoordinates | null;
  status: LocationStatus;
  errorMessage: string | null;
  isLoadingLocation: boolean;
  isLocationPermissionDenied: boolean;
  requestCurrentLocation: () => Promise<GeoCoordinates | null>;
  resetLocationError: () => void;
}

const LOCATION_ERROR_MESSAGE = 'We could not get your current location. Check location services and try again.';

export function useCurrentLocation(): UseCurrentLocationResult {
  const [coordinates, setCoordinates] = useState<GeoCoordinates | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetLocationError = useCallback(() => {
    setErrorMessage(null);
    setStatus((currentStatus) => (currentStatus === 'error' ? 'idle' : currentStatus));
  }, []);

  const requestCurrentLocation = useCallback(async () => {
    setErrorMessage(null);
    setStatus('requesting-permission');

    const permission = await Location.requestForegroundPermissionsAsync();

    if (!permission.granted) {
      setStatus('denied');
      setCoordinates(null);
      return null;
    }

    try {
      setStatus('fetching-location');
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const nextCoordinates = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setCoordinates(nextCoordinates);
      setStatus('ready');
      return nextCoordinates;
    } catch {
      setCoordinates(null);
      setErrorMessage(LOCATION_ERROR_MESSAGE);
      setStatus('error');
      return null;
    }
  }, []);

  return {
    coordinates,
    status,
    errorMessage,
    isLoadingLocation: status === 'requesting-permission' || status === 'fetching-location',
    isLocationPermissionDenied: status === 'denied',
    requestCurrentLocation,
    resetLocationError,
  };
}
