import type { GeoCoordinates } from '@/types';

const EARTH_RADIUS_METERS = 6_371_000;
const METERS_IN_KILOMETER = 1000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function getDistanceMeters(from: GeoCoordinates, to: GeoCoordinates): number {
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 + Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return Math.round(EARTH_RADIUS_METERS * centralAngle);
}

export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < METERS_IN_KILOMETER) {
    return `${Math.round(distanceMeters)} m`;
  }

  return `${(distanceMeters / METERS_IN_KILOMETER).toFixed(1)} km`;
}
