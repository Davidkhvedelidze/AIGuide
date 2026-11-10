import { CANDIDATE_RADIUS_M, FREE_DAILY_SCANS } from '../../supabase/functions/_shared/decision';
import { sortByDistance, TBILISI_CENTER } from '@/lib/geo';
import { mayScan, useApp } from '@/store/app';
import { SEED_PLACES } from './seed/places';
import { supabase } from './supabase';
import { rowToPlace, type PlaceRow } from './rows';
import type { Place, ScanRequest, ScanResult } from './types';

export interface Api {
  listPlaces(): Promise<Place[]>;
  scan(request: ScanRequest): Promise<ScanResult>;
}

/* ---------- Demo mode: bundled seed data, no network ---------- */

export const mockApi: Api = {
  async listPlaces() {
    return SEED_PLACES;
  },

  /**
   * There is no vision model in demo mode, so this never claims to recognise anything.
   * It returns the nearest places as candidates and lets the user choose.
   */
  async scan({ coords }) {
    const app = useApp.getState();
    if (!mayScan(app)) return { status: 'limit_reached', limit: FREE_DAILY_SCANS };
    app.recordScan();
    const sorted = sortByDistance(SEED_PLACES, coords ?? TBILISI_CENTER);
    const ids = sorted.slice(0, 3).map((x) => x.place.id);
    if (coords && sorted[0] && sorted[0].meters > CANDIDATE_RADIUS_M) {
      return { status: 'not_recognized', nearbyIds: ids };
    }
    return { status: 'candidates', placeIds: ids };
  },
};

/* ---------- Supabase ---------- */

function supabaseApi(client: NonNullable<typeof supabase>): Api {
  return {
    async listPlaces() {
      const { data, error } = await client
        .from('places')
        .select('id, slug, lat, lng, category, period, verified, photo_url, photo_credit, facts, place_translations(locale, name, summary, story, highlights, audio_url)')
        .eq('verified', true);
      if (error) throw new Error(error.message);
      return (data as unknown as PlaceRow[]).map(rowToPlace);
    },

    async scan(request) {
      const { data, error } = await client.functions.invoke<ScanResult>('scan', {
        body: { image_base64: request.imageBase64, lat: request.coords?.lat, lng: request.coords?.lng, locale: request.locale },
      });
      if (error || !data) throw new Error(error?.message ?? 'Empty scan response');
      return data;
    },
  };
}

export const api: Api = supabase ? supabaseApi(supabase) : mockApi;
