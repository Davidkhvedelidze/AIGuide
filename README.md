# AI Tour Guide

AI Tour Guide is an Expo React Native application scaffolded with TypeScript, Expo Router, and NativeWind. The architecture is intentionally feature-based so camera scanning, location lookup, landmark data, and AI guide workflows can evolve independently.

## Tech Stack

- Expo + React Native
- TypeScript in strict mode
- Expo Router for file-based navigation
- NativeWind for mobile-first utility styling
- Expo-managed camera and location packages for permission-aware features
- Supabase for public landmark data, geospatial search, and scan history storage

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local Expo environment file from the example and fill in your Supabase project values:

```bash
cp .env.example .env
```

Required public mobile environment variables:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_ANALYZE_SCAN_URL=
```

Only use the Supabase project URL and anon key in the mobile app. Do not put OpenAI keys, service role keys, or any other backend secrets in Expo public environment variables.

Start the Expo development server:

```bash
npm run start
```

Common targets:

```bash
npm run ios
npm run android
npm run web
```

Run TypeScript checks:

```bash
npm run typecheck
```

## Project Structure

```text
src/
  app/                    Expo Router routes and root layout
  components/
    layout/               Shared screen layout primitives
    ui/                   Reusable typed UI components
  features/
    ai-guide/             AI guide feature boundary
    camera/               Camera scan feature boundary
    landmarks/            Landmark domain feature boundary
    location/             Location and nearby search boundary
  lib/
    constants/            Shared constants and route names
    logger/               Centralized app logging
    services/             Framework-independent services such as HTTP
    env.ts                Required public environment variable validation
    supabase.ts           Supabase client configured with public Expo env
  styles/                 NativeWind global styles
  types/                  Shared domain models
```

## Routes

The initial route set lives in `src/app`:

- `/` home
- `/onboarding`
- `/camera-scan`
- `/result`
- `/nearby`
- `/ask-guide`


## OpenAI Vision Scan Flow

The scan flow uses a secure Supabase Edge Function to keep OpenAI and Supabase service-role secrets off the mobile device:

1. Open `/` and tap **Scan what I’m seeing**.
2. Expo Router navigates to `/camera-scan`.
3. The camera screen requests Expo Camera permission and then foreground Expo Location permission.
4. After both permissions are available, tap **Take photo and view result**.
5. The app captures a JPEG photo with Expo Camera, attaches latitude, longitude, and device locale, then sends `multipart/form-data` to `EXPO_PUBLIC_ANALYZE_SCAN_URL`.
6. The Edge Function validates the file and coordinates, uploads the image to the private `scan-images` bucket under `scans/{uuid}.jpg`, creates a short-lived signed URL for server-side OpenAI image analysis, and calls `get_nearby_landmarks(input_lat, input_lng, radius_meters => 700)`.
7. The function sends OpenAI only the signed image URL, GPS location, locale, and the nearest 8 minimized landmark candidates (`id`, `name`, `category`, descriptions, trusted facts/context, visit timing, and distance). It never sends user IDs or unnecessary user data.
8. OpenAI Responses API returns strict structured JSON compatible with `AiGuideResult`; the Edge Function validates and safety-normalizes it before returning it to the app.
9. If no nearby landmarks exist, the function skips OpenAI and returns an uncertain no-match result. If OpenAI fails or returns invalid JSON, the function saves and returns a safe low-confidence fallback based only on the nearest trusted location record.
10. The result screen displays the real AI result or clearly marked uncertain fallback result.

The signed image URL is generated only inside the Edge Function and is not returned to the mobile app. The permanent storage path is saved in `scan_history.image_path`; temporary signed URLs should be regenerated only when needed.

## Supabase Setup

The database schema, RPC function, indexes, and Tbilisi seed landmarks live in:

```text
supabase/migrations/20260513143000_create_landmarks.sql
```

Apply it to your Supabase project with the Supabase CLI:

```bash
supabase db push
```

Alternatively, open the SQL file and run it in the Supabase SQL editor for your project. The migration enables PostGIS, creates `landmarks`, `landmark_translations`, and `scan_history`, creates the generated `location` geography column, adds a GIST location index, and exposes the `get_nearby_landmarks(input_lat, input_lng, radius_meters)` RPC.


## Supabase Edge Function Deployment

The scan backend lives in:

```text
supabase/functions/analyze-scan/index.ts
supabase/functions/analyze-scan/types.ts
supabase/migrations/create_scan_images_bucket.sql
supabase/migrations/20260513170000_add_scan_history_ai_response.sql
```

Apply database and storage changes first:

```bash
supabase db push
```

Set required Edge Function secrets. These are server-side only and must never be copied into Expo public variables:

```bash
supabase secrets set SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
supabase secrets set OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
supabase secrets set OPENAI_VISION_MODEL="gpt-5.1"
```

Deploy the function:

```bash
supabase functions deploy analyze-scan
```

Set the mobile app endpoint to the deployed function URL:

```bash
EXPO_PUBLIC_ANALYZE_SCAN_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/analyze-scan
```

The function accepts only `POST` multipart requests and handles `OPTIONS` preflight for CORS. It rejects missing images, invalid coordinates, unsupported image types, and files larger than 5MB with safe JSON error responses.

Required mobile environment variables:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_ANALYZE_SCAN_URL=
```

