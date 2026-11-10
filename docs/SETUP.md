# Setup: from demo mode to a live app

Each step is independent. Do them in order; test each before moving on. Steps marked **(you)** need your accounts and cannot be done by a coding agent.

## 1. App identity **(you)**

- Choose the bundle identifier (for example `ge.yourcompany.tourguide`) and add it to `app.json` as `expo.ios.bundleIdentifier` and `expo.android.package`. Put the same value in `.maestro/core-flow.yaml`.
- Replace the default icons in `assets/` with your own.

## 2. Supabase

1. **(you)** Create a project. In Authentication: enable *Anonymous sign-ins* and the *Email* provider, and edit the "Magic Link" email template so it contains the code: `{{ .Token }}`.
2. Apply the schema and seed:
   ```bash
   supabase link --project-ref <ref>
   supabase db push
   npm run content:seed-sql && psql "$DATABASE_URL" -f supabase/seed.sql
   ```
3. Copy `.env.example` to `.env.local` and fill `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
4. Review and publish content: `npm run content:review` (needs `SUPABASE_SERVICE_ROLE_KEY`). The app only shows places with `verified = true`, so it will be empty until you approve some.

**Test:** the map shows the approved places; saving a place while signed in creates a row in `saved_places`; a second test user cannot read it.

## 3. Recognition and narration

1. **(you)** Pick a model provider with an OpenAI-compatible API and set the secrets:
   ```bash
   supabase secrets set LLM_API_KEY=... VISION_MODEL=... TTS_MODEL=... TTS_VOICE=...
   # optional: LLM_BASE_URL=...
   ```
2. Deploy: `supabase functions deploy scan tts` and `supabase functions deploy revenuecat-webhook --no-verify-jwt`.
3. Generate audio once per place and language:
   ```bash
   curl -X POST "$SUPABASE_URL/functions/v1/tts" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json" -d '{"place_id":"narikala","locale":"en"}'
   ```
4. Listen to every Georgian file with a native speaker before publishing it. If the voice is not good enough, leave `audio_url` empty for `ka`; the app then shows the transcript.

**Test (most important in the whole project):** take 30 to 50 real photos of the seeded places from different angles and times of day, plus 10 photos of unrelated buildings named `none__...jpg`, then run `npm run eval:scan -- ./eval-photos`. Do not build further until confidently wrong answers are near zero. Tune `RECOGNIZED_THRESHOLD` and the prompt in `supabase/functions/_shared/`.

## 4. Maps on Android **(you)**

Expo Go works without a key. Release builds on Android need a Google Maps API key in `app.json` under `expo.android.config.googleMaps.apiKey`. iOS uses Apple Maps and needs nothing.

## 5. Purchases

The paywall currently uses a demo implementation (`src/services/purchases.ts`) that unlocks Pro on the device only. To go live:

1. **(you)** Create the subscription products in App Store Connect and Google Play, then a RevenueCat project with a `pro` entitlement and `monthly` / `yearly` packages.
2. Install `react-native-purchases` (needs a development build, not Expo Go) and implement the `Purchases` interface with it. Call `Purchases.logIn(<supabase user id>)` after sign-in.
3. In RevenueCat, add a webhook to `/functions/v1/revenuecat-webhook` with an Authorization header, and set the same value: `supabase secrets set REVENUECAT_WEBHOOK_SECRET=...`.

**Test:** a sandbox purchase sets `profiles.is_pro = true`; the sixth scan of the day then succeeds; an expired sandbox subscription blocks it again.

## 6. Analytics and crash reporting

`src/services/analytics.ts` logs events in development. Call `setAnalyticsSink` at startup to forward them to your tool. Add crash reporting (for example Sentry) before the public release.

## 7. More places

```bash
npm run content:import                       # candidates from Wikidata -> scripts/content/out/candidates.json
npm run content:stories -- facts.json        # drafts from your fact files
npm run content:validate                     # must pass with 0 errors
```

Add real photos only with a licence you can honour, and fill `photoCredit`.

## Known gaps

- Offline city pack (download places and audio in advance) is not built. The app works offline only for content already loaded, and saved places are stored on the device.
- Library sync resolves conflicts as last writer wins.
- Sign in with Apple / Google is not built; email code and guest accounts are.
- The web build is for development previews, not a product.
