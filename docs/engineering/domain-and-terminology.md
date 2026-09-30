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

1. MuSkill Aasan is a micro-job marketplace.
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
19. The "Get Started" signup wizard is: Basic Info (required: name, area) →
    Identity verification (optional NID front/back photo + a verification
    selfie; this whole step is skippable) → phone/OTP verification (required)
    → a primary-interaction preference (optional; see #21).
20. "Log In" verifies phone/OTP first, then looks up whether the phone
    belongs to an existing account. An existing account goes straight to
    Home. A new account does **not** repeat phone/OTP verification, since
    Login already verified it, and is shown a "setup intro" screen
    (`app/setup-intro.tsx`) that leads into Basic Info → Identity → the
    primary-interaction preference (#21). That setup-intro screen has its
    own "I'll complete this later" action that defers the **entire**
    remaining setup — including Basic Info — defaulting to the Job Provider
    destination instead (#22). This is a deliberate exception scoped to this
    one screen: the separate "Get Started" wizard (#19, reached directly
    from Welcome, no setup-intro screen involved) still has no way to bypass
    Basic Info.
21. After the numbered onboarding steps, both flows show a silent (uncounted
    in the "Step X of Y" progress), skippable "How would you like to use
    it?" preference with three outcomes — Job Provider leaning, Job Seeker
    leaning (which reveals a category picker capped at 5 selections), or no
    preference (#22). This is an **initial preference only**, never an
    exclusive account type: per #5-6, every account can still act as both
    Job Provider and Job Seeker regardless of what is chosen here or later.
22. If no preference is recorded — skipped, deferred via setup-intro's "I'll
    complete this later", or an existing user with nothing on record — the
    prototype defaults to the Job Provider destination (decided 2026-09-09;
    see `PROTOTYPE_DEFAULT_ROUTE` in `src/shared/constants/routes.ts`). This
    is a prototype navigation default, not a statement that Job Provider is
    the real product's default mode long-term.
23. Every account has two separate reputations — a Provider Rating and a
    Seeker Rating — that are never combined. Provider Ratings are stars only
    (no public written feedback in the MVP); Seeker Ratings are stars plus
    written feedback, shown without identifying who wrote it.
24. Profile content is either Public or Hidden (MVP). Hidden content stays
    visible to its owner, marked as hidden, and never shows to anyone else.
    Hiding a rated item never removes its rating from the aggregate.
25. A profile has no Provider / Seeker switch of its own. Your own profile
    shows the side that matches your current app mode (Job Provider →
    Provider Profile, Job Seeker → Seeker Profile); mode is switched from
    the navigation drawer. Someone else's profile shows the side its entry
    point is about (e.g. a Response opens the Seeker side).
26. Profile edits happen in place on the profile — no separate Edit Profile
    screen: the owner changes their profile photo and cover photo (with
    cropping) and their bio directly on it.

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
- ratings/reviews beyond #23–24 (who can rate whom and when, how the
  aggregate is calculated, editing or disputing a rating)
- matching/recommendation rules
- platform fees
- precise location privacy rules
- trust/safety guarantees
- whether a job can have multiple workers
- what happens while a selected Job Seeker is deciding whether to accept
- whether multiple Job Seekers can receive a job request simultaneously
- the exact fields on a response/application
- completion confirmation behavior
- any consequence of completing or skipping identity verification (access,
  trust signals, or otherwise)

Note: the _prototype's navigation default_ for "no preference recorded" is
decided (#22, Job Provider) — but that is a UI routing choice for this
prototype, not a decision about the real product's eventual default
mode/experience, which remains open.

### Prototype-only mechanics (not product decisions)

The current signup/login screens are UI-and-navigation only. The following
exist purely to make that UI runnable in a backend-free prototype, and must
not be read as approved behavior:

- **Dummy phone/user lookup.** `isDummyExistingUser` in
  `src/features/auth/dummyAuth.ts` treats one hardcoded phone number as an
  "existing" account. There is no real user database.
- **Dummy OTP.** `isDummyOtpCorrect` accepts one hardcoded 6-digit code
  (`123456`). There is no real SMS provider or OTP service.
- **No backend or auth provider.** Nothing in this flow persists a session,
  calls a real API, or implements real authentication.
- **Landing routes after onboarding.** `src/shared/constants/routes.ts`
  defines `PROTOTYPE_PROVIDER_ROUTE` and `PROTOTYPE_SEEKER_ROUTE` (the
  existing "poster"/"worker" prototype areas) and `PROTOTYPE_DEFAULT_ROUTE`
  (currently an alias for `PROTOTYPE_PROVIDER_ROUTE` — see #22), used
  whenever no preference is recorded, including for existing users, who have
  no stored preference in this prototype.
- **Identity verification consequences.** Completing or skipping the
  Identity step has no effect beyond the UI state of that screen; no
  verification status, badge, or access change is implemented or implied.

## Terminology

Product language has moved on from the prototype's original naming. Current
preferred terms:

| Preferred product term | Legacy/prototype term still in code | Where it appears                                                         |
| ---------------------- | ----------------------------------- | ------------------------------------------------------------------------ |
| Job Provider           | poster                              | `Role = "poster"`, route group `app/(poster)/`, `PosterHomeScreen`, etc. |
| Job Seeker             | worker / jobSeeker                  | `Role = "jobSeeker"`, route group `app/(worker)/`, `WorkerProfile` type  |
| Job                    | task                                | `Task` type, `TaskCard`, `TaskStatus`, `data/mock.ts`'s `tasks`          |
| Response / Application | offer                               | `Offer` type, `OfferCard`, `OfferStatus`                                 |

`JobResponse` (`src/types/domain.ts`), added for the Provider Responses feature
(`src/features/marketplace/responses/`), is the current preferred-terminology
shape for a Job Seeker's response to a job. It is deliberately separate from
the legacy `Offer` type (which models a bid — `amount`, `estimatedTime`,
`status` — none of which apply to a plain response) rather than overloading
`Offer`'s fields. `Offer`/`OfferCard` remain in place for the Job Seeker's own
Offers screen (`app/(worker)/offers.tsx`), which still uses them — this is
not a signal to migrate it. The Provider's My Jobs route
(`app/(poster)/tasks.tsx`) no longer uses them; it renders the My Jobs
screen described below.

The Profile feature (`src/features/marketplace/profile/`) adds its own
prototype shapes in `src/types/domain.ts`: `MarketplaceProfile` (one
account's Provider and Seeker sides), `CompletedJob` (one completed job
between a Provider and a Seeker — the single record behind the Provider's
Previous Job Posts, the Seeker's Previous Work & Feedback, each Response's
previous-work preview and Refer Someone eligibility), and
`ProfileVisibility`. Aggregate ratings are stored `RatingSummary` values, not
recalculated from the jobs a profile lists. Like the rest of that file, these
are mock shapes, not backend contracts.

My Jobs (`src/features/marketplace/my-jobs/`, rendered by
`app/(poster)/tasks.tsx`) groups the Provider's jobs as
`ProviderJobs` — Open, In progress, Completed — using prototype `TaskStatus`
mappings plus `AcceptedJobRequest` (a job request the Job Seeker accepted,
per #12–13). It shows no lifecycle actions and no "waiting for the Job Seeker
to accept" stage, because those behaviors are still undefined (see below).

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
