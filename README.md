# AI Guide

AI Guide is a React Native application built with Expo. The current MVP implements a local camera-to-result flow without a backend, OpenAI, API keys, or Supabase.

## Tech Stack

- React Native
- Expo
- Expo Router
- Expo Camera
- Expo Location
- TypeScript
- Node.js

## Getting Started

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npm run start
```

Common Expo targets:

```bash
npm run ios
npm run android
npm run web
```

## MVP Scan Mock Flow

The first working MVP flow is fully local:

1. The user opens the Home screen at `src/app/index.tsx`.
2. The user taps **Scan what I’m seeing**.
3. Expo Router navigates to `src/app/camera-scan.tsx`.
4. The camera screen requests camera permission through `useCameraPermission`.
5. The camera screen requests foreground location permission through `useCurrentLocation`.
6. The user captures a photo with Expo Camera.
7. The app reads the current latitude and longitude with Expo Location.
8. `createMockAiGuideResult` builds a typed local `AiGuideResult`.
9. Expo Router navigates to `src/app/result.tsx`, which validates and displays the result.

This flow intentionally does **not** call OpenAI, a backend API, Supabase, or any external service. It passes an encoded mock result between routes so the app can validate navigation, permissions, loading states, denied-permission states, and scan error states before real AI integration is added.

## Project Structure

```text
src/
  app/
    _layout.tsx
    index.tsx
    camera-scan.tsx
    result.tsx
  components/
    ui/
      AppButton.tsx
      AppCard.tsx
      AppText.tsx
      ErrorState.tsx
      LoadingState.tsx
  features/
    camera/
      hooks/
        useCameraPermission.ts
        useCameraScan.ts
    guide/
      services/
        createMockAiGuideResult.ts
      types/
        AiGuideResult.ts
    location/
      hooks/
        useCurrentLocation.ts
  lib/
    theme/
      tokens.ts
```

## Development Notes

- Keep route files in `src/app/` and use Expo Router for navigation.
- Keep UI reusable primitives in `src/components/ui/`.
- Keep business logic in feature hooks and services instead of route components.
- Keep AI calls behind a backend when introduced later; do not place model API keys in the mobile app.
- Use Expo-managed APIs before adding native modules.

## Useful Commands

```bash
npm run start
npm run typecheck
```