Required Supabase Edge Function secrets:

```bash
OPENAI_API_KEY=
OPENAI_VISION_MODEL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Security reminder: never add OpenAI API keys to Expo environment variables or React Native code, and never expose Supabase service role keys in `EXPO_PUBLIC_*` variables. The mobile app should only call `EXPO_PUBLIC_ANALYZE_SCAN_URL` for scan analysis.

## End-to-End Scan Testing

1. Apply migrations with `supabase db push`.
2. Set Edge Function secrets with `supabase secrets set OPENAI_API_KEY="..." OPENAI_VISION_MODEL="gpt-5.1" SUPABASE_URL="..." SUPABASE_SERVICE_ROLE_KEY="..."`.
3. Deploy the Edge Function with `supabase functions deploy analyze-scan`.
4. Set only public Expo values locally: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, and `EXPO_PUBLIC_ANALYZE_SCAN_URL`. Do not set `OPENAI_API_KEY` in `.env`, `.env.local`, EAS public variables, or React Native source.
5. Run `npm run start`, open the app, grant camera and foreground location permissions, and scan a landmark near seeded Supabase data.
6. Verify the result is an `AiGuideResult` with confidence, uncertainty messaging when appropriate, nearby places, facts from trusted candidates, and a CTA.
7. To verify fallback behavior, temporarily unset or rotate `OPENAI_API_KEY` in the Edge Function secrets, redeploy or restart the local function, scan again, and confirm the app receives a low-confidence uncertain result instead of an unhandled error.

## Security Notes

Do not add OpenAI or other AI provider API keys to the mobile app. AI requests that require secrets go through the Supabase Edge Function, which validates input, retrieves trusted landmark context, calls OpenAI Vision, validates structured output, and returns safe user-facing results. Supabase service role keys must also stay server-side and must never be placed in `EXPO_PUBLIC_*` variables.

## Architecture Notes

- Screens compose UI components and avoid heavy business logic.
- Reusable UI lives under `src/components`.
- Feature folders provide clear boundaries for future hooks, services, API clients, and screen-specific components.
- Shared domain models live in `src/types` and are re-exported from feature type modules when useful.
- Network calls should use `src/lib/services/http.ts` instead of direct `fetch` calls in UI components.

## Nearby Places Supabase Flow

The Nearby Places experience now reads public landmark data from Supabase while preserving the original UI states and category filtering.

1. Open `/` and tap **Places near me**.
2. Expo Router navigates to `/nearby`.
3. The nearby screen composes feature components and calls `useNearbyLandmarks`.
4. `useNearbyLandmarks` requests foreground Expo Location permission and reads the current latitude and longitude.
5. The hook calls `getNearbyLandmarks` in `src/features/landmarks/api/landmarkApi.ts`, which invokes the Supabase `get_nearby_landmarks` RPC.
6. PostGIS calculates `distance_meters` in the database and sorts landmarks by nearest first; the client uses the returned distance for formatting and does not recalculate database distance.
7. The app applies the existing category filter on the returned result set and renders loading, permission denied, Supabase error, empty, and result states using shared UI primitives plus feature-specific landmark cards.

The migration seeds Tbilisi Old Town places including Narikala Fortress, Sulfur Baths, Metekhi Church, Peace Bridge, Rike Park, Mother of Georgia, Sameba Cathedral, Freedom Square, Anchiskhati Basilica, Shardeni Street, Mtatsminda Park, and Leghvtakhevi Waterfall.
