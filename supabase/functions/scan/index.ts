// POST /functions/v1/scan
// Body: { image_base64: string, lat?: number, lng?: number, locale?: 'en' | 'ka' }
// Returns the same ScanResult union the app uses (src/data/types.ts).
//
// The model never sees the whole catalogue: it chooses among places near the user,
// and its answer is validated before anything is shown. Scan limits and the Pro
// entitlement are enforced here, not in the app.

import { createClient } from 'jsr:@supabase/supabase-js@2';

import { CANDIDATE_RADIUS_M, canScan, decideScan, FREE_DAILY_SCANS, parseModelGuess } from '../_shared/decision.ts';
import { type Candidate, corsHeaders, json, openAiCompatibleVision } from '../_shared/providers.ts';

const MAX_IMAGE_BASE64 = 2_000_000; // ~1.5 MB of JPEG
const FALLBACK_RADIUS_M = 5000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const authHeader = req.headers.get('Authorization') ?? '';
  const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const { data: auth } = await asUser.auth.getUser();
  const user = auth?.user;
  if (!user) return json({ error: 'Sign in required' }, 401);

  let body: { image_base64?: unknown; lat?: unknown; lng?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  const image = typeof body.image_base64 === 'string' ? body.image_base64 : '';
  if (!image || image.length > MAX_IMAGE_BASE64) return json({ error: 'Image missing or too large' }, 400);
  const lat = typeof body.lat === 'number' && Math.abs(body.lat) <= 90 ? body.lat : null;
  const lng = typeof body.lng === 'number' && Math.abs(body.lng) <= 180 ? body.lng : null;

  // Entitlement and daily limit.
  const { data: profile } = await admin.from('profiles').select('is_pro, pro_expires_at').eq('id', user.id).maybeSingle();
  const isPro = !!profile?.is_pro && (!profile.pro_expires_at || new Date(profile.pro_expires_at) > new Date());
  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);
  const { count } = await admin
    .from('scans')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', dayStart.toISOString());
  if (!canScan(isPro, count ?? 0)) return json({ status: 'limit_reached', limit: FREE_DAILY_SCANS });

  // Candidates: places near the user, or the whole (small) catalogue when location is off.
  let candidates: Candidate[] = [];
  if (lat !== null && lng !== null) {
    const near = await admin.rpc('nearby_places', { p_lat: lat, p_lng: lng, radius_m: CANDIDATE_RADIUS_M, max_results: 8 });
    candidates = (near.data ?? []) as Candidate[];
    if (candidates.length === 0) {
      const wider = await admin.rpc('nearby_places', { p_lat: lat, p_lng: lng, radius_m: FALLBACK_RADIUS_M, max_results: 3 });
      const nearbyIds = ((wider.data ?? []) as Candidate[]).map((c) => c.id);
      await admin.from('scans').insert({ user_id: user.id, status: 'not_recognized', lat, lng });
      return json({ status: 'not_recognized', nearbyIds });
    }
  } else {
    const all = await admin
      .from('place_translations')
      .select('place_id, name, summary, places!inner(verified)')
      .eq('locale', 'en')
      .eq('places.verified', true)
      .limit(30);
    candidates = (all.data ?? []).map((r: { place_id: string; name: string; summary: string }) => ({
      id: r.place_id,
      name: r.name,
      summary: r.summary,
    }));
  }

  let decision;
  try {
    const raw = await openAiCompatibleVision.recognize(image, candidates);
    decision = decideScan(parseModelGuess(raw), candidates.map((c) => c.id));
  } catch (error) {
    console.error('vision failed', error);
    return json({ error: 'Recognition is unavailable' }, 502);
  }

  await admin.from('scans').insert({
    user_id: user.id,
    status: decision.status,
    place_id: decision.status === 'recognized' ? decision.placeId : null,
    confidence: decision.status === 'recognized' ? decision.confidence : null,
    lat,
    lng,
  });

  return json(decision);
});
