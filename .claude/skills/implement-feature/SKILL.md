---
name: implement-feature
description: Use when asked to implement a new Muskil Aasan product feature or a non-trivial piece of new behavior in the app (a new screen, a new interaction, a new piece of feature logic). Not for one-line fixes (use fix-bug) or a single new reusable component with no feature logic (use create-ui-component).
---

# Implement Feature

Follow [AGENTS.md](../../../AGENTS.md) for all engineering rules. This skill
is the workflow, not a restatement of the rules.

## Steps

1. **Read the specification.** If the request leaves a product decision
   genuinely undefined (payments, verification/NID, escrow, job lifecycle,
   cancellation, ratings, matching, location privacy, fees — see AGENTS.md's
   "Do not invent product behavior") — stop and ask rather than guessing.
2. **Inspect the related feature/screens.** Read the existing route(s) under
   `app/`, any existing feature code under `src/features/`, the shared UI in
   `src/shared/components/ui.tsx`, and relevant types in `src/types/domain.ts`.
   Understand current patterns before adding new ones.
3. **Identify impacted boundaries.** Decide, per
   [architecture.md](../../../docs/engineering/architecture.md):
   - Does this belong in a route file (thin — composition/navigation only)?
   - Does it need a `src/features/<name>/` module? Only create one if this
     feature doesn't have one yet AND the logic is non-trivial enough to
     warrant its own home (a hook, real state, validation).
   - Does anything genuinely belong in `src/shared/`? Only if it already has
     (or will immediately have) more than one consumer.
4. **Write a short implementation plan** (mentally or in your response) before
   editing: which files change or get created, and why.
5. **Implement the minimal coherent change.** Use existing tokens
   (`src/theme/tokens.ts`), existing shared primitives, and existing domain
   types rather than reinventing them. Handle loading/empty/error states for
   anything that fetches or mutates data. Keep accessibility and both
   platforms (iOS/Android) in mind.
6. **Write/update unit tests** for any new non-trivial logic or component
   behavior — see [write-unit-tests](../write-unit-tests/SKILL.md) and
   [testing.md](../../../docs/engineering/testing.md).
7. **Run quality checks**: `npm run format:check`, `npm run lint`,
   `npm run typecheck`, `npm test`. Fix anything your change broke.
8. **Review your own diff** (`git diff`) before finishing: remove debug
   leftovers, confirm no unrelated files changed, confirm no product
   assumption was invented.

Report what you built, which files changed, and the actual output of the
checks you ran.
