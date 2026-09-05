# CLAUDE.md

This file gives Claude Code operating instructions specific to this
repository. It does not restate engineering rules — those live in
[AGENTS.md](AGENTS.md), which is the canonical, tool-agnostic contract for
this project. Read it first.

## How to work here

1. **Read [AGENTS.md](AGENTS.md) first**, and the relevant file under
   `docs/engineering/` for the area you're touching (domain-and-terminology,
   architecture, code-style, testing, security, accessibility, git-workflow).
2. **Inspect before editing.** Look at the existing screen/component/feature
   you're changing and its neighbors before writing new code. Don't guess at
   conventions this repo already has an answer for.
3. **Use the repository skills** under `.claude/skills/` for repeatable
   workflows: `implement-feature`, `fix-bug`, `create-ui-component`,
   `write-unit-tests`, `review-change`. Each one is a checklist grounded in
   AGENTS.md — use the one matching your task.
4. **Never invent undefined Muskil Aasan product requirements** (payments,
   verification/NID, escrow, job lifecycle, cancellation, ratings, matching,
   location privacy, platform fees, trust guarantees), and never treat the
   prototype's mock domain types (`src/types/domain.ts`) as approved product
   truth. See AGENTS.md and
   [docs/engineering/domain-and-terminology.md](docs/engineering/domain-and-terminology.md).
   Ask instead of guessing.
5. **Run quality checks before finishing**: `npm run format:check`,
   `npm run lint`, `npm run typecheck`, `npm test`. Actually run them — never
   report a command passed without having run it in this session.
6. **Report exactly what changed and what verification was performed** —
   files touched, commands run, and their actual results. Call out anything
   you deliberately left undone and why.

This project is an early-stage prototype heading toward production. Preserve
working behavior; make the smallest coherent change; avoid unrelated
refactors — see AGENTS.md's "Core principle: avoid enterprise theater" and
"Working in this repo" sections for the full detail.
