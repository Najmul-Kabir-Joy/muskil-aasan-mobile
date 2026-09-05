# AGENTS.md — Muskil Aasan Mobile

This is the canonical, tool-agnostic engineering contract for this repository.
Claude, Codex, Cursor, and human contributors all follow this document. Tool-
specific files (`CLAUDE.md`, `.cursor/rules/`, `.claude/skills/`) add operating
detail for their tool but do not restate these rules — this file is the source
of truth.

## What this is

Muskil Aasan is a consumer mobile micro-job marketplace for Bangladesh
(initially Dhaka), built with **React Native + Expo + TypeScript** (Expo
Router, Expo SDK 54, React 19, RN 0.81). It is intended to become a real
production application. The repository is currently an early-stage prototype:
static mock data, no backend, no auth, no payments — see
[docs/engineering/architecture.md](docs/engineering/architecture.md) for what
exists today versus what's planned.

The product's visual design is being defined separately (see the Stitch
design system referenced in project notes). Do not invent final visual design
values — see "Design tokens" below.

## Engineering documentation

| Topic                                                          | File                                                                                     |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Prototype domain types vs. approved product truth, terminology | [docs/engineering/domain-and-terminology.md](docs/engineering/domain-and-terminology.md) |
| Architecture, folder layout, feature boundaries                | [docs/engineering/architecture.md](docs/engineering/architecture.md)                     |
| TypeScript, imports, component conventions, tokens             | [docs/engineering/code-style.md](docs/engineering/code-style.md)                         |
| Unit testing setup and conventions                             | [docs/engineering/testing.md](docs/engineering/testing.md)                               |
| Security & privacy                                             | [docs/engineering/security.md](docs/engineering/security.md)                             |
| Accessibility                                                  | [docs/engineering/accessibility.md](docs/engineering/accessibility.md)                   |
| Git/PR hygiene                                                 | [docs/engineering/git-workflow.md](docs/engineering/git-workflow.md)                     |

Read the relevant doc before touching that area. This file gives the rules
that cut across all of them plus agent-specific operating instructions.

## Core principle: avoid enterprise theater

We want production-quality engineering, not enterprise-looking complexity.
Choose the simplest architecture that can evolve cleanly. Concretely, do not
introduce (without a real, current need):

- dependency injection frameworks, abstract factories, repository layers with
  a single implementation
- event buses, elaborate DDD ceremony, premature monorepo structure
- empty directories created "for later"
- wrapper abstractions around a library with only one call site
- global state management before local state is insufficient
- generated boilerplate with no current consumer

Scalability means the codebase can grow safely — it does not mean building
infrastructure for a million users today.

## Working in this repo

### Before implementation

- Inspect the relevant existing files, neighboring code, and current
  patterns before writing anything. Don't guess at project conventions or
  library APIs — check how they're already used here.
- Identify reusable existing code (shared UI in
  `src/shared/components/ui.tsx`, existing types in `src/types/domain.ts`,
  existing tokens in `src/theme/tokens.ts`) before adding something new.

### During implementation

- Make the smallest coherent change that accomplishes the task.
- Preserve existing behavior unless the change is intentionally about
  changing that behavior.
- Follow the feature/shared boundary in
  [architecture.md](docs/engineering/architecture.md). Don't add unrelated
  refactors, drive-by formatting rewrites, or "while I'm here" cleanups to an
  otherwise-focused change — flag them instead (or do them separately).
- Don't rewrite working code to match a different style preference with no
  functional benefit.
- Avoid speculative abstractions and unused infrastructure.
- Handle loading/empty/error states for anything that fetches or mutates
  data — see error handling rules below.
- Keep accessibility in mind (see accessibility.md) and keep both iOS and
  Android in mind — don't assume one platform's behavior for touch targets,
  safe areas, or keyboard handling.
- Use design tokens (`src/theme/tokens.ts`), never hardcoded visual values.

### After implementation

Run, in order, and actually report the results:

```
npm run format:check   # or npm run format to fix drift
npm run lint
npm run typecheck
npm test
```

Run the full test suite when reasonable, not just a single new test file.
Inspect your own diff (`git diff`) before calling the change done — remove
accidental/debug changes, stray `console.log`s, and anything unrelated to the
task. Update the relevant `docs/engineering/*.md` file if you introduced or
changed a convention.

**Never claim a command passed unless you actually ran it in this session and
saw the result.** If a command can't be run (e.g. no simulator available),
say so explicitly rather than assuming success.

## TypeScript

Strict mode stays on; never weaken `tsconfig.json` to silence an error. No
`any` without a documented reason, no `@ts-ignore`, no unsafe `as`, no `!`
non-null assertions. Full rules: [code-style.md](docs/engineering/code-style.md).

## State management

| Kind of state                 | Tool                    |
| ----------------------------- | ----------------------- |
| Server/remote data            | TanStack Query          |
| Cross-screen client state     | Zustand                 |
| Form state                    | React Hook Form         |
| Runtime/schema validation     | Zod                     |
| Local, single-screen UI state | `useState`/`useReducer` |

None of these libraries are installed yet, and that's correct for the
prototype's current behavior — do not add them speculatively. Add a library
from this table only when a screen actually needs what it provides, and only
that library.

## Data and services

Never let a component query a backend directly. The intended shape once a
real backend exists:

```
component -> feature hook (use case) -> service -> backend client
```

Use the smallest boundary that keeps components ignorant of backend
implementation details. Don't build a full repository/domain layer before a
second backend or a real testing/caching need justifies it. Full rules:
[architecture.md](docs/engineering/architecture.md).

