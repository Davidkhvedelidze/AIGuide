import type { GeoCoordinates } from '@/types';

export interface NearbySearchParams {
  coordinates: GeoCoordinates;
  radiusMeters: number;
}
