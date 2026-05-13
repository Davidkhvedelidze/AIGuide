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


## Backend MVP Scan Flow

The first working scan flow now uses a secure Supabase Edge Function while intentionally keeping AI provider integration out of scope:

1. Open `/` and tap **Scan what I’m seeing**.
2. Expo Router navigates to `/camera-scan`.
3. The camera screen requests Expo Camera permission and then foreground Expo Location permission.
4. After both permissions are available, tap **Take photo and view result**.
5. The app captures a JPEG photo with Expo Camera, attaches latitude, longitude, and device locale, then sends `multipart/form-data` to `EXPO_PUBLIC_ANALYZE_SCAN_URL`.
6. The Edge Function validates the file and coordinates, uploads the image to the private `scan-images` bucket under `scans/{uuid}.jpg`, creates a short-lived signed URL for server-side analysis preparation, calls `get_nearby_landmarks(input_lat, input_lng, radius_meters => 700)`, and chooses the nearest landmark as the mock detected landmark.
7. The function returns an `AiGuideResult` shaped exactly like the future AI response contract and stores the scan result in `scan_history`.
8. The result screen displays the backend mock response.

This flow does **not** call OpenAI. The signed image URL is generated only inside the Edge Function and is not returned to the mobile app. Future OpenAI Vision or multimodal analysis should be added inside the Edge Function or another secure backend service, never in Expo client code.

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
```

Apply database and storage changes first:

```bash
supabase db push
```

Set required Edge Function secrets. These are server-side only and must never be copied into Expo public variables:

```bash
supabase secrets set SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
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
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Security reminder: OpenAI integration comes later. Do not add OpenAI API keys to the mobile app, and do not expose Supabase service role keys in `EXPO_PUBLIC_*` variables. The mobile app should only call the Edge Function URL for scan analysis.

## Security Notes

Do not add OpenAI or other AI provider API keys to the mobile app. AI requests that require secrets should go through a backend service that validates input, retrieves trusted landmark context, calls AI providers, validates responses, and returns safe user-facing results. Supabase service role keys must also stay server-side and must never be placed in `EXPO_PUBLIC_*` variables.

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

The migration seeds Tbilisi Old Town places including Narikala Fortress, Sulfur Baths, Metekhi Church, Peace Bridge, Rike Park, Mother of Georgia, Sameba Cathedral, Freedom Square, Anchiskhati Basilica, Shardeni Street, Mtatsminda Park, and Leghvtakhevi Waterfall. This flow does **not** call OpenAI or implement AI Vision.