## Error handling

- Never silently swallow an error — surface it (user-facing message, thrown
  error, or explicit handling), don't just log-and-continue.
- Never show raw backend/system error text to users; map it to a clear,
  user-facing message.
- Every screen that fetches/mutates data needs a defined loading state, empty
  state, and error state — don't leave one implicit.
- Distinguish retryable failures (network blip — offer retry) from
  non-retryable ones (validation failure — explain what to fix).
- No scattered `console.log` in production code paths. Logging should be
  intentional and should make future error-monitoring integration
  (Sentry or similar) straightforward to add later — don't build that
  integration now.

## Security & privacy

Full rules: [security.md](docs/engineering/security.md). The essentials:

- Never commit secrets. Public Expo env vars (`EXPO_PUBLIC_*`) are public —
  never put a secret behind one.
- Authorization is enforced on the backend. Client-side role/mode checks are
  UX, not security.
- Validate untrusted external data at the boundary.
- Sensitive local values (tokens, session IDs) use secure storage, not plain
  `AsyncStorage`.
- Never log auth tokens, OTPs, NIDs, full phone numbers, or precise location
  beyond what a feature needs.

## Accessibility

Full rules: [accessibility.md](docs/engineering/accessibility.md). Don't add
a redundant `accessibilityLabel` when visible text already provides it; do add
one when it doesn't (icon-only controls). Color is never the sole way status
is communicated. Touch targets need real tappable area.

## Localization readiness

Muskil Aasan targets English and Bangla. Don't design components or layouts
that assume short, fixed-length English strings — Bangla text and mixed-script
rendering can run longer. Don't concatenate translated sentence fragments
(`"Post " + count + " tasks"`) — that breaks translation and grammar. A full
i18n library is not being introduced yet; just don't architect _against_
adding one later.

## Performance

Optimize sensibly, not preemptively:

- Virtualize genuinely large lists (`FlatList`/`FlashList`), not short ones.
- Don't do expensive computation inside render.
- Don't reach for `useMemo`/`useCallback` mechanically on every value/function
  — use them when there's a measurable rerender or referential-equality
  problem.
- Optimize images (appropriate size/format) rather than shipping originals.
- Measure before adding complex optimization. "Production-ready" doesn't mean
  "prematurely optimized."

## Dependencies

npm is the package manager (`package-lock.json` is the lockfile — don't
introduce pnpm/yarn lockfiles). Before adding a dependency, check:

1. Does the platform/Expo SDK already provide this?
2. Is it actively maintained?
3. Is it compatible with the installed Expo SDK / React / React Native
   version? (Check peer dependencies — don't assume latest-major works.)
4. Does it meaningfully reduce complexity versus the alternative?

Use `npx expo install <pkg>` for Expo-managed packages so the SDK-compatible
version is selected automatically. Don't upgrade Expo/React Native as a side
effect of an unrelated change — if an upgrade is genuinely necessary, explain
why first.

**Follow-up (not part of routine changes):** this repo is on Expo SDK 54 /
RN 0.81. An Expo SDK upgrade should happen as its own dedicated, isolated
change — with `npx expo-doctor` and a full manual test pass — before serious
feature development ramps up, so any compatibility issues surface on their
own rather than mixed into an unrelated feature or cleanup.

## Testing

Unit and component tests only — no E2E/Detox/Maestro/Playwright. Full rules
and the `render()`-is-async gotcha: [testing.md](docs/engineering/testing.md).
Every non-trivial piece of domain logic needs tests; every bug fix should come
with a regression test when reasonably possible. Don't chase a coverage
percentage.

## Do not invent product behavior

Many Muskil Aasan product decisions are intentionally undefined right now.
**Nothing currently implemented in `src/types/domain.ts` or
`src/features/marketplace/` is an approved product requirement — it's
prototype/mock data that makes the screens render something plausible.** See
[domain-and-terminology.md](docs/engineering/domain-and-terminology.md) for
the full distinction between prototype concepts, approved requirements, and
undefined decisions, and for current preferred product terminology. When a
task would require assuming one of the following, stop and ask rather than
inventing an answer:

- payment behavior or pricing rules
- verification rules or NID requirements
- escrow behavior
- job lifecycle rules — **note:** the states in `src/types/domain.ts`
  (`TaskStatus`, `OfferStatus`, etc.) are prototype/mock data only, not
  approved product truth; don't treat a status existing there as license to
  build real behavior around it. See
  [domain-and-terminology.md](docs/engineering/domain-and-terminology.md).
- cancellation policy
- ratings behavior
- matching/recommendation rules
- location privacy rules
- platform fees
- trust/safety guarantees

If a task is genuinely ambiguous on a product decision, ask for clarification
rather than guessing plausible-sounding business rules.

## Commands reference

```
npm start              # expo start
npm run android         # expo start --android
npm run ios             # expo start --ios
npm run web              # expo start --web
npm run lint              # eslint
npm run typecheck          # tsc --noEmit
npm test                    # jest
npm run test:coverage        # jest --coverage
npm run format                 # prettier --write .
npm run format:check            # prettier --check .
```

## Repeatable workflows (skills)

For Claude Code, repeatable workflows are captured as skills under
`.claude/skills/` (`implement-feature`, `fix-bug`, `create-ui-component`,
`write-unit-tests`, `review-change`). They encode the same rules in this file
as concrete step-by-step checklists — use them for their named task type
regardless of which tool you are.
