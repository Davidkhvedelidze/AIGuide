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

## Security Notes

Do not add OpenAI or other AI provider API keys to the mobile app. AI requests that require secrets should go through a backend service that validates input, retrieves trusted landmark context, calls AI providers, validates responses, and returns safe user-facing results.

## Architecture Notes

- Screens compose UI components and avoid heavy business logic.
- Reusable UI lives under `src/components`.
- Feature folders provide clear boundaries for future hooks, services, API clients, and screen-specific components.
- Shared domain models live in `src/types` and are re-exported from feature type modules when useful.
- Network calls should use `src/lib/services/http.ts` instead of direct `fetch` calls in UI components.
