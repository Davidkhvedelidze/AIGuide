import type { Landmark, LandmarkCategory } from '@/types';

export interface SupabaseLandmarkRow {
  id: string;
  slug: string;
  name: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  category: LandmarkCategory;
  short_description: string;
  full_story: string;
  interesting_facts: string[];
  historical_context: string;
  best_time_to_visit: string;
  average_visit_duration: string;
  nearby_place_ids: string[];
  recommended_next_place_ids: string[];
  image_urls: string[];
  reference_image_urls: string[];
  languages: string[];
  created_at: string;
  updated_at: string;
}

export interface NearbyLandmarkRpcRow extends SupabaseLandmarkRow {
  distance_meters: number;
}

export interface NearbyLandmarkRpcParams {
  input_lat: number;
  input_lng: number;
  radius_meters?: number;
}

export interface SupabaseNearbyLandmark extends Landmark {
  distanceMeters: number;
}

export interface SupabaseDatabase {
  public: {
    Tables: {
      landmarks: {
        Row: SupabaseLandmarkRow;
        Insert: Omit<SupabaseLandmarkRow, 'created_at' | 'updated_at'> & Partial<Pick<SupabaseLandmarkRow, 'created_at' | 'updated_at'>>;
        Update: Partial<SupabaseLandmarkRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_nearby_landmarks: {
        Args: NearbyLandmarkRpcParams;
        Returns: NearbyLandmarkRpcRow[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
