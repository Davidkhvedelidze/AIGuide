import { SEED_PLACES } from '@/data/seed/places';
import { rowToPlace } from '@/data/rows';
import { buildTimeline, estimateMinutes, segmentAt, splitSentences, totalDuration } from '@/features/audio/sentences';
import { dictionariesForTest, translate } from '@/i18n';
import { formatClock, formatDistance, sortByDistance, walkingMinutes } from '@/lib/geo';
import { localizePeriod } from '@/lib/period';
import { validateAll, validatePlace } from '@/lib/validatePlace';

describe('seed content', () => {
  it('has no validation errors', () => {
    expect(validateAll(SEED_PLACES).filter((i) => i.severity === 'error')).toEqual([]);
  });

  it('ships every place as an unverified draft with sourced facts', () => {
    for (const place of SEED_PLACES) {
      expect(place.verified).toBe(false);
      expect(place.facts.length).toBeGreaterThan(2);
    }
  });
});

describe('validatePlace', () => {
  const base = SEED_PLACES[0];

  it('flags a headline period the facts do not support', () => {
    const issues = validatePlace({ ...base, period: '6th century' });
    expect(issues.some((i) => i.severity === 'error' && i.message.includes('not supported'))).toBe(true);
  });

  it('flags a story that mentions a century no fact mentions', () => {
    const content = { ...base.content, en: { ...base.content.en, story: `${base.content.en.story} It was rebuilt in the 9th century.` } };
    expect(validatePlace({ ...base, content }).some((i) => i.message.includes('9th century'))).toBe(true);
  });

  it('flags facts without a source and photos without a credit', () => {
    const issues = validatePlace({ ...base, facts: [{ text: 'Built in the 4th century.', source: '' }], photoUrl: 'https://x/y.jpg' });
    expect(issues.filter((i) => i.severity === 'error').length).toBeGreaterThanOrEqual(2);
  });

  it('flags coordinates outside the launch area', () => {
    expect(validatePlace({ ...base, lat: 48.85, lng: 2.35 }).some((i) => i.message.includes('outside'))).toBe(true);
  });
});

describe('narration timeline', () => {
  it('does not split on decimals', () => {
    expect(splitSentences('It rises 86.1 metres. Look up!')).toEqual(['It rises 86.1 metres.', 'Look up!']);
  });

  it('builds contiguous segments and finds the one at a position', () => {
    const timeline = buildTimeline('One sentence here. Another one follows. And a third.');
    expect(timeline).toHaveLength(3);
    expect(timeline[1].start).toBe(timeline[0].end);
    expect(segmentAt(timeline, 0)).toBe(0);
    expect(segmentAt(timeline, timeline[1].start + 0.01)).toBe(1);
    expect(segmentAt(timeline, 9999)).toBe(2);
    expect(totalDuration(timeline)).toBe(timeline[2].end);
  });

  it('estimates at least one minute', () => {
    expect(estimateMinutes('Short.')).toBe(1);
  });
});

describe('formatting and distance', () => {
  it('formats distances, walking time and clock', () => {
    expect(formatDistance(142)).toBe('140 m');
    expect(formatDistance(1260)).toBe('1.3 km');
    expect(walkingMinutes(20)).toBe(1);
    expect(walkingMinutes(750)).toBe(10);
    expect(formatClock(65.9)).toBe('01:05');
  });

  it('sorts places nearest first', () => {
    const sorted = sortByDistance(SEED_PLACES, { lat: 41.69, lng: 44.8111 });
    expect(sorted[0].place.id).toBe('metekhi');
    expect(sorted[0].meters).toBeLessThan(sorted[1].meters);
  });
});

describe('i18n', () => {
  it('uses the same placeholders in both languages', () => {
    const { en, ka } = dictionariesForTest;
    const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join();
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(`${key}:${vars(ka[key])}`).toBe(`${key}:${vars(en[key])}`);
      expect(ka[key].length).toBeGreaterThan(0);
    }
  });

  it('interpolates parameters', () => {
    expect(translate('en', 'guide.scansLeft', { n: 3 })).toBe('3 free scans left today');
  });
});

describe('rowToPlace', () => {
  it('maps database rows and falls back to English when Georgian is missing', () => {
    const place = rowToPlace({
      id: 'x', slug: 'x', lat: 41.7, lng: 44.8, category: 'church', period: '6th century', verified: true,
      photo_url: null, photo_credit: null, facts: null,
      place_translations: [{ locale: 'en', name: 'X', summary: 's', story: 'st', highlights: null, audio_url: 'https://a/x.mp3' }],
    });
    expect(place.content.ka.name).toBe('X');
    expect(place.audioUrl).toEqual({ en: 'https://a/x.mp3' });
    expect(place.facts).toEqual([]);
  });
});

describe('localizePeriod', () => {
  it('writes Georgian centuries with Roman numerals and leaves the rest alone', () => {
    expect(localizePeriod('4th century', 'ka')).toBe('IV საუკუნე');
    expect(localizePeriod('13th century', 'ka')).toBe('XIII საუკუნე');
    expect(localizePeriod('5th century legend', 'ka')).toBe('V საუკუნის ლეგენდა');
    expect(localizePeriod('1995–2004', 'ka')).toBe('1995–2004');
    expect(localizePeriod('4th century', 'en')).toBe('4th century');
  });
});
