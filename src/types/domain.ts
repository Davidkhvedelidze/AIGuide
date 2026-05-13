export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface LandmarkTranslation {
  locale: string;
  name: string;
  summary: string;
  historicalContext?: string;
  accessibilityNotes?: string;
}

export interface Landmark {
  id: string;
  name: string;
  description: string;
  coordinates: GeoCoordinates;
  countryCode: string;
  category: 'architecture' | 'museum' | 'monument' | 'nature' | 'religious' | 'other';
  imageUrl?: string;
  translations: LandmarkTranslation[];
  confidence: ConfidenceLevel;
  sourceIds: string[];
  updatedAt: string;
}

export interface ScanHistory {
  id: string;
  landmarkId?: string;
  capturedImageUri?: string;
  scannedAt: string;
  coordinates?: GeoCoordinates;
  resultConfidence: ConfidenceLevel;
}

export interface AiGuideResult {
  id: string;
  landmarkId: string;
  answer: string;
  locale: string;
  confidence: ConfidenceLevel;
  citations: Array<{
    title: string;
    url?: string;
    sourceId: string;
  }>;
  generatedAt: string;
}
