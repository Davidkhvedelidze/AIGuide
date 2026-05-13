# AI Guide

AI Guide is a new React Native application built with Expo.

## Tech Stack

- React Native
- Expo
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

## Project Structure

The app has not been scaffolded yet. A typical Expo structure for this project should look like:

```text
app/
  _layout.tsx
  index.tsx
assets/
components/
constants/
hooks/
package.json
app.json
tsconfig.json
```

Prefer Expo Router for navigation unless the project later chooses a different routing approach.

## Development Notes

- Keep screens small and compose them from reusable components.
- Put shared UI in `components/`.
- Put route-level screens in `app/` when using Expo Router.
- Keep API/client logic outside UI components when it grows beyond simple calls.
- Use TypeScript for new files.

## Useful Commands

After the project is scaffolded, keep these commands available in `package.json`:

```bash
npm run start
npm run lint
npm run test
npm run typecheck
```

## Status

Initial repository setup.
