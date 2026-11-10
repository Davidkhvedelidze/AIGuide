import { haversineMeters } from '../../supabase/functions/_shared/decision';
import type { Coords, Place } from '@/data/types';

export { haversineMeters };

/** Tbilisi old town; used when the user has not shared a location. */
export const TBILISI_CENTER: Coords = { lat: 41.6925, lng: 44.8075 };

export interface PlaceWithDistance {
  place: Place;
  meters: number;
}

export function sortByDistance(places: Place[], from: Coords): PlaceWithDistance[] {
  return places
    .map((place) => ({ place, meters: haversineMeters(from, place) }))
    .sort((a, b) => a.meters - b.meters);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Rough walking time at 4.5 km/h, never below one minute. */
export function walkingMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / 75));
}

export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
