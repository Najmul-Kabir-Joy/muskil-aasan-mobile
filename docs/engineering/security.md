# Security & Privacy

Muskil Aasan will eventually handle user identity, location, payments-adjacent
data, and marketplace trust signals (verification, ratings). Treat privacy and
security as first-class from the start, even while the app is a prototype.

## Secrets

- Never commit secrets. No API keys, tokens, service credentials, or
  `.env` files with real values in git.
- When environment configuration is introduced, add a `.env.example` with
  placeholder values and document required variables there — don't just
  assume contributors will guess.
- Anything exposed via Expo's public env mechanism (`EXPO_PUBLIC_*`) is
  bundled into the client and **is public**. Never put a secret behind an
  `EXPO_PUBLIC_*` variable. Server-only secrets belong on the backend, never
  in the mobile app.

## Backend trust boundary

- Authorization is enforced on the backend. A client-side check (e.g. "only
  posters can see this button") is UX convenience, not a security control —
  assume any request can be made by a modified client and design backend
  authorization accordingly.
- Validate all untrusted external data (API responses, deep link params, user
  input) at the boundary before using it. Prefer parsing into a known shape
  over trusting `response.data.whatever` directly.
- Sanitize/validate user-controlled values before using them in navigation,
  storage keys, or anything rendered as markup.

## Local storage

- Use secure storage (`expo-secure-store`, not `AsyncStorage`) for anything
  sensitive: auth tokens, session identifiers, personally identifying data.
  Plain `AsyncStorage` is unencrypted disk storage — fine for non-sensitive
  UI preferences, not for credentials.

## Logging

- Never log authentication tokens, passwords, OTPs, national ID numbers, or
  full phone numbers.
- Don't log full user objects "just in case" — log the specific field you
  need to debug.
- Location data is sensitive by default — log at the granularity you actually
  need (e.g. area name), not raw coordinates, unless actively debugging
  location logic.

## Location & identity (Muskil Aasan specifics)

- Don't expose more location precision than a feature requires. A job feed
  showing "Mirpur, Dhaka" doesn't need exact GPS coordinates rendered or
  transmitted if the feature doesn't need them.
- Do not invent verification/NID/escrow implementation details — see
  `AGENTS.md` for the list of product behaviors that must not be assumed.
  Security review of those flows happens when they're actually specified.

## What this repo is not doing yet

This document describes rules, not infrastructure. There is no auth system,
secure storage usage, or backend client in the repository yet — these rules
exist so that when those pieces are built, they're built correctly the first
time, not retrofitted.
