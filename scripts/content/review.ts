// npm run content:review
// Walks through unverified places in the database, shows the story next to its facts
// and publishes the ones you approve (verified = true). Places with validation errors
// cannot be approved.
//
// Env: EXPO_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// NOTE: not run against a live project in the environment where it was written.
import { createClient } from '@supabase/supabase-js';
import { createInterface } from 'node:readline/promises';

import { rowToPlace, type PlaceRow } from '../../src/data/rows';
import { validatePlace } from '../../src/lib/validatePlace';

async function main() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }
  const db = createClient(url, key);
  const { data, error } = await db
    .from('places')
    .select('id, slug, lat, lng, category, period, verified, photo_url, photo_credit, facts, place_translations(locale, name, summary, story, highlights, audio_url)')
    .eq('verified', false);
  if (error) throw new Error(error.message);

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  for (const row of data as unknown as PlaceRow[]) {
    const place = rowToPlace(row);
    console.log(`\n=== ${place.content.en.name} (${place.id}), ${place.period} ===`);
    console.log('\nFACTS');
    place.facts.forEach((f, i) => console.log(`  ${i + 1}. ${f.text}\n     ${f.source}`));
    console.log(`\nSTORY (en)\n${place.content.en.story}`);
    console.log(`\nSTORY (ka)\n${place.content.ka.story}`);

    const issues = validatePlace(place);
    issues.forEach((i) => console.log(`  ${i.severity.toUpperCase()}: ${i.message}`));
    if (issues.some((i) => i.severity === 'error')) {
      console.log('  -> has errors, cannot be published.');
      continue;
    }
    const answer = (await rl.question('\nPublish this place? Every sentence must match a fact. (y/N) ')).trim().toLowerCase();
    if (answer === 'y') {
      const update = await db.from('places').update({ verified: true, updated_at: new Date().toISOString() }).eq('id', place.id);
      console.log(update.error ? `  failed: ${update.error.message}` : '  published.');
    }
  }
  rl.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
