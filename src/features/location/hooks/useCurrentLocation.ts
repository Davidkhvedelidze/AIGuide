import { useCallback, useState } from 'react';
import * as Location from 'expo-location';
import type { GeoCoordinates } from '@/types';

export type CurrentLocationStatus = 'idle' | 'requesting-permission' | 'locating' | 'granted' | 'denied' | 'error';

export interface UseCurrentLocationResult {
  status: CurrentLocationStatus;
  coordinates: GeoCoordinates | null;
  errorMessage: string | null;
  isLoading: boolean;
  isDenied: boolean;
  getCurrentLocation: () => Promise<GeoCoordinates | null>;
}

const LOCATION_PERMISSION_DENIED_MESSAGE = 'Location access is required to attach latitude and longitude to this scan.';
const LOCATION_UNAVAILABLE_MESSAGE = 'We could not find your current location. Please check location services and try again.';

export function useCurrentLocation(): UseCurrentLocationResult {
  const [status, setStatus] = useState<CurrentLocationStatus>('idle');
  const [coordinates, setCoordinates] = useState<GeoCoordinates | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async () => {
    setStatus('requesting-permission');
    setErrorMessage(null);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        setCoordinates(null);
        setStatus('denied');
        setErrorMessage(LOCATION_PERMISSION_DENIED_MESSAGE);
        return null;
      }

      setStatus('locating');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const nextCoordinates: GeoCoordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCoordinates(nextCoordinates);
      setStatus('granted');
      return nextCoordinates;
    } catch {
      setCoordinates(null);
      setStatus('error');
      setErrorMessage(LOCATION_UNAVAILABLE_MESSAGE);
      return null;
    }
  }, []);

  return {
    status,
    coordinates,
    errorMessage,
    isLoading: status === 'requesting-permission' || status === 'locating',
    isDenied: status === 'denied',
    getCurrentLocation,
  };
}
