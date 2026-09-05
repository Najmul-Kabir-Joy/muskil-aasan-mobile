# Git Workflow

This is an early-stage, small-team project. The goal is clean history that's
easy to review and easy to `git blame` later — not process for its own sake.

## Changes

- Keep changes small and focused. One logical change per commit/PR:
  a feature, a bug fix, or a tooling change — not several at once.
- Don't combine a feature with an unrelated refactor or a drive-by
  reformatting pass. If you notice something else worth fixing while working,
  either do it as a separate follow-up commit or flag it rather than folding
  it in silently.
- Formatting-only changes (Prettier) should be their own commit if they touch
  files unrelated to the actual change, so reviewers can skip them.

## Commit messages

- Describe _why_, not just _what_, when the reason isn't obvious from the
  diff.
- Reference the relevant feature/area in the summary line
  (e.g. `jobs: fix offer count not updating after accept`).

## When to update docs

Update the relevant file under `docs/engineering/` in the same change when
you introduce a new convention, a new architectural boundary, or a decision
future contributors need to know about (e.g. "we now use Zustand for X"). Docs
that drift from reality are worse than no docs — keep them in sync.

## Review expectations

Before opening a PR, the change should pass:

```
npm run format:check
npm run lint
npm run typecheck
npm test
```

(`npm run format:check` fails on formatting drift — run `npm run format` to
fix it. All four run in CI on every PR; see `.github/workflows/ci.yml`.)
