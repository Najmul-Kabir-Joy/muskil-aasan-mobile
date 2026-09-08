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
  // ignore these.
  postedBy?: { name: string; area: string; verified?: boolean };
  postedAgo?: string;
  likes?: number;
  remote?: boolean;
  photoNote?: string;
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
