# CipherBox

CipherBox is a static browser toolbox for cipher experiments, quick encoding work, SHA-256 hashing, and puzzle-text cleanup. It is designed for mystery, ARG, and geocaching-style solving workflows and runs fully in the browser with no backend or database.

## Features

- Caesar cipher with configurable shift and ROT13 shortcut
- Vigenere cipher with key sanitizing and punctuation preservation
- SHA-256 hashing via the browser Web Crypto API
- Base64, hex, and binary encode/decode helpers
- Text cleanup utilities for spacing, case transforms, reverse text, and counts
- Copy buttons, clear actions, responsive layout, and local-only execution

## Local development

Requirements:

- Node.js 20 or newer
- React, React DOM, React Native, and TypeScript versions are pinned to the Expo SDK 55 toolchain expectations. Check `npx expo-doctor` before changing them.

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

## Android app with Expo

An Expo wrapper lives in [`mobile`](./mobile). It uses `react-native-webview` to package the existing CipherBox web app as an Android app while keeping the web app as the single source of truth.

Install the mobile dependencies:

```bash
cd mobile
npm install
```

Run on Android:

```bash
npm run android
```

Run with Expo Go on a phone:

```bash
npm run go
```

Then open Expo Go on your Android phone and scan the QR code shown in the terminal. If your phone cannot reach your computer on the same Wi-Fi network, use the tunnel command instead:

```bash
npm run go:tunnel
```

By default the app loads:

```text
https://nebularc18.github.io/CipherBox/
```

To point the Android app at another deployed URL or a local dev server, set `EXPO_PUBLIC_CIPHERBOX_URL` in `mobile/.env`:

```bash
EXPO_PUBLIC_CIPHERBOX_URL=http://10.0.2.2:5173/
```

`10.0.2.2` reaches your computer's localhost from the Android emulator. For a physical Android device, use your computer's LAN IP instead.

Native Android builds enable cleartext HTTP only for non-production builds when `EXPO_PUBLIC_CIPHERFORGE_URL` starts with `http://`. Production builds remain HTTPS-only.

Build an Android APK/AAB with EAS:

```bash
cd mobile
npm run build:android
```

## Build

Create a production build:

```bash
npm run build
```

Run helper tests:

```bash
npm test
```

Preview the built app locally:

```bash
npm run preview
```

## GitHub Pages deployment

This project includes [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) for GitHub Pages deployment with GitHub Actions.

The Vite base path is configured automatically during GitHub Actions builds using the repository name from `GITHUB_REPOSITORY`. If that variable is unavailable, it falls back to `/cipherforge/`.

### Setup steps

1. Push this repository to GitHub.
2. Open the repository on GitHub.
3. Go to `Settings` -> `Pages`.
4. Under `Build and deployment`, set `Source` to `GitHub Actions`.
5. If Pages has never been enabled for the repository, save the Pages settings once in the GitHub UI before running the workflow. The default workflow token may not have permission to create the Pages site automatically.
6. Push to `main` or run the workflow manually.

The app will then be published under a repository path like:

```text
https://USERNAME.github.io/cipherforge/
```

## Notes

- All tools run entirely in the browser.
- No secret keys, external APIs, backend services, or paid integrations are used.
