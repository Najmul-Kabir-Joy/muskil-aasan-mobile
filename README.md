# Muskill Asaan Mobile

> **Proprietary source-available code — all rights reserved.** This project
> is not open source. Viewing the code does not grant permission to reuse,
> modify, redistribute, or deploy it. See [LICENSE](LICENSE).

Expo + React Native prototype for the Muskill Asaan micro-job marketplace
(Bangladesh, initially Dhaka).

## Stack

- Expo SDK 54, Expo Router
- React Native 0.81, React 19
- TypeScript (strict)

## Engineering standards

This repo has a defined engineering foundation for contributors and coding
agents (Claude, Codex, Cursor). Start with **[AGENTS.md](AGENTS.md)** — the
canonical engineering contract — and [docs/engineering/](docs/engineering/)
for architecture, code style, testing, security, and accessibility rules.

## Current scope

- Two-mode role selection and onboarding placeholder
- Poster home, task posting stepper, and task/offers screen
- Job seeker jobs, offers, and earnings placeholders
- Shared task status timeline
- Profile and support/report flow
- Mock domain data for tasks, offers, job seekers, categories, and timeline events

There is no backend, authentication, or payments integration yet — all data is
static mock data (`src/data/mock.ts`).

## Getting started

```bash
npm install
npm start
```

Scan the QR code with **Expo Go** for the fastest local loop, or run a native
target directly:

```bash
npm run android   # requires a JDK and the Android SDK/emulator set up
npm run ios       # requires Xcode and the iOS Simulator (macOS only)
npm run web
```

## Checks

There is no hosted CI for this repository right now (deliberately — see
[git-workflow.md](docs/engineering/git-workflow.md)). Run these locally
before opening a PR:

```bash
npm run format:check    # Prettier — check only (npm run format to fix drift)
npm run lint             # ESLint
npm run typecheck          # tsc --noEmit
npm test                     # Jest unit/component tests
npm run test:coverage           # Jest with coverage report
```

## License and permitted use

Copyright (c) 2026 Md. Najmul Kabir. All rights reserved.

This is proprietary, source-available software, **not open-source software**.
Access to the code is provided for inspection and evaluation only. No
permission is granted to run, copy, modify, redistribute, or deploy it
without the copyright holder's prior written authorization, except as
permitted by applicable law or GitHub's Terms of Service.

The setup commands above are for the repository owner and authorized
contributors; they do not grant additional rights. See [LICENSE](LICENSE)
for the full notice.
