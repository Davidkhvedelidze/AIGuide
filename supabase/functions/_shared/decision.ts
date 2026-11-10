// Pure logic shared by the edge functions (Deno) and the app's unit tests (Jest).
// Keep this file free of imports and runtime-specific APIs.

export const RECOGNIZED_THRESHOLD = 0.8;
export const CANDIDATE_THRESHOLD = 0.5;
export const FREE_DAILY_SCANS = 5;
export const CANDIDATE_RADIUS_M = 500;

export interface ModelGuess {
  place_id: string | null;
  confidence: number;
  alternatives?: string[];
}

export type ScanDecision =
  | { status: 'recognized'; placeId: string; confidence: number }
  | { status: 'candidates'; placeIds: string[] }
  | { status: 'not_recognized'; nearbyIds: string[] };

/**
 * Turns the vision model's answer into what the user sees.
 * The model may only pick from `candidateIds` (places near the user), so anything
 * else it returns is treated as "not recognized" rather than trusted.
 */
export function decideScan(guess: ModelGuess | null, candidateIds: string[]): ScanDecision {
  const nearby = candidateIds.slice(0, 3);
  if (!guess || !guess.place_id || !candidateIds.includes(guess.place_id)) {
    return { status: 'not_recognized', nearbyIds: nearby };
  }
  const confidence = Number.isFinite(guess.confidence) ? Math.min(1, Math.max(0, guess.confidence)) : 0;
  if (confidence >= RECOGNIZED_THRESHOLD) {
    return { status: 'recognized', placeId: guess.place_id, confidence };
  }
  if (confidence >= CANDIDATE_THRESHOLD) {
    const alts = (guess.alternatives ?? []).filter((id) => candidateIds.includes(id) && id !== guess.place_id);
    const rest = candidateIds.filter((id) => id !== guess.place_id && !alts.includes(id));
    return { status: 'candidates', placeIds: [guess.place_id, ...alts, ...rest].slice(0, 3) };
  }
  return { status: 'not_recognized', nearbyIds: nearby };
}

/** Extracts the JSON object from a model reply that may wrap it in prose or code fences. */
export function parseModelGuess(raw: string): ModelGuess | null {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    const obj = JSON.parse(raw.slice(start, end + 1));
    if (typeof obj !== 'object' || obj === null) return null;
    const place_id = typeof obj.place_id === 'string' ? obj.place_id : null;
    const confidence = typeof obj.confidence === 'number' ? obj.confidence : 0;
    const alternatives = Array.isArray(obj.alternatives)
      ? obj.alternatives.filter((x: unknown): x is string => typeof x === 'string')
      : [];
    return { place_id, confidence, alternatives };
  } catch {
    return null;
  }
}

export function canScan(isPro: boolean, usedToday: number, limit = FREE_DAILY_SCANS): boolean {
  return isPro || usedToday < limit;
}

/** Great-circle distance in metres. */
export function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
