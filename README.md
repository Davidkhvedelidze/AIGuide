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


## Local MVP Scan Flow

The first working scan flow is intentionally local-only:

1. Open `/` and tap **Scan what I’m seeing**.
2. Expo Router navigates to `/camera-scan`.
3. The camera screen requests Expo Camera permission and then foreground Expo Location permission.
4. After both permissions are available, tap **Take photo and view result**.
5. The app captures a photo with Expo Camera, attaches the current latitude and longitude from Expo Location, creates a local mock `AiGuideResult`, and navigates to `/result`.
6. The result screen displays the mock guide summary, scan coordinates, photo URI, highlights, suggested questions, and mock citation text.

This flow does **not** call OpenAI, Supabase, or any backend service. The mock result is created in `src/features/ai-guide/services/createMockAiGuideResult.ts` so the future production integration can replace local mock generation with a secure backend call without moving secrets into the mobile app.

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
