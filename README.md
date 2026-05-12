# CipherForge

CipherForge is a static browser toolbox for cipher experiments, quick encoding work, SHA-256 hashing, and puzzle-text cleanup. It is designed for mystery, ARG, and geocaching-style solving workflows and runs fully in the browser with no backend or database.

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
