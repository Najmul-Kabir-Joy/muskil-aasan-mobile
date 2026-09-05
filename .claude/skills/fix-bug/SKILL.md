---
name: fix-bug
description: Use when asked to fix a bug, crash, incorrect behavior, or visual defect in the app. Not for building new behavior (use implement-feature).
---

# Fix Bug

Follow [AGENTS.md](../../../AGENTS.md) for all engineering rules. This skill
is the workflow, not a restatement of the rules.

## Steps

1. **Reproduce/understand the problem** before changing anything. Read the
   relevant screen/component/hook and trace the actual behavior — don't guess
   at the cause from the symptom description alone.
2. **Identify the root cause**, not just where the symptom shows up. If the
   bug is "button doesn't do X," check whether the real problem is upstream
   (wrong data, wrong state, wrong assumption) before patching the visible
   symptom.
3. **Avoid a symptom-only fix.** If the smallest correct fix is upstream of
   where the bug was reported, fix it there — don't paper over it locally in
   a way that leaves the same class of bug reachable elsewhere.
4. **Add a regression test** that fails before the fix and passes after, when
   reasonably possible (see [testing.md](../../../docs/engineering/testing.md)).
   If a regression test genuinely isn't practical (e.g. a platform-specific
   native behavior), say so explicitly rather than skipping silently.
5. **Implement the smallest safe fix.** Don't refactor surrounding code while
   fixing an unrelated bug — file that as a separate concern if you notice it.
6. **Run quality checks**: `npm run format:check`, `npm run lint`,
   `npm run typecheck`, `npm test`.

Report the root cause, the fix, the regression test added (or why not), and
the actual output of the checks you ran.
