# Testing

**Unit and component tests only.** No E2E, no Detox, no Maestro, no
Playwright, no full integration harness. If a change seems to need one of
those to be verified, that's a signal to make the unit underneath it more
testable, not a reason to add E2E infrastructure.

## Stack

- **Jest** via `jest-expo` preset (`jest.config.js`)
- **React Native Testing Library** (`@testing-library/react-native`)

Run with `npm test`, `npm run test:watch`, or `npm run test:coverage`.

## Important: the installed RNTL version is async-first

The currently installed `@testing-library/react-native` (v14) made its core
APIs return `Promise`s. Every test using any of these must `await` them:

- **`render()`** returns `Promise<RenderResult>`.
- **`rerender()`** (from a `render()` result) returns `Promise<void>`.
- **`fireEvent.press`/`fireEvent.changeText`/`fireEvent.scroll`/etc.** each
  return `Promise<void>` — `await fireEvent.press(button)`, not
  `fireEvent.press(button)`.

```ts
it("calls onPress when tapped", async () => {
  const onPress = jest.fn();
  const { getByRole } = await render(<ActionButton label="Confirm" onPress={onPress} />);

  await fireEvent.press(getByRole("button", { name: "Confirm" }));

  expect(onPress).toHaveBeenCalledTimes(1);
});
```

Forgetting `await` on `render()` gives a confusing failure (`getByText is not
a function`) because it silently returns an unresolved `Promise` instead of a
result object. Forgetting it on `fireEvent.*` is worse — the call still
"succeeds" (no error), but the interaction may not have flushed before your
assertion runs, so a test can pass or fail depending on timing rather than on
whether the behavior is actually correct.

If this project ever upgrades `@testing-library/react-native` to a version
with a different (e.g. sync) API, update this section to match the actually
installed version — don't leave stale async guidance around a sync API, or
vice versa.

Prefer destructuring the return value of `render()` (`const { getByText } =
await render(...)`) over the global `screen` singleton — it's more explicit
about which render a query belongs to.

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

Note: `@testing-library/react-native` v14's real peer dependency is a package
literally named **`test-renderer`** (by the RNTL maintainer, the modern
replacement for React's now-legacy `react-test-renderer`) — not
`react-test-renderer`. `test-renderer` is what's declared in this project's
`devDependencies`. `react-test-renderer` still ends up in `node_modules`
transitively (via `jest-expo`'s own dependency on it), but nothing in this
project imports it directly, and it should not be re-added as an explicit
devDependency.
