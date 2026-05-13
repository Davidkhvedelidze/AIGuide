export type LandmarkCategory = 'monument' | 'museum' | 'architecture' | 'park' | 'historic_site' | 'religious_site' | 'other';

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
  canonicalName: string;
  category: LandmarkCategory;
  coordinates: GeoCoordinates;
  countryCode: string;
  city?: string;
  confidenceScore?: number;
  imageUrl?: string;
  translations: LandmarkTranslation[];
  createdAt: string;
  updatedAt: string;
}
