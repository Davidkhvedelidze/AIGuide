import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import { api } from './api';
import type { Coords, Place } from './types';

export function usePlaces() {
  return useQuery({ queryKey: ['places'], queryFn: () => api.listPlaces(), staleTime: 1000 * 60 * 30 });
}

export function usePlace(id: string | undefined) {
  const query = usePlaces();
  const place: Place | undefined = query.data?.find((p) => p.id === id);
  return { ...query, place };
}

/**
 * Current position if the user has already granted location access.
 * It never prompts on its own; call `request()` from a button or the onboarding step.
 */
export function useCoords() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [granted, setGranted] = useState<boolean | null>(null);

  const read = useCallback(async () => {
    try {
      const last = await Location.getLastKnownPositionAsync();
      const pos = last ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } catch {
      setCoords(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Location.getForegroundPermissionsAsync()
      .then((perm) => {
        if (cancelled) return;
        setGranted(perm.granted);
        if (perm.granted) void read();
      })
      .catch(() => setGranted(false));
    return () => {
      cancelled = true;
    };
  }, [read]);

  const request = useCallback(async () => {
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      setGranted(perm.granted);
      if (perm.granted) await read();
      return perm.granted;
    } catch {
      setGranted(false);
      return false;
    }
  }, [read]);

  return { coords, granted, request };
}
