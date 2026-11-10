// POST /functions/v1/tts   (service role only; called by scripts, never by the app)
// Body: { place_id: string, locale: 'en' | 'ka', force?: boolean }
//
// Generates narration once per place and language, stores it in the public `audio`
// bucket and saves the URL. The app then always plays the cached file.

import { createClient } from 'jsr:@supabase/supabase-js@2';

import { corsHeaders, json, openAiCompatibleSpeech } from '../_shared/providers.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  if (req.headers.get('Authorization') !== `Bearer ${serviceKey}`) return json({ error: 'Forbidden' }, 403);

  const { place_id, locale, force } = await req.json().catch(() => ({}));
  if (typeof place_id !== 'string' || (locale !== 'en' && locale !== 'ka')) return json({ error: 'Bad request' }, 400);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey);
  const { data: row, error } = await admin
    .from('place_translations')
    .select('story, audio_url')
    .eq('place_id', place_id)
    .eq('locale', locale)
    .maybeSingle();
  if (error || !row) return json({ error: 'Translation not found' }, 404);
  if (row.audio_url && !force) return json({ audio_url: row.audio_url, cached: true });

  let audio: Uint8Array;
  try {
    audio = await openAiCompatibleSpeech.synthesize(row.story, locale);
  } catch (e) {
    console.error('tts failed', e);
    return json({ error: 'Speech generation failed' }, 502);
  }

  // A new file name on every generation, so phones never play a stale cached copy.
  const path = `${place_id}/${locale}-${Date.now()}.mp3`;
  const upload = await admin.storage.from('audio').upload(path, audio, { contentType: 'audio/mpeg', cacheControl: '31536000' });
  if (upload.error) return json({ error: upload.error.message }, 500);

  const audio_url = admin.storage.from('audio').getPublicUrl(path).data.publicUrl;
  const update = await admin.from('place_translations').update({ audio_url }).eq('place_id', place_id).eq('locale', locale);
  if (update.error) return json({ error: update.error.message }, 500);

  return json({ audio_url, cached: false });
});
