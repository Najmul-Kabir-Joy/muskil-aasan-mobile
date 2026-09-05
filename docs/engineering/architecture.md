# Architecture

Muskil Aasan is an Expo Router app. This document defines where code lives and why.

## Top-level layout

```
app/               Expo Router route definitions ONLY
src/
  features/        Feature modules (created on demand, see below)
  shared/
    components/ui/ Reusable, feature-agnostic UI primitives
    hooks/         Cross-feature hooks (created on demand)
    lib/           Cross-feature helpers (created on demand)
    services/      API/backend boundary (created on demand)
    config/        Runtime configuration (created on demand)
    constants/     Cross-feature constants (created on demand)
  theme/           Design tokens (colors, spacing, typography, radii)
  types/           Cross-feature domain types
```

Only create a directory when it has real content. An empty `shared/hooks/` that
exists "for later" is noise, not architecture. Add the folder in the same change
that adds its first file.

## Routes stay thin

Files under `app/` may:

- compose screens out of feature/shared components
- read navigation params (`useLocalSearchParams`, etc.)
- configure navigation (`Stack.Screen options`, tab bar config)
- delegate to feature hooks/components for behavior

Files under `app/` must not accumulate business logic, data fetching, or
validation. If a route file is doing more than wiring things together, extract
the logic into the owning feature.

Today every route under `app/(poster)/` and `app/(worker)/` is prototype UI
with local `useState` and mock data — that's fine for now. As real behavior
(mutations, validation, persistence) is added, it belongs in `src/features/<name>/`,
not inline in the route file.

## Features

A feature is a vertical slice: `src/features/<name>/` holds the components,
hooks, and types that only make sense for that feature (e.g. `jobs`,
`auth`, `chat`). Feature code can import from `shared/` and `theme/`, never the
other way around, and features should not import from each other — if two
features need the same thing, that's a signal to move it into `shared/`.

**No feature directories exist yet.** The current prototype has no code that is
exclusively about one feature — `app/(poster)/` and `app/(worker)/` are route
groups, not features, and all shared UI already lives in
`src/shared/components/ui.tsx`. Create the first `src/features/<name>/`
directory when a feature actually accumulates feature-specific logic (a hook,
a validation rule, a non-trivial component) — not preemptively.

## Shared layer

`src/shared/components/ui.tsx` currently holds every reusable primitive
(`Screen`, `Badge`, `PrimaryButton`, `SectionHeader`, etc.) as one file. Split
it into multiple files only when the file becomes genuinely hard to navigate —
don't split it today just to look tidy.

Promote something from a feature into `shared/` only once it has a second real
consumer. One usage is not a pattern; it's just where the code happens to live.

## Data and services

`src/data/mock.ts` holds static prototype fixtures consumed directly by
screens. This is acceptable for a pre-backend prototype, but it is not the
target architecture: once a real backend (e.g. Supabase) is introduced,
components must not query it directly.

Target shape once a backend exists:

```
component -> feature hook (use case) -> service (src/shared/services or src/features/<x>/services) -> backend client
```

Use the smallest boundary that keeps components ignorant of backend
implementation details — a single typed function per use case is enough to
start. Do not build repository/domain-object layers before there is a second
backend, a caching need, or a testing need that justifies them.

## Design tokens

`src/theme/tokens.ts` is the single source of truth for colors, spacing,
radii, shadows, and typography. See [code-style.md](./code-style.md) for the
naming rules. Screens must import tokens, never hardcode hex values or magic
numbers for spacing/typography.

## State ownership (for when it's needed)

The prototype currently only uses local component state (`useState`) and
static mock data — that's correct for its current behavior. When real state
needs appear, this is the intended split:

| Kind of state                 | Tool                    |
| ----------------------------- | ----------------------- |
| Server/remote data            | TanStack Query          |
| Cross-screen client state     | Zustand                 |
| Form state                    | React Hook Form         |
| Runtime/schema validation     | Zod                     |
| Local, single-screen UI state | `useState`/`useReducer` |

Do not install any of these libraries before a screen actually needs them, and
do not reach for a global store when the state is only read by one screen.
