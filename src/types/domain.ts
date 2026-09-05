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
