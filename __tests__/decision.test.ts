import { canScan, decideScan, FREE_DAILY_SCANS, haversineMeters, parseModelGuess } from '../supabase/functions/_shared/decision';

const ids = ['narikala', 'metekhi', 'sioni', 'sameba'];

describe('decideScan', () => {
  it('recognizes a confident guess from the candidate list', () => {
    expect(decideScan({ place_id: 'metekhi', confidence: 0.93 }, ids)).toEqual({ status: 'recognized', placeId: 'metekhi', confidence: 0.93 });
  });

  it('asks the user to choose when confidence is medium, model pick first', () => {
    const result = decideScan({ place_id: 'sioni', confidence: 0.6, alternatives: ['sameba', 'not-a-candidate'] }, ids);
    expect(result).toEqual({ status: 'candidates', placeIds: ['sioni', 'sameba', 'narikala'] });
  });

  it('rejects low confidence', () => {
    expect(decideScan({ place_id: 'sioni', confidence: 0.2 }, ids).status).toBe('not_recognized');
  });

  it('never trusts an id that was not offered to the model', () => {
    expect(decideScan({ place_id: 'eiffel-tower', confidence: 0.99 }, ids)).toEqual({ status: 'not_recognized', nearbyIds: ['narikala', 'metekhi', 'sioni'] });
  });

  it('handles a missing or null answer', () => {
    expect(decideScan(null, ids).status).toBe('not_recognized');
    expect(decideScan({ place_id: null, confidence: 0.9 }, ids).status).toBe('not_recognized');
  });

  it('treats a non-numeric confidence as zero', () => {
    expect(decideScan({ place_id: 'sioni', confidence: NaN }, ids).status).toBe('not_recognized');
  });
});

describe('parseModelGuess', () => {
  it('reads JSON wrapped in prose or code fences', () => {
    expect(parseModelGuess('Sure!\n```json\n{"place_id":"narikala","confidence":0.9,"alternatives":["sioni"]}\n```')).toEqual({
      place_id: 'narikala',
      confidence: 0.9,
      alternatives: ['sioni'],
    });
  });

  it('returns null for garbage', () => {
    expect(parseModelGuess('I cannot tell')).toBeNull();
    expect(parseModelGuess('{not json}')).toBeNull();
  });

  it('normalises wrong field types', () => {
    expect(parseModelGuess('{"place_id": 5, "confidence": "high"}')).toEqual({ place_id: null, confidence: 0, alternatives: [] });
  });
});

describe('limits and distance', () => {
  it('stops free users at the daily limit but not Pro users', () => {
    expect(canScan(false, FREE_DAILY_SCANS - 1)).toBe(true);
    expect(canScan(false, FREE_DAILY_SCANS)).toBe(false);
    expect(canScan(true, 999)).toBe(true);
  });

  it('measures Narikala to Metekhi at roughly 320 m', () => {
    const meters = haversineMeters({ lat: 41.68778, lng: 44.80861 }, { lat: 41.69, lng: 44.81111 });
    expect(meters).toBeGreaterThan(250);
    expect(meters).toBeLessThan(400);
  });
});
