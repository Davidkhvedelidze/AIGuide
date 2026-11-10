import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger/logger';
import type { ApiResult } from '@/lib/services/http';
import type { LandmarkCategory } from '@/types';
import type { NearbyLandmarkRpcRow, SupabaseNearbyLandmark } from '@/features/landmarks/types/supabase';

const DEFAULT_NEARBY_RADIUS_METERS = 700;
const LANDMARK_CATEGORIES = new Set<LandmarkCategory>([
  'historical',
  'church',
  'viewpoint',
  'museum',
  'food',
  'nature',
  'monument',
  'architecture',
  'park',
  'historic_site',
  'religious_site',
  'other',
]);

export interface NearbyLandmarksRequest {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isLandmarkCategory(value: string): value is LandmarkCategory {
  return LANDMARK_CATEGORIES.has(value as LandmarkCategory);
}

function isNearbyLandmarkRpcRow(value: NearbyLandmarkRpcRow): boolean {
  return (
    typeof value.id === 'string' &&
    typeof value.slug === 'string' &&
    typeof value.name === 'string' &&
    typeof value.city === 'string' &&
    typeof value.region === 'string' &&
    typeof value.country === 'string' &&
    typeof value.latitude === 'number' &&
    typeof value.longitude === 'number' &&
    typeof value.radius_meters === 'number' &&
    isLandmarkCategory(value.category) &&
    typeof value.short_description === 'string' &&
    typeof value.full_story === 'string' &&
    isStringArray(value.interesting_facts) &&
    typeof value.historical_context === 'string' &&
    typeof value.best_time_to_visit === 'string' &&
    typeof value.average_visit_duration === 'string' &&
    isStringArray(value.nearby_place_ids) &&
    isStringArray(value.recommended_next_place_ids) &&
    isStringArray(value.image_urls) &&
    isStringArray(value.reference_image_urls) &&
    isStringArray(value.languages) &&
    typeof value.created_at === 'string' &&
    typeof value.updated_at === 'string' &&
    typeof value.distance_meters === 'number'
  );
}

function mapNearbyLandmark(row: NearbyLandmarkRpcRow): SupabaseNearbyLandmark {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    city: row.city,
    region: row.region,
    country: row.country,
    latitude: row.latitude,
    longitude: row.longitude,
    radiusMeters: row.radius_meters,
    category: row.category,
    shortDescription: row.short_description,
    fullStory: row.full_story,
    interestingFacts: row.interesting_facts,
    historicalContext: row.historical_context,
    bestTimeToVisit: row.best_time_to_visit,
    averageVisitDuration: row.average_visit_duration,
    nearbyPlaceIds: row.nearby_place_ids,
    recommendedNextPlaceIds: row.recommended_next_place_ids,
    imageUrls: row.image_urls,
    referenceImageUrls: row.reference_image_urls,
    languages: row.languages,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    distanceMeters: row.distance_meters,
  };
}

export async function getNearbyLandmarks({
  latitude,
  longitude,
  radiusMeters = DEFAULT_NEARBY_RADIUS_METERS,
}: NearbyLandmarksRequest): Promise<ApiResult<SupabaseNearbyLandmark[]>> {
  try {
    const { data, error } = await supabase.rpc('get_nearby_landmarks', {
      input_lat: latitude,
      input_lng: longitude,
      radius_meters: radiusMeters,
    });

    if (error) {
      logger.warn('Supabase nearby landmarks request failed', { code: error.code, message: error.message });

      return {
        success: false,
        error: {
          code: error.code || 'SUPABASE_ERROR',
          message: 'We could not load nearby places. Please check your connection and try again.',
        },
      };
    }

    const rows = data ?? [];

    if (!rows.every(isNearbyLandmarkRpcRow)) {
      logger.error('Supabase nearby landmarks response failed validation');

      return {
        success: false,
        error: {
          code: 'INVALID_LANDMARK_RESPONSE',
          message: 'Nearby places are temporarily unavailable. Please try again.',
        },
      };
    }

    return {
      success: true,
      data: rows.map(mapNearbyLandmark).sort((first: SupabaseNearbyLandmark, second: SupabaseNearbyLandmark) => first.distanceMeters - second.distanceMeters),
    };
  } catch {
    logger.error('Supabase nearby landmarks request threw an exception');

    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'We could not load nearby places. Please check your connection and try again.',
      },
    };
  }
}
