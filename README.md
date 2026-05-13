# AI Tour Guide

AI Tour Guide is an Expo React Native application scaffolded with TypeScript, Expo Router, and NativeWind. The architecture is intentionally feature-based so camera scanning, location lookup, landmark data, and AI guide workflows can evolve independently.

## Tech Stack

- Expo + React Native
- TypeScript in strict mode
- Expo Router for file-based navigation
- NativeWind for mobile-first utility styling
- Expo-managed camera and location packages for future permission-aware features

## Getting Started

Install dependencies:

```bash
npm install
```

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

## Security Notes

Do not add OpenAI or other AI provider API keys to the mobile app. AI requests that require secrets should go through a backend service that validates input, retrieves trusted landmark context, calls AI providers, validates responses, and returns safe user-facing results.

## Architecture Notes

- Screens compose UI components and avoid heavy business logic.
- Reusable UI lives under `src/components`.
- Feature folders provide clear boundaries for future hooks, services, API clients, and screen-specific components.
- Shared domain models live in `src/types` and are re-exported from feature type modules when useful.
- Network calls should use `src/lib/services/http.ts` instead of direct `fetch` calls in UI components.

## Nearby Places Mock Flow

The Nearby Places experience is implemented as a local-only flow so the app can validate permissions, distance ranking, filters, and UI states before Supabase is connected.

1. Open `/` and tap **Places near me**.
2. Expo Router navigates to `/nearby`.
3. The nearby screen composes feature components and calls `useNearbyLandmarks`.
4. `useNearbyLandmarks` requests foreground Expo Location permission, reads the current latitude and longitude, compares the user position against local Tbilisi Old Town mock landmarks, filters by category, and sorts results by nearest first.
5. Distances are calculated with the reusable Haversine utility in `src/features/landmarks/utils/getDistanceMeters.ts` and formatted as meters or kilometers for display.
6. The screen renders loading, permission denied, error, empty, and result states using shared UI primitives plus feature-specific landmark cards and category filters.

The mock landmark dataset lives in `src/features/landmarks/data/mockLandmarks.ts` and includes Tbilisi Old Town places such as Narikala Fortress, Sulfur Baths, Metekhi Church, Peace Bridge, Rike Park, Mother of Georgia, Sameba Cathedral, Freedom Square, Anchiskhati Basilica, Shardeni Street, Mtatsminda Park, and Leghvtakhevi Waterfall.

This flow does **not** call Supabase, OpenAI, or any backend service. When backend data is ready, the local mock array can be replaced behind the landmark feature boundary while keeping the screen and card components largely unchanged.
