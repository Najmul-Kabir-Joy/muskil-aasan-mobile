# Accessibility

Accessibility is a requirement for every screen that ships, not a follow-up
task. MuSkill Aasan's users include people relying on screen readers and people
with limited literacy in one of the app's two languages — accessible UI and
usable UI overlap heavily here.

## Shared interactive primitives already handle this

`PrimaryButton`, `ActionButton` and `SelectableChip` (in
`src/shared/components/ui.tsx`) already set `accessibilityRole="button"` and the relevant
`accessibilityState` (`disabled`, `selected`) internally. Building a new
interactive control on `Pressable` should follow the same pattern — set the
role and state on the component itself, not ad hoc in every screen that uses
it.

## Rules

- **Labels**: add `accessibilityLabel` only when the visible text doesn't
  already say what the element does (e.g. an icon-only button). If a
  `Pressable` wraps visible text like "Post a new task", that text is already
  the accessible name — don't add a redundant `accessibilityLabel="Post a new
task button"` on top of it.
- **Roles**: interactive elements should expose the right `accessibilityRole`
  (`button`, `link`, `header`, etc.) so screen readers announce them
  correctly.
- **Touch targets**: interactive elements need a comfortably tappable area
  (roughly 44x44pt minimum). Pad small icon buttons rather than shrinking the
  hit area to match a small icon.
- **Color is never the only signal.** A status badge that's only
  distinguished by color (e.g. green vs. red) must also differ in text/icon —
  see the existing `Badge` tone + label pattern in
  `src/shared/components/ui.tsx` for the convention to follow.
- **Dynamic text**: don't build layouts that break when text scales up
  (respect the user's font size settings where practical) or when Bangla text
  runs longer than the English equivalent — see
  [localization notes in AGENTS.md](../../AGENTS.md).
- **Forms**: inputs need associated labels, sensible `keyboardType`, and
  clear, immediate error messaging tied to the field that failed — not just a
  generic banner at the top of the screen.
- **Focus/error handling**: when a form submission fails, move focus/attention
  to the first error rather than leaving the user to hunt for it.
- **Contrast**: text must be readable against its background at the token
  values defined in `src/theme/tokens.ts`. If a new token is added, check its
  contrast against the surfaces it will sit on before using it for text.

## What not to do

Don't sprinkle `accessibilityLabel` everywhere reflexively — a label that
duplicates visible text adds noise for screen reader users rather than
helping them.
