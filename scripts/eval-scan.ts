// npm run eval:scan -- ./eval-photos
// Measures how often the scan endpoint recognises real photos, so thresholds and
// prompts can be tuned on evidence. Photo file names carry the expected answer and,
// optionally, where the photo was taken:
//
//   narikala__from-the-bridge__41.6921_44.8085.jpg
//   <place id>__<any note>[__<lat>_<lng>].jpg      (use "none" as the id for photos of no landmark)
//
// Photos should already be about 1024px on the long side.
// Env: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, SCAN_EVAL_JWT (a Pro test user's access token)
// NOTE: not run against a live project in the environment where it was written.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

interface Result {
  status: string;
  placeId?: string;
  placeIds?: string[];
}

async function main() {
  const dir = process.argv[2];
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const jwt = process.env.SCAN_EVAL_JWT;
  if (!dir || !url || !anon || !jwt) {
    console.error('Usage: SCAN_EVAL_JWT=... npm run eval:scan -- ./eval-photos');
    process.exit(1);
  }

  const files = readdirSync(dir).filter((f) => /\.jpe?g$/i.test(f));
  let correct = 0;
  let inTop3 = 0;
  let wrong = 0;

  for (const file of files) {
    const [expected, , where] = file.replace(/\.jpe?g$/i, '').split('__');
    const [lat, lng] = (where ?? '').split('_').map(Number);
    const response = await fetch(`${url}/functions/v1/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${jwt}` },
      body: JSON.stringify({
        image_base64: readFileSync(join(dir, file)).toString('base64'),
        ...(Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : {}),
      }),
    });
    const result = (await response.json()) as Result;

    let verdict: string;
    if (result.status === 'recognized') {
      // A confident wrong answer is the worst outcome: the user hears the wrong story.
      if (result.placeId === expected) (correct++, (verdict = 'correct'));
      else (wrong++, (verdict = `WRONG (said ${result.placeId})`));
    } else if (result.status === 'candidates') {
      if (result.placeIds?.includes(expected)) (inTop3++, (verdict = 'in candidates'));
      else verdict = 'missed (candidates)';
    } else {
      if (expected === 'none') (correct++, (verdict = 'correctly rejected'));
      else verdict = `missed (${result.status})`;
    }
    console.log(`${file.padEnd(60)} ${verdict}`);
  }

  const n = files.length || 1;
  console.log(`\n${files.length} photos`);
  console.log(`  correct:          ${correct} (${Math.round((correct / n) * 100)}%)`);
  console.log(`  in candidates:    ${inTop3} (${Math.round((inTop3 / n) * 100)}%)`);
  console.log(`  confidently wrong: ${wrong} (${Math.round((wrong / n) * 100)}%)  <- keep this near zero`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
