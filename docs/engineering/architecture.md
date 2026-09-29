# Architecture

MuSkill Aasan is an Expo Router app. This document defines where code lives and
why. For what the domain types/terms in this codebase do and don't mean as
product truth, see
[domain-and-terminology.md](./domain-and-terminology.md) first.

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

`src/features/marketplace/` is the first (and currently only) feature
directory. It holds the domain-specific UI and pure logic tied to the
prototype's task/offer/category/role concepts (`RoleSwitch`, `TaskCard`,
`OfferCard`, `CategoryTile`, `statusTone`, `verificationLabel`) — used by both
`app/(poster)/` and `app/(worker)/`, since both route groups interact with the
same underlying marketplace domain. It is **not** approved product
terminology or lifecycle — see
[domain-and-terminology.md](./domain-and-terminology.md).

Create a new `src/features/<name>/` directory only when a feature actually
accumulates its own logic (a hook, a validation rule, a non-trivial
component) — not preemptively.

## Shared layer

`src/shared/components/ui.tsx` holds feature-agnostic reusable primitives
only: page shells (`Screen`, `ScrollScreen`), typography (`AppText`,
`Heading`, `BodyText`, `CaptionText`), and generic controls/surfaces
(`Badge`, `PrimaryButton`, `ActionButton`, `SelectableChip`, `SectionHeader`,
`EmptyState`, `Timeline`, `AppHeader`). It must not depend on
`src/types/domain.ts` or contain marketplace-specific logic — that's what
`src/features/marketplace/` is for. Split `ui.tsx` into multiple files only
when it becomes genuinely hard to navigate — don't split it today just to
look tidy.

Promote something from a feature into `shared/` only once it has a second real
consumer. One usage is not a pattern; it's just where the code happens to live.

## Screen vs. ScrollScreen

- **`ScrollScreen`** — safe area + `ScrollView`. Use for ordinary stacked
  content and forms. This is what every current prototype screen uses.
- **`Screen`** — safe area + a plain `View`, no scrolling. Use this for a
  screen whose content is a virtualized list — render a `FlatList` directly
  inside it. Never nest a `FlatList`/`VirtualizedList` inside `ScrollScreen`
  (double-virtualization breaks scroll performance and, on some RN versions,
  warns or crashes).

`Screen` is also the right shell for a screen that needs its own scrollable
body plus a fixed (non-scrolling) footer, such as a sticky CTA — put a
`ScrollView` and the footer inside it (see `ProviderResponseDetailScreen`).
Pass `padded={false}` when the screen needs full-bleed regions (e.g. a
sub-header bar spanning the whole width) and applies its own gutters. Nothing
renders a `FlatList` yet — `Screen` exists so the first list/feed screen
doesn't have to fight `ScrollScreen`'s `ScrollView`.

Both take `edges`: a screen inside the Provider shell (whose header and
bottom navigation already own the top and bottom insets) passes
`["left", "right"]`.

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
radii, shadows, and typography (`typography.display/heading/body/caption/button`).
See [code-style.md](./code-style.md) for the naming rules. Screens must
import tokens, never hardcode hex values or magic numbers for
spacing/typography — and prefer the `AppText`/`Heading`/`BodyText`/
`CaptionText` primitives in `src/shared/components/ui.tsx` over a bare RN
`Text` for user-facing copy.

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
