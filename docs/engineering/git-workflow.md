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

## Quality gate: local, not hosted CI

This repository deliberately has **no hosted CI** (no GitHub Actions, no
other cloud CI provider) right now, to avoid any CI cost while the project is
still a pre-product prototype. That is a decision, not an oversight — don't
add one without it being explicitly asked for.

The quality gate is local instead. Before a change is considered complete —
contributor or AI agent — actually run:

```
npm run format:check
npm run lint
npm run typecheck
npm test
```

(`npm run format:check` fails on formatting drift — run `npm run format` to
fix it, then rerun all four.) Nothing enforces this automatically on a PR;
running it is part of finishing the change, the same way it's part of
finishing the change to actually test the app.

## Branch workflow

The recommended path for any change is:

```
feature branch -> local quality checks -> PR -> review -> merge to main
```

- Prefer a feature branch + PR over developing directly on `main`, even for
  small changes — it gives the change a place for review before it lands.
- Run the local checks above before opening the PR (and again if you push
  more commits to it).
- `main` currently has **no GitHub branch protection** configured — nothing
  technically blocks a direct push. That's a known, accepted gap for now
  (see AGENTS.md's dependencies/follow-ups), not something to work around by
  skipping review; it just means the PR flow above is a convention to follow
  voluntarily rather than one GitHub enforces. Don't treat the lack of
  branch protection as a blocker for development, and don't configure it
  yourself as a side effect of an unrelated change — it can be revisited
  deliberately later.
