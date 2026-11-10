// POST /functions/v1/revenuecat-webhook
// Keeps profiles.is_pro in sync with the store subscription. Configure the URL and
// an Authorization header value in the RevenueCat dashboard, and store the same value
// as the REVENUECAT_WEBHOOK_SECRET secret. Deploy with --no-verify-jwt.
//
// The app must call Purchases.logIn(<supabase user id>) so app_user_id matches.
// NOTE: check the event names below against RevenueCat's current webhook docs when
// you connect it; they were written from the documented event list, not tested live.

import { createClient } from 'jsr:@supabase/supabase-js@2';

import { json } from '../_shared/providers.ts';

const GRANTS = new Set(['INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE', 'UNCANCELLATION', 'NON_RENEWING_PURCHASE']);
const REVOKES = new Set(['EXPIRATION']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const secret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
  if (!secret || req.headers.get('Authorization') !== secret) return json({ error: 'Forbidden' }, 403);

  const payload = await req.json().catch(() => null);
  const event = payload?.event;
  const userId = event?.app_user_id;
  if (!event || typeof userId !== 'string' || !UUID.test(userId)) return json({ ignored: true });

  let patch: { is_pro: boolean; pro_expires_at: string | null } | null = null;
  if (GRANTS.has(event.type)) {
    patch = {
      is_pro: true,
      pro_expires_at: typeof event.expiration_at_ms === 'number' ? new Date(event.expiration_at_ms).toISOString() : null,
    };
  } else if (REVOKES.has(event.type)) {
    patch = { is_pro: false, pro_expires_at: null };
  }
  // CANCELLATION is intentionally ignored: access continues until EXPIRATION.
  if (!patch) return json({ ignored: true });

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { error } = await admin.from('profiles').update(patch).eq('id', userId);
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
});
