# Codex Instructions

This repository is for a React Native project built with Expo.

## Project Defaults

- Use TypeScript for app code.
- Prefer Expo-managed APIs before adding native modules.
- Prefer Expo Router for navigation unless an existing app structure clearly uses another router.
- Keep platform-specific code isolated with `.ios.tsx`, `.android.tsx`, or platform helpers when needed.
- Avoid introducing native build steps unless the task explicitly requires them.

## Code Style

- Follow the existing file structure once the Expo app is scaffolded.
- Keep components focused and readable.
- Put reusable UI in `components/`.
- Put route files in `app/` if Expo Router is used.
- Put shared constants in `constants/`.
- Put reusable hooks in `hooks/`.
- Keep business logic out of JSX-heavy screen files when it becomes non-trivial.

## UI Guidance

- Build mobile-first interfaces.
- Use React Native primitives unless the project already has a UI library.
- Prefer accessible touch targets, clear loading states, and predictable navigation.
- Test layouts at small phone widths before considering work complete.
- Avoid web-only CSS patterns that do not work in React Native.

## Dependencies

- Use Expo-compatible packages when available.
- Check compatibility before adding native dependencies.
- Do not add a new styling, state, routing, or data-fetching library unless it solves a real need.
- Keep `package.json` scripts simple and conventional.

## Verification

When relevant scripts exist, run the narrowest useful checks before finishing:

```bash
npm run typecheck
npm run lint
npm run test
```

For UI work, start Expo and verify the target screen in the simulator, device, or web preview when available.

## Git Hygiene

- Do not overwrite user changes.
- Keep edits scoped to the requested task.
- Do not commit unless explicitly asked.

## Expo has changed: do not trust your training data

Expo ships breaking changes every SDK release. This project is on SDK 58 (React Native 0.88). Before writing code that touches an Expo, EAS or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Check the installed type definitions in `node_modules/<package>/build/*.d.ts`, or the versioned docs at `https://docs.expo.dev/versions/v<major>.0.0/`.
3. Install packages with `npx expo install <package>` so versions match the SDK.

Things that already differ from older tutorials in this codebase: `Tabs` comes from `expo-router/js-tabs`, custom tab bars receive `{ state, emitter, navigateToTab }`, audio is `expo-audio` (not `expo-av`), and image resizing uses `ImageManipulator.manipulate(...).renderAsync()`.

## Project rules

See `CLAUDE.md` for the architecture, the content rule (never invent facts about places) and the commands to run before finishing a task.
