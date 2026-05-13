# AI Tour Guide

AI Tour Guide is an Expo React Native TypeScript application scaffolded for a privacy-conscious landmark scanning and AI guide experience.

## Tech Stack

- Expo + React Native
- Expo Router with routes under `src/app`
- TypeScript in strict mode
- NativeWind for utility-first React Native styling

## Getting Started

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npm run start
```

Run TypeScript checks:

```bash
npm run typecheck
```

## Project Structure

```text
src/
  app/                         Expo Router route files
    _layout.tsx                Shared navigation stack and status bar
    index.tsx                  Home screen
    onboarding.tsx             Product onboarding
    camera-scan.tsx            Camera scan entry point
    result.tsx                 Landmark result screen
    nearby.tsx                 Nearby landmark discovery
    ask-guide.tsx              AI guide question screen
  components/
    ui/                        Reusable typed UI primitives
  features/
    ai-guide/                  AI guide feature boundary
    camera/                    Camera scanning feature boundary
    landmarks/                 Landmark data and services
    location/                  Location feature boundary
  lib/
    config/                    Runtime configuration
    constants/                 Shared constants such as routes
    logger/                    Safe logging abstraction
    services/                  Framework-independent shared services
  styles/                      NativeWind global stylesheet
  types/                       Domain and API result types
```

## Architecture Notes

The app follows a clean, feature-based architecture. Route files compose reusable UI and feature services, while business logic belongs in `features/*`, `hooks`, or `lib/services` as the app grows. Shared domain models live in `src/types` so API contracts and screens can use the same strongly typed language.

AI provider secrets must never be embedded in the mobile app. Any OpenAI or other AI provider call should be made by a backend service that performs authentication, rate limiting, prompt management, retrieval, response validation, and safe error mapping before returning data to the client.

## Useful Commands

```bash
npm run start
npm run ios
npm run android
npm run web
npm run typecheck
```
