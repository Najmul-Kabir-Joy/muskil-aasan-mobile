# Testing

**Unit and component tests only.** No E2E, no Detox, no Maestro, no
Playwright, no full integration harness. If a change seems to need one of
those to be verified, that's a signal to make the unit underneath it more
testable, not a reason to add E2E infrastructure.

## Stack

- **Jest** via `jest-expo` preset (`jest.config.js`)
- **React Native Testing Library** (`@testing-library/react-native`)

Run with `npm test`, `npm run test:watch`, or `npm run test:coverage`.

## Important: `render()` is async

`@testing-library/react-native` v14 made `render()` return a `Promise`. Every
test that renders a component must `await` it:

```ts
it("renders the given label", async () => {
  const { getByText } = await render(<Badge label="Verified" />);
  expect(getByText("Verified")).toBeTruthy();
});
```

Forgetting `await` gives a confusing failure (`getByText is not a function`)
because `render()` silently returns an unresolved `Promise` instead of a
result object.

Prefer destructuring the return value of `render()` (`const { getByText } =
await render(...)`) over the global `screen` singleton — it's more explicit
about which render a query belongs to.

`rerender()` (from a `render()` result) is **also async** for the same
reason — `await rerender(<Updated />)` before asserting on the new output, or
the assertion runs against the pre-rerender tree.

## Testing navigation behavior

For a component whose only relevant behavior is _which_ `expo-router`
function it calls (e.g. `replace` vs. `push`), mock `expo-router` at the
module boundary rather than mounting a real navigation tree:

```ts
jest.mock("expo-router", () => ({ useRouter: jest.fn() }));
```

Then assert on the mock in each test. See
`src/features/marketplace/components.test.tsx` (RoleSwitch) for the pattern.
This is a boundary mock, not an implementation-detail mock — it's the same
category as mocking network/storage.

## What to test

- Domain/business logic (pure functions, validation, status/state mapping)
- Hooks with real behavior (state transitions, derived values)
- Component behavior: what renders under which props/state, and what happens
  on user interaction (press, type, submit)
- Regression tests for bug fixes — every bug fix should come with a test that
  would have caught it, when that's reasonably possible

## What not to test

- Implementation details (internal state shape, private helpers that aren't
  exported for a reason)
- That a component "exists" / renders without crashing, with no assertion
  about behavior
- Static styling, unless the styling itself communicates something (e.g. an
  error state changing a badge's tone is behavior worth asserting on; an
  exact `padding` value is not)
- Coverage percentage for its own sake. There is no target %. A file with low
  coverage because it's mostly static JSX is fine; a validation function with
  low coverage because its edge cases are untested is not.

## Conventions

- Tests live next to the code they test:
  `ui.tsx` → `ui.test.tsx`, `calculateJobStatus.ts` → `calculateJobStatus.test.ts`.
- Use realistic inputs, not placeholder junk (`"asdf"`) unless the test is
  specifically about handling garbage input.
- Avoid mocking anything you don't have to. Mock at the boundary (network,
  storage, native modules) — not the function you're actually testing.
- Reference examples: `src/shared/components/ui.test.tsx` (component
  rendering and accessibility behavior),
  `src/features/marketplace/status.test.ts` (pure domain-mapping functions),
  `src/features/marketplace/components.test.tsx` (navigation behavior via an
  `expo-router` boundary mock).

## Before installing a testing dependency

Verify it's compatible with the installed Expo SDK / React / React Native
versions first (check peer dependencies) — don't assume the latest major
version of a testing package works with the currently pinned React version.
