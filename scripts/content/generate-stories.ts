// npm run content:stories -- path/to/facts.json
// Drafts a summary, narration and highlights (en + ka) for places from a facts file:
//   [{ "id": "...", "name": "...", "facts": [{ "text": "...", "source": "https://..." }] }]
//
// The model is told to use only the supplied facts, and the draft is then checked by
// the same validator the app's tests use. Output goes to scripts/content/out/drafts.json
// for an editor to review; nothing is written to the database.
//
// Env: LLM_API_KEY, STORY_MODEL, optional LLM_BASE_URL (OpenAI-compatible).
// NOTE: not run in the environment where it was written (no API key there).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Fact, PlaceContent } from '../../src/data/types';

interface Input {
  id: string;
  name: string;
  facts: Fact[];
}

export const STORY_PROMPT = `You write narration for an audio tour guide.

Use ONLY the numbered facts provided. This is a hard rule:
- Do not add dates, names, numbers, superlatives or descriptions that are not in the facts.
- If the facts are thin, write a shorter story. Never fill gaps from your own knowledge.
- Do not describe what the place looks like unless a fact says so.

Write for the ear: short sentences, second person ("you are standing..."), no lists.
Spell out ordinals in dates so a voice can read them.

Return JSON only:
{
  "en": { "name": "", "summary": "one sentence", "story": "150-250 words", "highlights": ["", "", ""] },
  "ka": { "name": "", "summary": "", "story": "natural Georgian, not a word-for-word translation", "highlights": ["", "", ""] },
  "used_facts": [1, 2]
}`;

async function draft(place: Input): Promise<{ en: PlaceContent; ka: PlaceContent; used_facts: number[] }> {
  const base = process.env.LLM_BASE_URL ?? 'https://api.openai.com/v1';
  const facts = place.facts.map((f, i) => `${i + 1}. ${f.text}`).join('\n');
  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.LLM_API_KEY}` },
    body: JSON.stringify({
      model: process.env.STORY_MODEL,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: STORY_PROMPT },
        { role: 'user', content: `Place: ${place.name}\n\nFacts:\n${facts}` },
      ],
    }),
  });
  if (!response.ok) throw new Error(`Model returned ${response.status} for ${place.id}`);
  const data = (await response.json()) as { choices: { message: { content: string } }[] };
  return JSON.parse(data.choices[0].message.content);
}

async function main() {
  const file = process.argv[2];
  if (!file || !process.env.LLM_API_KEY || !process.env.STORY_MODEL) {
    console.error('Usage: LLM_API_KEY=... STORY_MODEL=... npm run content:stories -- facts.json');
    process.exit(1);
  }
  const inputs = JSON.parse(readFileSync(file, 'utf8')) as Input[];
  const drafts = [];
  for (const place of inputs) {
    if (place.facts.length === 0) {
      console.warn(`Skipping ${place.id}: no facts`);
      continue;
    }
    const content = await draft(place);
    drafts.push({ id: place.id, facts: place.facts, content: { en: content.en, ka: content.ka }, usedFacts: content.used_facts });
    console.log(`Drafted ${place.id}`);
  }
  const dir = join(__dirname, 'out');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'drafts.json'), JSON.stringify(drafts, null, 2));
  console.log(`\nWrote ${drafts.length} drafts. Review them, add to src/data/seed/places.ts, then run npm run content:validate.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
