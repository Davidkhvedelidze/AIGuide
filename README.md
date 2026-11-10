# AI Tour Guide

Point your camera at a landmark in Tbilisi and hear its story. Built with Expo (React Native) and Supabase.

The app runs out of the box in **demo mode**: bundled places, no backend, the phone's voice reads the stories. Connect Supabase to turn on real recognition, accounts and narrated audio.

## Run it

```bash
npm install
npm run start        # then press i / a, or scan the QR code with Expo Go
npm run web          # browser preview (the map is a schematic there)
```

## Checks

```bash
npm run typecheck
npm run lint
npm test
npm run content:validate
```

## Where things are

- `docs/PRD.md`: what the product is and is not
- `docs/SETUP.md`: connecting Supabase, the model provider, maps, purchases
- `docs/RELEASE.md`: release checklist and store listing drafts
- `CLAUDE.md`: architecture and rules for AI coding agents
- `design/`: the original mockups

## Status

Working in demo mode: onboarding, camera scan flow, place pages, audio guide with transcript, map and nearby list, saved places, collections, history, profile, settings (English/Georgian), paywall screen.

Written but not yet exercised against live services: Supabase schema and edge functions (`scan`, `tts`, `revenuecat-webhook`), library sync, content import and review scripts. `docs/SETUP.md` lists what to connect and how to test each piece.

Content: 8 Tbilisi places, each with sourced facts, all still marked as drafts awaiting editorial review. No photos yet (real, licensed photos only).
