export type Locale = 'en' | 'ka';
export const LOCALES: Locale[] = ['en', 'ka'];

export type PlaceCategory = 'landmark' | 'church' | 'museum' | 'hidden_gem';

/** One checkable statement about a place, with the page it came from. */
export interface Fact {
  text: string;
  source: string;
}

export interface PlaceContent {
  name: string;
  /** One or two sentences shown under the title. */
  summary: string;
  /** Narration script: 2-3 minutes when read aloud. Built only from `facts`. */
  story: string;
  highlights: string[];
}

export interface Place {
  id: string;
  slug: string;
  lat: number;
  lng: number;
  category: PlaceCategory;
  /** Human readable origin period, e.g. "4th century". Must agree with the facts. */
  period: string;
  /** Only verified places are shown in production. */
  verified: boolean;
  /** Real photo only (never AI generated). Null until the import script adds one. */
  photoUrl: string | null;
  photoCredit: string | null;
  audioUrl: Partial<Record<Locale, string>>;
  content: Record<Locale, PlaceContent>;
  facts: Fact[];
}

export interface Coords {
  lat: number;
  lng: number;
}

export type ScanResult =
  | { status: 'recognized'; placeId: string; confidence: number }
  | { status: 'candidates'; placeIds: string[] }
  | { status: 'not_recognized'; nearbyIds: string[] }
  | { status: 'limit_reached'; limit: number };

export interface ScanRequest {
  /** JPEG, longest side <= 1024px, base64 without the data: prefix. */
  imageBase64: string;
  coords: Coords | null;
  locale: Locale;
}

export interface HistoryEntry {
  id: string;
  placeId: string;
  kind: 'scan' | 'listen';
  at: string;
}

export interface Collection {
  id: string;
  name: string;
  placeIds: string[];
  createdAt: string;
}
