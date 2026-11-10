import { LOCALES, type Place } from '@/data/types';

export interface Issue {
  placeId: string;
  severity: 'error' | 'warning';
  message: string;
}

const CENTURY = /(\d{1,2})(?:st|nd|rd|th)[\s-]century/gi;
// Generous box around greater Tbilisi and Mtskheta.
const BOUNDS = { minLat: 41.55, maxLat: 41.95, minLng: 44.55, maxLng: 45.05 };

function centuries(text: string): number[] {
  return [...text.matchAll(CENTURY)].map((m) => Number(m[1]));
}

/**
 * Catches the mistakes that make an AI guide lose trust: a headline period the facts
 * do not support, statements with no source, stories that mention centuries no fact
 * mentions, and coordinates outside the launch area.
 */
export function validatePlace(place: Place): Issue[] {
  const issues: Issue[] = [];
  const add = (severity: Issue['severity'], message: string) => issues.push({ placeId: place.id, severity, message });

  if (place.facts.length === 0) add('error', 'No facts: the story cannot be grounded.');
  for (const fact of place.facts) {
    if (!/^https?:\/\//.test(fact.source)) add('error', `Fact without a source URL: "${fact.text.slice(0, 60)}"`);
  }

  const factCenturies = new Set(place.facts.flatMap((f) => centuries(f.text)));
  for (const c of centuries(place.period)) {
    if (!factCenturies.has(c)) add('error', `Period "${place.period}" is not supported by any fact.`);
  }

  for (const locale of LOCALES) {
    const content = place.content[locale];
    if (!content?.name || !content.summary || !content.story) {
      add('error', `Missing ${locale} content.`);
      continue;
    }
    if (locale === 'en') {
      for (const c of centuries(`${content.summary} ${content.story}`)) {
        if (!factCenturies.has(c)) add('error', `en text mentions the ${c}th century, which no fact supports.`);
      }
    }
    const words = content.story.trim().split(/\s+/).length;
    if (words < 60) add('warning', `${locale} story is short (${words} words).`);
  }

  if (place.lat < BOUNDS.minLat || place.lat > BOUNDS.maxLat || place.lng < BOUNDS.minLng || place.lng > BOUNDS.maxLng) {
    add('error', `Coordinates ${place.lat}, ${place.lng} are outside the Tbilisi launch area.`);
  }
  if (!place.photoUrl) add('warning', 'No photo yet.');
  else if (!place.photoCredit) add('error', 'Photo has no credit/licence.');

  return issues;
}

export function validateAll(places: Place[]): Issue[] {
  const issues = places.flatMap(validatePlace);
  const seen = new Map<string, string>();
  for (const p of places) {
    const dup = seen.get(p.slug);
    if (dup) issues.push({ placeId: p.id, severity: 'error', message: `Duplicate slug "${p.slug}" (also ${dup}).` });
    seen.set(p.slug, p.id);
  }
  return issues;
}
