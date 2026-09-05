# Domain & Terminology

This document exists so that a mock type or a status value in the codebase
never gets silently read as an approved product decision. Read it before
implementing anything that touches job lifecycle, verification, offers, or
payments-adjacent behavior.

## Three categories — keep them separate

1. **Prototype/mock concepts (currently implemented).** Everything in
   `src/types/domain.ts` (`Role`, `Task`, `TaskStatus`, `Offer`,
   `OfferStatus`, `WorkerProfile`, `VerificationStatus`, `Category`) and the
   domain UI in `src/features/marketplace/` describe the current UI
   prototype's mock data shape. They exist to make the screens render
   something plausible. **They are not an approved product specification.**
2. **Approved product requirements.** At the time of writing, none of the
   business rules below have been approved beyond "Muskil Aasan is a
   micro-job marketplace connecting job providers and job seekers in Dhaka."
   If a future spec approves a concrete rule, record it here (or link to
   where it's recorded) so this stops being a hypothetical.
3. **Intentionally undefined product decisions.** Do not implement or infer
   these from the prototype:
   - payment behavior or pricing rules
   - verification rules or NID requirements
   - escrow behavior
   - the final job lifecycle (states/transitions beyond the mock
     `TaskStatus` values)
   - cancellation policy
   - ratings behavior
   - matching/recommendation rules
   - location privacy rules
   - platform fees
   - trust/safety guarantees

If implementing a task requires assuming one of these, stop and ask rather
than guessing a plausible-sounding rule — see AGENTS.md's "Do not invent
product behavior."

## Terminology

Product language has moved on from the prototype's original naming. Current
preferred terms:

| Preferred product term | Legacy/prototype term still in code | Where it appears                                                         |
| ---------------------- | ----------------------------------- | ------------------------------------------------------------------------ |
| Job Provider           | poster                              | `Role = "poster"`, route group `app/(poster)/`, `PosterHomeScreen`, etc. |
| Job Seeker             | worker / jobSeeker                  | `Role = "jobSeeker"`, route group `app/(worker)/`, `WorkerProfile` type  |
| Job                    | task                                | `Task` type, `TaskCard`, `TaskStatus`, `data/mock.ts`'s `tasks`          |
| Response / Application | offer                               | `Offer` type, `OfferCard`, `OfferStatus`                                 |

**This is documentation, not a rename mandate.** The legacy names above are
still what the code actually uses today, and that's deliberate — renaming all
of them is a broad, separate change with real risk (dozens of files, route
paths, mock data keys), not something to do as a side effect of an unrelated
task.

Rules going forward:

- Don't introduce a _third_ variant of any of these terms (e.g. don't start
  calling a job a "gig" or a "listing" in new code — pick from the table
  above, or use the existing legacy name if that's what the surrounding code
  already uses).
- New user-facing copy should prefer the preferred product term where it
  doesn't conflict with existing screen copy (most existing screen copy
  already says "job seeker" / "job" / "offer" — that's fine, it's close to
  the preferred terms already).
- A full rename (types, route groups, component names, mock data) is a
  dedicated follow-up task, not something to do incrementally inside
  unrelated changes — partial renames make the drift this document exists to
  prevent worse, not better.
