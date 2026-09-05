---
name: review-change
description: Use when asked to review a diff, PR, or set of pending changes in this repository for quality before it's finalized or merged.
---

# Review Change

Follow [AGENTS.md](../../../AGENTS.md) and the relevant `docs/engineering/`
files as the standard to review against. This skill is the checklist, not a
restatement of the rules.

## Inspect

- **Correctness** — does the change do what it claims, including edge cases?
- **Type safety** — any new `any`, unsafe `as`, `@ts-ignore`, or `!` that
  isn't justified? Does `npm run typecheck` actually pass?
- **Architecture** — does new code respect the feature/shared boundary and
  keep route files thin (see
  [architecture.md](../../../docs/engineering/architecture.md))? Any
  unnecessary abstraction or premature promotion into `shared/`?
- **Duplication** — does this reinvent an existing shared component, token,
  or type instead of reusing it?
- **Security/privacy** — any secret, token, or sensitive value logged or
  hardcoded? Any client-only authorization check standing in for a real
  backend check? See
  [security.md](../../../docs/engineering/security.md).
- **Accessibility** — labels, roles, touch targets, color-not-sole-signal.
  See [accessibility.md](../../../docs/engineering/accessibility.md).
- **Test adequacy** — is new non-trivial logic actually tested? Do the tests
  assert behavior rather than implementation detail? See
  [testing.md](../../../docs/engineering/testing.md).
- **Error states** — are loading/empty/error states handled where the change
  fetches or mutates data?
- **Unnecessary complexity** — anything that reads as "enterprise theater"
  per AGENTS.md's core principle (unused abstraction layers, empty
  directories, speculative configurability)?
- **Accidental product assumptions** — does the change invent a payment,
  verification, escrow, job-lifecycle, cancellation, ratings, matching,
  location-privacy, or fee rule that wasn't actually specified? See
  AGENTS.md's "Do not invent product behavior."

## Report

List concrete findings, most important first. For each: what's wrong, why it
matters, and (if obvious) the fix. Don't pad the review with restated praise
for things that are simply correct — focus on what needs attention.
