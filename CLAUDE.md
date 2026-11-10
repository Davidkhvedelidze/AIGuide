# AI Tour Guide

Point the camera at a landmark in Tbilisi, get it recognised, and hear a short story built only from checked facts. Read `docs/PRD.md` for scope and `AGENTS.md` for general coding rules.

## The one rule that matters

**Never invent facts about places.** Every sentence in a place's summary, story or highlights must be supported by an entry in that place's `facts`, and every fact needs a source URL. This applies to code, seed data, prompts and tests. `npm run content:validate` enforces part of it; a human review (`verified = true`) enforces the rest. Never use AI-generated images of real places.

## Stack

Expo SDK 58, React Native 0.88, TypeScript (strict), Expo Router, React Query, Zustand, Supabase (Postgres + PostGIS, Auth, Storage, Edge Functions on Deno). Styling is plain `StyleSheet` with tokens from `src/theme/tokens.ts`; there is no styling library.

## Layout

```
src/app/                 routes only (Expo Router). (tabs)/ = Guide, History, Map, Profile
src/components/ui/       design system: Text, Button, Card, Chip, ListRow, states
src/components/          TabBar + MiniPlayer, place rows, MapCanvas (.tsx native, .web.tsx schematic)
src/data/                types, api (demo + Supabase), queries, sync, seed/places.ts
src/features/audio/      player store (file / device speech / none) and sentence timeline
src/features/scan/       camera capture -> resize -> api.scan
src/store/               app settings + usage, library (saved, collections, history)
src/lib/                 pure helpers: geo, validatePlace
src/i18n/                en.ts is the source of keys, ka.ts must match it
supabase/migrations/     schema, RLS, nearby_places RPC
supabase/functions/      scan, tts, revenuecat-webhook, _shared/decision.ts (pure, unit tested)
scripts/                 content pipeline and scan evaluation (Node, run with tsx)
```

## How it runs

- **Demo mode** (no env vars): bundled seed places, no recognition (the nearest places are offered as candidates), the phone's own voice reads the transcript, purchases flip a local flag. This is what tests and a fresh clone use.
- **Connected mode** (`EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`): places come from Supabase (verified only), scans go to the `scan` edge function, limits and Pro are enforced on the server.

## Conventions

- Navigation: exactly four tabs. No hamburger menu. Header = back on the left, at most two actions on the right.
- Every screen handles loading, empty and error states with the shared components.
- Every interactive element has an accessibility label and a 44pt touch target.
- All user-facing strings go through `useT()`; add keys to `en.ts` and `ka.ts` together.
- Thresholds and limits live in `supabase/functions/_shared/decision.ts`; do not duplicate them.
- Secrets never go in `EXPO_PUBLIC_*` variables or in the app bundle.

## Before finishing a task

```bash
npm run typecheck
npm run lint
npm test
npm run content:validate   # when content changed
```

For UI work also run `npx expo export --platform web` (catches bundling errors) and look at the screen.
