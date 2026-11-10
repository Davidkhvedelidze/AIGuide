import { mockApi } from '@/data/api';
import { scansLeft, useApp } from '@/store/app';
import { useLibrary, visitedCount } from '@/store/library';
import { FREE_DAILY_SCANS } from '../supabase/functions/_shared/decision';

beforeEach(() => {
  useLibrary.getState().clearAll();
  useApp.getState().reset();
});

describe('library', () => {
  it('saves and unsaves a place', () => {
    const { toggleSaved } = useLibrary.getState();
    toggleSaved('narikala');
    expect(useLibrary.getState().savedIds).toEqual(['narikala']);
    toggleSaved('narikala');
    expect(useLibrary.getState().savedIds).toEqual([]);
  });

  it('adding to a collection also saves the place; unsaving removes it from collections', () => {
    const id = useLibrary.getState().createCollection('  Old town  ')!;
    expect(useLibrary.getState().collections[0].name).toBe('Old town');
    useLibrary.getState().toggleInCollection(id, 'sioni');
    expect(useLibrary.getState().savedIds).toContain('sioni');
    expect(useLibrary.getState().collections[0].placeIds).toEqual(['sioni']);
    useLibrary.getState().toggleSaved('sioni');
    expect(useLibrary.getState().collections[0].placeIds).toEqual([]);
  });

  it('rejects empty collection names', () => {
    expect(useLibrary.getState().createCollection('   ')).toBeNull();
    expect(useLibrary.getState().collections).toHaveLength(0);
  });

  it('counts distinct visited places', () => {
    const { addHistory } = useLibrary.getState();
    addHistory('narikala', 'scan');
    addHistory('narikala', 'listen');
    addHistory('sioni', 'listen');
    expect(visitedCount(useLibrary.getState().history)).toBe(2);
  });
});

describe('demo scan', () => {
  const coords = { lat: 41.69, lng: 44.8111 };
  const request = { imageBase64: 'x', coords, locale: 'en' as const };

  it('offers the nearest places as candidates and never claims recognition', async () => {
    const result = await mockApi.scan(request);
    expect(result).toEqual({ status: 'candidates', placeIds: expect.arrayContaining(['metekhi']) });
  });

  it('says not recognized when the user is far from every place', async () => {
    const result = await mockApi.scan({ ...request, coords: { lat: 41.8, lng: 44.9 } });
    expect(result.status).toBe('not_recognized');
  });

  it('enforces the free daily limit, and lifts it for Pro', async () => {
    for (let i = 0; i < FREE_DAILY_SCANS; i++) await mockApi.scan(request);
    expect(scansLeft(useApp.getState())).toBe(0);
    expect(await mockApi.scan(request)).toEqual({ status: 'limit_reached', limit: FREE_DAILY_SCANS });
    useApp.getState().setPro(true);
    expect((await mockApi.scan(request)).status).toBe('candidates');
  });
});
