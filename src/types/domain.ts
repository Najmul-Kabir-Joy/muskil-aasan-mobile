/**
 * PROTOTYPE / MOCK domain types.
 *
 * Everything in this file describes the current UI prototype's mock data
 * shape only. It is NOT an approved MuSkill Aasan product specification.
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

// A completed MuSkill Aasan job connecting the current Job Provider to a
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

// A single previously completed MuSkill Aasan job used as the "Previous
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

// Whether a profile section or item shows to other people. The MVP has
// exactly two states: hidden content stays visible to its owner (marked as
// hidden) and never renders for anyone else. See
// docs/engineering/domain-and-terminology.md.
export type ProfileVisibility = "public" | "hidden";

// A completed MuSkill Aasan job between one Job Provider and one Job Seeker.
// The one record behind both the Provider's "Previous Job Posts" and the
// Seeker's "Previous Work & Feedback", so the same job never exists twice.
// The two sides' ratings are separate: the Provider receives stars only; the
// Seeker receives stars plus written feedback. Each side controls, on their
// own profile, whether the job shows publicly.
export type CompletedJob = {
  id: string;
  title: string;
  area: string;
  // Display date, e.g. "12 Oct" — a display string like `JobResponse`'s
  // `receivedAgo`, not a real Date.
  completedOn: string;
  providerId: string;
  seekerId: string;
  providerRating: number;
  seekerFeedback: Omit<SeekerFeedback, "jobTitle">;
  providerVisibility: ProfileVisibility;
  seekerVisibility: ProfileVisibility;
};

// A star rating averaged over `ratingCount` ratings. Stored rather than
// recomputed from the jobs a profile lists: a profile shows only some of a
// person's history, and hiding a job never removes its rating from the
// average.
export type RatingSummary = {
  rating: number;
  ratingCount: number;
};

// The profile sections that carry their own Public/Hidden control, per the
// finalized Profile Stitch designs.
export type ProfileSection =
  "providerReputation" | "previousJobPosts" | "seekerReputation" | "previousWork";

// One of the current user's own open job posts, as the Provider Profile
// shows it — with only a count of its (private) Responses.
export type CurrentJobPost = {
  task: Task;
  responseCount: number;
};

// A job request a Job Seeker has accepted (confirmed: the Provider sends a
// request to someone chosen from the Responses, and they must accept).
// Nothing here decides whether one job can have more than one — that's
// undefined — so a job simply lists every request accepted for it.
export type AcceptedJobRequest = {
  taskId: string;
  seekerId: string;
};

// The current Provider's own jobs, grouped the way My Jobs shows them.
// `open` and `inProgress` come from the prototype `TaskStatus` values (see
// `getProviderJobs` in src/data/mock.ts); `completed` comes from
// `CompletedJob` records. Not an approved lifecycle.
export type ProviderJobs = {
  open: CurrentJobPost[];
  inProgress: { task: Task; seekers: WorkerProfile[] }[];
  completed: { job: CompletedJob; seeker: WorkerProfile }[];
};

// Where one of the current Job Seeker's own Responses stands, as the
// prototype's Applications shows it. Only the confirmed steps exist: the
// Response was sent; the Provider chose them and sent a job request, which
// they must accept; they accepted it. NOT an approved lifecycle — declining,
// rejection, expiry, withdrawal and completion confirmation are undefined,
// so none of them exist here. Completed work comes from `CompletedJob`
// records, not from this.
export type SeekerApplicationStage = "responseSent" | "jobRequest" | "accepted";

// One Job the current Job Seeker responded to, with their private Response
// message (the only Response field the prototype has — the final
// application fields are undefined). Prototype state, not a backend contract.
export type SeekerApplication = {
  id: string;
  job: Task;
  message: string;
  // Relative display time, like `JobResponse.receivedAgo`.
  sentAgo: string;
  stage: SeekerApplicationStage;
};

// A photo placed in a profile frame (the profile photo or the cover), with
// the framing its owner chose. `zoom` (at least 1) scales the photo past
// "just fills the frame"; `offsetX`/`offsetY` move its centre by a fraction
// of the frame's width/height, so the same framing renders at any size.
export type ProfilePhoto = {
  uri: string;
  width: number;
  height: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
};

// One account's marketplace identity. The same person has a Provider side
// and a Seeker side; which one a profile shows comes from context (your own
// profile follows your current Job Provider / Job Seeker mode), never from a
// switch on the profile itself.
export type MarketplaceProfile = {
  id: string;
  name: string;
  area: string;
  // Shared by both sides — one account, one photo and cover.
  profilePhoto: ProfilePhoto | null;
  coverPhoto: ProfilePhoto | null;
  providerBio: string;
  seekerBio: string;
  providerRating: RatingSummary;
  seekerRating: RatingSummary & { completedJobs: number };
  // Labels from the app-wide `categories` list — never a separate taxonomy.
  canHelpWith: string[];
  currentJobPosts: CurrentJobPost[];
  jobsAsProvider: CompletedJob[];
  jobsAsSeeker: CompletedJob[];
  sectionVisibility: Record<ProfileSection, ProfileVisibility>;
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
