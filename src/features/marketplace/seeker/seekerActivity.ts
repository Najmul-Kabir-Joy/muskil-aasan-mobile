import type { SeekerApplication, Task } from "@/types/domain";

// Pure helpers behind the Job Seeker's prototype state (saved Jobs and
// Applications) — kept apart from the React context so the rules are
// testable on their own. Prototype behavior only; see
// docs/engineering/domain-and-terminology.md.

// The quick filters above the Home feed: everything, Remote jobs, or one
// category from the app-wide list. One at a time, so the rail stays simple.
export type JobFilter = { kind: "all" } | { kind: "remote" } | { kind: "category"; label: string };

export const ALL_JOBS: JobFilter = { kind: "all" };

// Adds a job to the front of the saved list, or removes it if it's there.
export function toggleSavedJob(saved: Task[], job: Task): Task[] {
  return saved.some((candidate) => candidate.id === job.id)
    ? saved.filter((candidate) => candidate.id !== job.id)
    : [job, ...saved];
}

export function isJobSaved(saved: Task[], jobId: string) {
  return saved.some((job) => job.id === jobId);
}

export function applicationForJob(applications: SeekerApplication[], jobId: string) {
  return applications.find((application) => application.job.id === jobId);
}

// Records a new private Response, newest first. One Response per job: a job
// that already has one is left as it is (editing or withdrawing a Response
// isn't defined).
export function addResponse(
  applications: SeekerApplication[],
  job: Task,
  message: string,
): SeekerApplication[] {
  const trimmed = message.trim();
  if (!trimmed || applicationForJob(applications, job.id)) return applications;
  return [
    { id: `response-${job.id}`, job, message: trimmed, sentAgo: "Just now", stage: "responseSent" },
    ...applications,
  ];
}

// The Job Seeker accepts a job request they received (confirmed: they must
// accept it). Only a pending job request can be accepted.
export function acceptJobRequest(
  applications: SeekerApplication[],
  applicationId: string,
): SeekerApplication[] {
  return applications.map((application) =>
    application.id === applicationId && application.stage === "jobRequest"
      ? { ...application, stage: "accepted" }
      : application,
  );
}

// Applications grouped the way the Applications screen shows them: what
// needs an answer first, then accepted jobs, then Responses still waiting.
export function groupApplications(applications: SeekerApplication[]) {
  return {
    jobRequests: applications.filter((application) => application.stage === "jobRequest"),
    accepted: applications.filter((application) => application.stage === "accepted"),
    responsesSent: applications.filter((application) => application.stage === "responseSent"),
  };
}

// Plain text match over what a card shows (title, category, area,
// description) — not a ranking or recommendation.
export function filterJobs(jobs: Task[], query: string, filter: JobFilter): Task[] {
  const needle = query.trim().toLowerCase();
  return jobs.filter((job) => {
    if (filter.kind === "remote" && !job.remote) return false;
    if (filter.kind === "category" && job.category !== filter.label) return false;
    if (!needle) return true;
    return [job.title, job.category, job.area, job.description]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });
}

// The categories that have at least one job, in the app-wide list's order,
// so the rail never offers a filter that can only come up empty.
export function categoriesWithJobs(jobs: Task[], categoryOrder: string[]): string[] {
  const present = new Set(jobs.map((job) => job.category));
  return categoryOrder.filter((label) => present.has(label));
}
