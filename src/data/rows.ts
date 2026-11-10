// Database row shapes and their mapping to app types. No React Native imports here,
// so Node scripts can use it too.
import type { Fact, Locale, Place, PlaceCategory, PlaceContent } from './types';

interface TranslationRow {
  locale: Locale;
  name: string;
  summary: string;
  story: string;
  highlights: string[] | null;
  audio_url: string | null;
}

export interface PlaceRow {
  id: string;
  slug: string;
  lat: number;
  lng: number;
  category: PlaceCategory;
  period: string;
  verified: boolean;
  photo_url: string | null;
  photo_credit: string | null;
  facts: Fact[] | null;
  place_translations: TranslationRow[];
}

const EMPTY: PlaceContent = { name: '', summary: '', story: '', highlights: [] };

export function rowToPlace(row: PlaceRow): Place {
  const content: Record<Locale, PlaceContent> = { en: EMPTY, ka: EMPTY };
  const audioUrl: Place['audioUrl'] = {};
  for (const t of row.place_translations) {
    content[t.locale] = { name: t.name, summary: t.summary, story: t.story, highlights: t.highlights ?? [] };
    if (t.audio_url) audioUrl[t.locale] = t.audio_url;
  }
  // A missing translation falls back to English rather than showing an empty screen.
  if (!content.ka.name) content.ka = content.en;
  return {
    id: row.id,
    slug: row.slug,
    lat: row.lat,
    lng: row.lng,
    category: row.category,
    period: row.period,
    verified: row.verified,
    photoUrl: row.photo_url,
    photoCredit: row.photo_credit,
    audioUrl,
    content,
    facts: row.facts ?? [],
  };
}
