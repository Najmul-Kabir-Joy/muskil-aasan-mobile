---
name: write-unit-tests
description: Use when asked to write or improve unit/component tests for existing code, or when a task requires adding tests for new logic. Do not use for E2E/integration testing — this repo intentionally only does unit and component tests.
---

# Write Unit Tests

Follow [testing.md](../../../docs/engineering/testing.md) for the full
conventions. This skill is the workflow, not a restatement of the rules.

## Steps

1. **Test public behavior**, not implementation details. Ask "what should
   this do from a caller's perspective," not "what does the internal code
   happen to do right now."
2. **Cover meaningful edge cases** for the behavior at hand — every branch of
   a status/tone mapping, every validation rule, boundary values — not just
   the happy path.
3. **Avoid unnecessary mocks.** Mock at real boundaries (network, storage,
   native modules) — don't mock the function or component you're actually
   testing, and don't mock something that would work fine unmocked in a unit
   test.
4. **Use realistic inputs.** Use data shaped like what the app actually
   produces (see `src/data/mock.ts` / `src/types/domain.ts` for realistic
   shapes), not arbitrary placeholder strings, unless the test is
   specifically about garbage-input handling.
5. **Remember the installed `@testing-library/react-native` is async-first**:
   `render()`, `rerender()`, and every `fireEvent.*` call (`.press`,
   `.changeText`, `.scroll`, etc.) return a `Promise` — always `await` them
   (`await render(...)`, `await fireEvent.press(...)`), and destructure query
   helpers from the resolved `render()` result. See
   `src/shared/components/ui.test.tsx` for the reference pattern.
6. **Place the test next to the code it tests**
   (`Thing.tsx` → `Thing.test.tsx`).
7. **Don't chase coverage percentage.** Meaningful assertions on real
   behavior matter more than touching every line.
8. **Run `npm test`** (and `npm run test:coverage` if reviewing overall
   coverage) and confirm the new tests actually fail without the
   implementation and pass with it, when writing a regression test.

Report which behaviors are now covered and the actual test run output.
