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
2. **Approved product requirements.** A small set of **high-level** product
   truths are confirmed (see below) — everything else is not. When a new
   requirement is approved, record it in the confirmed list, at the same
   altitude as the existing entries (a one-sentence truth, not an
   implementation spec).
3. **Intentionally undefined product decisions.** Do not implement or infer
   these from the prototype (list below).

If implementing a task requires assuming something not on the confirmed
list, stop and ask rather than guessing a plausible-sounding rule — see
AGENTS.md's "Do not invent product behavior."

### Confirmed high-level product requirements

These are approved. **"Confirmed" means the sentence itself is true — it
does not mean any implementation detail of _how_ it works is decided.** See
the explicit non-example after the list.

1. Muskill Asaan is a micro-job marketplace.
2. Initial market is Bangladesh.
3. Initial launch area is Dhaka.
4. There is currently no international launch plan.
5. A single user account can act as both a Job Provider and a Job Seeker.
6. Users should be able to switch easily between those two modes.
7. A Job Provider can post a small job/help request.
8. Job Seekers can discover jobs through a feed-like browsing experience.
9. A Job Seeker can privately respond/comment/apply to a job.
10. That response is visible only to the Job Provider / owner of that job.
11. A Job Provider can choose a Job Seeker from the responses.
12. The Provider can send that person a job request.
13. The selected Job Seeker must accept the job request.
14. Jobs may be local/physical or remote/online.
15. The platform is not limited to a single job type.
16. Categories will be used to organize jobs and improve discovery/onboarding.
17. Job Providers can broadly be anyone.
18. Job Seekers are broadly anyone looking to earn extra income.

**Confirmed requirement ≠ implementation detail.** For example, #11-13 confirm
that a provider-chooses-then-seeker-accepts flow exists at a high level — they
do **not** confirm: what happens while the selected seeker is deciding, whether
a provider can message/request multiple seekers at once, what fields a
response/application form has, what "accept" technically transitions in a
status machine, or what completion confirmation looks like. All of those are
still undefined (below), even though the surrounding high-level flow is
confirmed.

### Intentionally undefined product decisions

Do not implement or infer these from the prototype, and do not treat a
confirmed requirement above as deciding any of them:

- the final job lifecycle/status machine (states/transitions beyond the mock
  `TaskStatus` values)
- payments
- escrow
- pricing/bidding rules
- cancellation policy
- refunds
- disputes
- NID verification / identity verification requirements
- ratings/reviews
- matching/recommendation rules
- platform fees
- precise location privacy rules
- trust/safety guarantees
- whether a job can have multiple workers
- what happens while a selected Job Seeker is deciding whether to accept
- whether multiple Job Seekers can receive a job request simultaneously
- the exact fields on a response/application
- completion confirmation behavior

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
