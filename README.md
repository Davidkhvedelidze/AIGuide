# AI Tour Guide

AI Guide is a React Native application built with Expo. The mobile app captures a landmark photo with GPS context, then sends the scan to a Supabase Edge Function for secure backend analysis.

## Tech Stack

- React Native
- Expo
- TypeScript
- Supabase Edge Functions
- Supabase Storage and Postgres RPC
- OpenAI Responses API with vision input

## OpenAI Vision Scan Flow

The mobile app must only call the public Supabase Edge Function URL configured as `EXPO_PUBLIC_ANALYZE_SCAN_URL`. It sends `multipart/form-data` containing the scan photo, latitude, longitude, and locale. The app never receives or stores OpenAI or Supabase service-role secrets.

The `supabase/functions/analyze-scan` Edge Function performs the backend-only workflow:

1. Handles CORS, `OPTIONS`, and POST-only validation.
2. Validates the uploaded image and GPS coordinates.
3. Uploads the image to the private `scan-images` Supabase Storage bucket.
4. Creates a short-lived signed image URL for analysis.
5. Queries nearby landmark candidates with the `get_nearby_landmarks` RPC.
6. Sends only the signed image URL, coordinates, locale, and the nearest 8 minimized landmark candidate records to OpenAI.
7. Requires strict structured JSON output compatible with the app's `AiGuideResult` shape.
8. Saves the scan result to `scan_history` with the permanent storage path in `image_url` instead of persisting the temporary signed URL.
9. Returns a safe fallback result if OpenAI is unavailable or if the model output is invalid.

The AI prompt instructs the model to behave like a friendly local Georgian tour guide, use only the provided landmark candidates as the source of truth, avoid invented facts, and clearly mark uncertain matches.

## Required Supabase Secrets

Set these values as Supabase Edge Function secrets only:

- `OPENAI_API_KEY` — OpenAI API key used only by the Edge Function.
- `OPENAI_VISION_MODEL` — optional vision-capable OpenAI model override. If omitted, the function uses a current SDK-compatible default.
- `SUPABASE_URL` — Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service-role key used only by the Edge Function.

Never put `OPENAI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in Expo environment variables, `.env` files shipped to the app, or React Native source code. The mobile app should only use `EXPO_PUBLIC_ANALYZE_SCAN_URL` for the scan endpoint.

## Setting Secrets with Supabase CLI

From the project root, set secrets with the Supabase CLI:

```bash
supabase secrets set OPENAI_API_KEY=sk-your-openai-key
supabase secrets set OPENAI_VISION_MODEL=gpt-4.1-mini
supabase secrets set SUPABASE_URL=https://your-project-ref.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Deploy the Edge Function after secrets are configured:

```bash
supabase functions deploy analyze-scan
```

For local testing, use a local Supabase secrets file or export the same environment variables before serving the function.

## Testing the Scan Flow End-to-End

1. Confirm the `scan-images` bucket exists and the Edge Function service role can upload objects.
2. Confirm the `get_nearby_landmarks` RPC returns nearby candidates with the fields used by the function.
3. Confirm the `scan_history` table accepts:
   - `image_url`
   - `latitude`
   - `longitude`
   - `detected_landmark_id`
   - `confidence`
   - `ai_response`
   - `created_at`
4. Deploy `analyze-scan` and configure the mobile app with only:

```bash
EXPO_PUBLIC_ANALYZE_SCAN_URL=https://your-project-ref.functions.supabase.co/analyze-scan
```

5. Start the Expo app and perform a camera scan near a seeded landmark.
6. Verify the result screen displays the returned `AiGuideResult`, including a clear uncertain state when `isUncertain` is `true`.
7. Temporarily remove or change `OPENAI_API_KEY` in a non-production environment to verify fallback behavior. The function should still return a low-confidence, location-based result and save it to `scan_history`.

## Getting Started

Install dependencies once the Expo app is scaffolded:

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
A typical Expo structure for this project should look like:

```text
app/
  _layout.tsx
  index.tsx
assets/
components/
constants/
hooks/
supabase/
  functions/
    analyze-scan/
      index.ts
package.json
app.json
tsconfig.json
```

## Architecture Notes

The app follows a clean, feature-based architecture. Route files compose reusable UI and feature services, while business logic belongs in `features/*`, `hooks`, or `lib/services` as the app grows. Shared domain models live in `src/types` so API contracts and screens can use the same strongly typed language.

- Keep screens small and compose them from reusable components.
- Put shared UI in `components/`.
- Put route-level screens in `app/` when using Expo Router.
- Keep API/client logic outside UI components when it grows beyond simple calls.
- Use TypeScript for new files.
- Keep OpenAI and service-role secrets in Supabase Edge Function secrets only.

## Useful Commands

```bash
npm run start
npm run ios
npm run android
npm run web
npm run typecheck
```

## Status

Supabase Edge Function integration for secure OpenAI Vision landmark analysis has been added. The Expo app shell has not been scaffolded in this repository yet.
