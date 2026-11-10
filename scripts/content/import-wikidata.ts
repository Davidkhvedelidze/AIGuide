// npm run content:import
// Collects candidate landmarks in Tbilisi from Wikidata (coordinates, English and
// Georgian names, Wikipedia page, Commons photo) into scripts/content/out/candidates.json.
//
// The output is raw material for an editor, not app content: nothing is published
// until facts are written with sources and a person has reviewed the place.
//
// NOTE: not run in the environment where it was written (no network access there).
// Run it once locally and check the first few results by hand.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ENDPOINT = 'https://query.wikidata.org/sparql';

// Q994 = Tbilisi. Tourist attractions, churches, museums, monuments, fortresses, bridges.
const QUERY = `
SELECT ?item ?itemLabel ?kaLabel ?lat ?lng ?article ?image ?sitelinks WHERE {
  ?item wdt:P131* wd:Q994 ;
        wdt:P31/wdt:P279* ?type ;
        p:P625/psv:P625 [ wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lng ] ;
        wikibase:sitelinks ?sitelinks .
  VALUES ?type { wd:Q570116 wd:Q16970 wd:Q33506 wd:Q4989906 wd:Q57831 wd:Q12280 }
  OPTIONAL { ?item wdt:P18 ?image }
  OPTIONAL { ?article schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> }
  OPTIONAL { ?item rdfs:label ?kaLabel FILTER(LANG(?kaLabel) = "ka") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}
ORDER BY DESC(?sitelinks)
LIMIT 200`;

interface Binding {
  [key: string]: { value: string } | undefined;
}

async function main() {
  const response = await fetch(`${ENDPOINT}?format=json&query=${encodeURIComponent(QUERY)}`, {
    headers: { 'User-Agent': 'AITourGuide-content-import/0.1 (contact: set SUPPORT email)', Accept: 'application/sparql-results+json' },
  });
  if (!response.ok) throw new Error(`Wikidata returned ${response.status}`);
  const data = (await response.json()) as { results: { bindings: Binding[] } };

  const seen = new Set<string>();
  const candidates = [];
  for (const b of data.results.bindings) {
    const wikidataId = b.item?.value.split('/').pop();
    if (!wikidataId || seen.has(wikidataId) || !b.article) continue; // no Wikipedia page => no source to cite
    seen.add(wikidataId);
    candidates.push({
      wikidataId,
      name: { en: b.itemLabel?.value ?? '', ka: b.kaLabel?.value ?? '' },
      lat: Number(b.lat?.value),
      lng: Number(b.lng?.value),
      source: b.article.value,
      // Commons file page. Check the licence there and copy the credit line before using the photo.
      commonsImage: b.image?.value ?? null,
      popularity: Number(b.sitelinks?.value ?? 0),
    });
  }

  const dir = join(__dirname, 'out');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'candidates.json'), JSON.stringify(candidates, null, 2));
  console.log(`Saved ${candidates.length} candidates to scripts/content/out/candidates.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
