export type LandmarkCategory =
  | 'historical'
  | 'church'
  | 'viewpoint'
  | 'museum'
  | 'food'
  | 'nature'
  | 'monument'
  | 'architecture'
  | 'park'
  | 'historic_site'
  | 'religious_site'
  | 'other';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface LandmarkTranslation {
  locale: string;
  name: string;
  description: string;
  shortDescription?: string;
  sourceAttribution?: string;
  updatedAt: string;
}

export interface Landmark {
  id: string;
  slug: string;
  name: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  category: LandmarkCategory;
  shortDescription: string;
  fullStory: string;
  interestingFacts: string[];
  historicalContext: string;
  bestTimeToVisit: string;
  averageVisitDuration: string;
  nearbyPlaceIds: string[];
  recommendedNextPlaceIds: string[];
  imageUrls: string[];
  referenceImageUrls: string[];
  languages: string[];
  createdAt: string;
  updatedAt: string;
  canonicalName?: string;
  coordinates?: GeoCoordinates;
  countryCode?: string;
  confidenceScore?: number;
  imageUrl?: string;
  translations?: LandmarkTranslation[];
}
