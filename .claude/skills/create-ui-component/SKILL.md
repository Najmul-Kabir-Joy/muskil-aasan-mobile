---
name: create-ui-component
description: Use when asked to create a new reusable UI component or primitive for the app (button variant, card, badge, input, etc.). Not for a one-off piece of screen layout that has exactly one consumer and no reuse need.
---

# Create UI Component

Follow [AGENTS.md](../../../AGENTS.md) and
[code-style.md](../../../docs/engineering/code-style.md) for all engineering
rules. This skill is the workflow, not a restatement of the rules.

## Steps

1. **Search for an existing reusable primitive first.** Check
   `src/shared/components/ui.tsx` for something that already does this or is
   close enough to extend with a prop, rather than creating a near-duplicate.
2. **Decide where it belongs**, per
   [architecture.md](../../../docs/engineering/architecture.md):
   - Feature-agnostic and reusable → `src/shared/components/ui.tsx` (or a new
     file there if the existing file has grown unwieldy).
   - Specific to one feature's domain → lives with that feature, not shared.
   - Used by exactly one screen with no near-term second consumer → it can
     just live in that screen; don't promote it to shared preemptively.
3. **Use design tokens** (`src/theme/tokens.ts`) for every color, spacing,
   radius, shadow, and font value — never a hardcoded visual constant. If a
   needed token doesn't exist, add it to `tokens.ts` rather than inlining a
   value.
4. **Define a typed, minimal props API.** Prefer inference where TypeScript
   already knows the type; annotate what it can't infer. Avoid a prop for
   every hypothetical variation — add props when a real caller needs them.
5. **Support accessibility**: correct `accessibilityRole`, a label only when
   visible text doesn't already provide one, adequate touch target size. See
   [accessibility.md](../../../docs/engineering/accessibility.md).
6. **Avoid premature abstraction.** Don't build a generic, infinitely
   configurable component for a single current use case — extend it when the
   second real use case arrives.
7. **Add behavioral tests when appropriate** — what renders under which
   props, what happens on interaction. Skip tests for pure static markup with
   no conditional behavior. See
   [write-unit-tests](../write-unit-tests/SKILL.md).
8. **Run quality checks**: `npm run format:check`, `npm run lint`,
   `npm run typecheck`, `npm test`.

Report where the component lives and why, its props API, and the actual
output of the checks you ran.
