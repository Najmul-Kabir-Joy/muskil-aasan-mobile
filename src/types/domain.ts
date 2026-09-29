/**
 * PROTOTYPE / MOCK domain types.
 *
 * Everything in this file describes the current UI prototype's mock data
 * shape only. It is NOT an approved Muskill Asaan product specification.
 * Job lifecycle, verification, offer/response flow, and every status enum
 * below can (and likely will) change once real product/business rules are
 * defined — do not treat a status value existing here as evidence that the
 * corresponding behavior is approved.
 *
 * See docs/engineering/domain-and-terminology.md for:
 * - the distinction between prototype concepts, approved product
 *   requirements, and intentionally undefined product decisions
 * - current preferred product terminology (Job Provider / Job Seeker / Job /
 *   Response) vs. the legacy prototype names still used in this file
 */

export type Role = "poster" | "jobSeeker";

export type TaskStatus =
  | "draft"
  | "open"
  | "offer received"
  | "hired"
  | "in progress"
  | "completion requested"
  | "completed"
  | "cancelled"
  | "disputed";

export type OfferStatus =
  "submitted" | "viewed" | "withdrawn" | "rejected" | "accepted" | "expired";

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export type Category = {
  id: string;
  label: string;
  icon: string;
  example: string;
};

export type WorkerProfile = {
  id: string;
  name: string;
  rating: number;
  // How many ratings `rating` is an average of — distinct from
  // `completedJobs` (total jobs done), since not every completed job is
  // necessarily rated. Shown alongside `rating` wherever a Job Seeker's
  // public rating appears (e.g. "4.8 · 19 ratings").
  ratingCount: number;
  completedJobs: number;
  area: string;
  verification: VerificationStatus;
  categories: string[];
};

export type Task = {
  id: string;
  title: string;
  category: string;
  budget: string;
  area: string;
  timing: string;
  status: TaskStatus;
  urgent: boolean;
  offerCount: number;
  description: string;
  // Optional — only set for tasks shown in the Provider Home "Community
  // Jobs" feed (a task posted by someone other than the current viewer,
  // rendered in a social-feed layout). Existing task list/detail screens
  // ignore these. `responseCount` is a distinct concept from `offerCount`
  // (which means offers/applications elsewhere) — it's the feed's own
  // comment/response count and must not be conflated with `offerCount`.
  postedBy?: { name: string; area: string };
  postedAgo?: string;
  likes?: number;
  responseCount?: number;
  remote?: boolean;
  photoNote?: string;
};

// A completed Muskill Asaan job connecting the current Job Provider to a
// specific Job Seeker they worked with — the only thing that can make that
// Job Seeker eligible to be referred on a Community Job (see
// `getEligibleReferrals` in src/data/mock.ts and
// docs/engineering/domain-and-terminology.md). Referral eligibility must be
// derived from records like this rather than hardcoded per screen.
export type CompletedReferralJob = {
  workerId: string;
  jobTitle: string;
};

// One Job Seeker eligible to be referred, with the specific completed job
// that makes them eligible — the shape `getEligibleReferrals` returns.
export type EligibleReferral = {
  worker: WorkerProfile;
  jobTitle: string;
};

// A single previously completed Muskill Asaan job used as the "Previous
// Work & Feedback" preview on a Job Seeker's response — deliberately
// anonymous (no reviewer identity) and stars-only-plus-comment, distinct
// from the Job Provider's own reputation system (Provider ratings are
// stars-only, no written feedback). See
// docs/engineering/domain-and-terminology.md.
export type SeekerFeedback = {
  jobTitle: string;
  rating: number;
  comment: string;
};

// A Job Seeker's private response to a specific Job Provider's job —
// visible only to that job's owner. Kept as its own small type rather than
// reusing `Offer` (which models a legacy bid: amount/estimatedTime/status,
// none of which apply to a plain Response) — see
// docs/engineering/domain-and-terminology.md's Offer/Response distinction.
export type JobResponse = {
  id: string;
  taskId: string;
  worker: WorkerProfile;
  message: string;
  // Relative time string, e.g. "25m ago" — matches `Task.postedAgo`'s own
  // convention rather than a real Date, consistent with this prototype's
  // other relative-time fields.
  receivedAgo: string;
  previousWork: SeekerFeedback;
};

// One Provider job grouped with the Responses it has received — the
// Responses List's own unit of grouping, returned by
// `getJobsWithResponses` in src/data/mock.ts.
export type JobWithResponses = {
  task: Task;
  responses: JobResponse[];
};

export type Offer = {
  id: string;
  taskId: string;
  worker: WorkerProfile;
  amount: string;
  estimatedTime: string;
  message: string;
  status: OfferStatus;
};

export type TimelineEvent = {
  label: string;
  detail: string;
  completed: boolean;
};
