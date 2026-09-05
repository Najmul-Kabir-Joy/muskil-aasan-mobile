# Code Style

## Tooling

- **ESLint** (`eslint-config-expo` flat config, `eslint.config.js`) — `npm run lint`
- **Prettier** (`.prettierrc.json`) — `npm run format` / `npm run format:check`
- **TypeScript** strict mode — `npm run typecheck`

Formatting is Prettier's job, not a discussion topic. If Prettier and your
instinct disagree, run `npm run format` and move on.

## TypeScript

- `strict` mode stays on. Never weaken `tsconfig.json` to silence an error —
  fix the code instead.
- No `any` in production code without a comment explaining why it's
  unavoidable. Prefer `unknown` + narrowing for data of uncertain shape
  (API responses, JSON.parse results, etc.).
- No `@ts-ignore`, no unsafe `as` casts, no non-null assertions (`!`) as a way
  to silence the compiler. If you're certain a value can't be null, restructure
  the code so TypeScript can see that too.
- Let TypeScript infer obvious types. Don't annotate `const count: number = 0`
  — annotate function parameters, exported function return types when they
  aren't obvious, and anything the compiler genuinely can't infer.
- Types live next to the feature/domain they describe. Only put a type in
  `src/types/` when more than one feature genuinely needs it (this is why
  `domain.ts` — `Task`, `Offer`, `Category`, etc. — lives there today: it's
  consumed across poster and worker screens).
- No duplicate domain types. If you need a type that's a variant of an
  existing one, derive it (`Pick`, `Omit`, `Partial`) rather than retyping it.

## Imports

- Use the `@/*` path alias (maps to `src/*`) for anything under `src/`.
  Relative imports (`../../`) are for files within the same feature/folder.
- Group imports: external packages, then `@/*` imports, then relative imports.
  (ESLint/Prettier don't currently enforce ordering — use judgment, don't
  fight the tools over it.)

## Components

- One understandable responsibility per component. There's no line-count
  limit — a 250-line component that does one clear thing is fine; a 60-line
  component doing three unrelated things isn't.
- Extract a hook or a plain function when it measurably improves readability
  or makes something testable — not by default "just in case."
- Reusable, feature-agnostic primitives (buttons, badges, screen wrapper,
  etc.) live in `src/shared/components/ui.tsx`. Feature-specific components
  live with their feature.

## Design tokens

Reference `src/theme/tokens.ts`, never hardcode colors, spacing, or radii in a
screen or component. Name tokens by role, not by where they're used:

```
GOOD:  colors.primary, colors.surface, colors.textPrimary, colors.danger
BAD:   colors.greenButton, colors.homeCardGray
```

If a value you need doesn't exist as a token yet, add it to `tokens.ts` — don't
inline a hex code "just this once."

## Typography

`src/theme/tokens.ts` exports a small `typography` object
(`display`/`heading`/`body`/`caption`/`button`) for font/size/line-height
combinations that are genuinely reused across components. It is intentionally
not exhaustive — a component with a legitimately distinct one-off text size
(e.g. a card's price display) can keep its own literal style referencing
`fonts.*` directly rather than being forced into one of the five tokens.

For user-facing text, prefer `AppText`, `Heading`, `BodyText`, or
`CaptionText` (all in `src/shared/components/ui.tsx`) over a bare RN `Text`.
There is no global `Text.defaultProps` mutation in this app — plain `Text`
does not get the app's font automatically, so a bare `Text` with no
`fontFamily` in its own style will render in the OS default font. `AppText`
is the explicit, typed replacement for that old (removed) global-mutation
pattern.

## Hygiene

- No dead code, no unused imports (ESLint will flag both).
- No commented-out implementation left in the codebase — delete it; git
  history remembers it.
- `TODO` comments must say what's unfinished and why it's not done now, e.g.
  `// TODO: replace with real auth once backend session shape is defined`,
  not a bare `// TODO`.
- No stray `console.log` in production code paths. Logging should be
  intentional (see [security.md](./security.md) for what must never be
  logged).
