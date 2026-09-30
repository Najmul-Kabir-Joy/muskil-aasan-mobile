import {
  CURRENT_USER_ID,
  categories,
  communityTasks,
  completedJobs,
  completedReferralJobs,
  getActiveJob,
  getCurrentUserProfile,
  getEligibleReferrals,
  getJobsWithResponses,
  getMarketplaceProfile,
  getResponseWithJob,
  jobResponses,
  tasks,
  workers,
} from "@/data/mock";
import type { JobResponse } from "@/types/domain";

describe("communityTasks", () => {
  it("uses only labels from the shared app-wide category list, not invented broader categories", () => {
    const validLabels = categories.map((category) => category.label);

    for (const task of communityTasks) {
      expect(validLabels).toContain(task.category);
    }
  });
});

describe("getEligibleReferrals", () => {
  it("derives eligibility strictly from completedReferralJobs, not a hardcoded list", () => {
    const eligible = getEligibleReferrals();
    const referableWorkerIds = new Set(completedReferralJobs.map((job) => job.workerId));

    expect(eligible.map(({ worker }) => worker.id).sort()).toEqual([...referableWorkerIds].sort());
    for (const { worker, jobTitle } of eligible) {
      expect(
        completedReferralJobs.some(
          (completed) => completed.workerId === worker.id && completed.jobTitle === jobTitle,
        ),
      ).toBe(true);
    }
  });

  it("only returns real, existing workers, using their real categories (no invented taxonomy)", () => {
    const validLabels = categories.map((category) => category.label);

    for (const { worker } of getEligibleReferrals()) {
      expect(workers).toContainEqual(worker);
      for (const category of worker.categories) {
        expect(validLabels).toContain(category);
      }
    }
  });

  it("is non-empty by default, so the canonical Refer Someone flow has eligible people to show", () => {
    expect(getEligibleReferrals().length).toBeGreaterThan(0);
  });

  it("returns one entry per worker even if they appear in multiple completed jobs", () => {
    const eligible = getEligibleReferrals([
      { workerId: "w1", jobTitle: "Ceiling fan repair" },
      { workerId: "w1", jobTitle: "AC servicing" },
      { workerId: "w1", jobTitle: "Wiring fix" },
      { workerId: "w3", jobTitle: "Logo design for home bakery" },
    ]);

    expect(eligible).toHaveLength(2);
    const worker1Entries = eligible.filter(({ worker }) => worker.id === "w1");
    expect(worker1Entries).toHaveLength(1);
    // Keeps the most recent job as the referral example, not the first.
    expect(worker1Entries[0].jobTitle).toBe("Wiring fix");
  });
});

describe("getActiveJob", () => {
  it("returns the current Provider's first non-completed job", () => {
    expect(getActiveJob()).toEqual(tasks.find((task) => task.status !== "completed"));
  });
});

describe("getJobsWithResponses", () => {
  it("groups responses under the correct job, not mixed across jobs", () => {
    const responses: JobResponse[] = [
      { ...jobResponses[0], id: "x1", taskId: "t1" },
      { ...jobResponses[0], id: "x2", taskId: "t2" },
      { ...jobResponses[0], id: "x3", taskId: "t1" },
    ];

    const grouped = getJobsWithResponses(responses);

    const t1Group = grouped.find((group) => group.task.id === "t1");
    const t2Group = grouped.find((group) => group.task.id === "t2");
    expect(t1Group?.responses.map((r) => r.id).sort()).toEqual(["x1", "x3"]);
    expect(t2Group?.responses.map((r) => r.id)).toEqual(["x2"]);
  });

  it("is empty when there are no responses, driving the Responses List's empty state", () => {
    expect(getJobsWithResponses([])).toEqual([]);
  });

  it("derives response counts from the actual grouped list, not a separate stored count", () => {
    const grouped = getJobsWithResponses();

    for (const { task, responses } of grouped) {
      expect(responses.every((response) => response.taskId === task.id)).toBe(true);
    }
  });

  it("is non-empty by default, so the canonical Responses List has jobs to show", () => {
    expect(getJobsWithResponses().length).toBeGreaterThan(0);
  });
});

describe("getResponseWithJob", () => {
  it("returns the response and the job it was made on", () => {
    const match = getResponseWithJob(jobResponses[0].id);

    expect(match?.response).toEqual(jobResponses[0]);
    expect(match?.task.id).toBe(jobResponses[0].taskId);
  });

  it("returns undefined for an id that doesn't match any response", () => {
    expect(getResponseWithJob("not-a-real-id")).toBeUndefined();
  });
});

describe("completedJobs", () => {
  it("drives Refer Someone eligibility: only Seekers the current user completed a job with", () => {
    const providedByCurrentUser = completedJobs.filter((job) => job.providerId === CURRENT_USER_ID);

    expect(completedReferralJobs).toEqual(
      providedByCurrentUser.map((job) => ({ workerId: job.seekerId, jobTitle: job.title })),
    );
  });

  it("is the source of every Response's previous-work preview, so the two can't disagree", () => {
    for (const response of jobResponses) {
      const job = completedJobs.find(
        (candidate) =>
          candidate.seekerId === response.worker.id &&
          candidate.title === response.previousWork.jobTitle,
      );

      expect(job?.seekerFeedback).toEqual({
        rating: response.previousWork.rating,
        comment: response.previousWork.comment,
      });
    }
  });

  it("only connects real accounts, and never a person to themselves", () => {
    const accountIds = workers.map((worker) => worker.id);

    for (const job of completedJobs) {
      expect(accountIds).toContain(job.providerId);
      expect(accountIds).toContain(job.seekerId);
      expect(job.providerId).not.toBe(job.seekerId);
    }
  });
});

describe("getCurrentUserProfile", () => {
  const profile = getCurrentUserProfile();

  it("is one account with both a Provider side and a Seeker side", () => {
    expect(profile.id).toBe(CURRENT_USER_ID);
    expect(profile.jobsAsProvider.length).toBeGreaterThan(0);
    expect(profile.jobsAsSeeker.length).toBeGreaterThan(0);
    expect(profile.jobsAsProvider.every((job) => job.providerId === CURRENT_USER_ID)).toBe(true);
    expect(profile.jobsAsSeeker.every((job) => job.seekerId === CURRENT_USER_ID)).toBe(true);
  });

  it("lists previous jobs newest first", () => {
    const provided = completedJobs.filter((job) => job.providerId === CURRENT_USER_ID);

    expect(profile.jobsAsProvider).toEqual([...provided].reverse());
  });

  it("shows only the current user's own open posts as Current Job Posts, with their real Response counts", () => {
    for (const { task, responseCount } of profile.currentJobPosts) {
      expect(tasks).toContainEqual(task);
      expect(["open", "offer received"]).toContain(task.status);
      expect(responseCount).toBe(
        jobResponses.filter((response) => response.taskId === task.id).length,
      );
    }
    expect(profile.currentJobPosts.length).toBeGreaterThan(0);
  });

  it("includes at least one hidden item on each side, so the owner's hidden state is exercised", () => {
    expect(profile.jobsAsProvider.some((job) => job.providerVisibility === "hidden")).toBe(true);
    expect(profile.jobsAsSeeker.some((job) => job.seekerVisibility === "hidden")).toBe(true);
  });
});

describe("getMarketplaceProfile", () => {
  it("uses the same Seeker Rating the Responses screens show for that person", () => {
    const worker = workers[0];
    const profile = getMarketplaceProfile(worker.id);

    expect(profile?.name).toBe(worker.name);
    expect(profile?.seekerRating).toEqual({
      rating: worker.rating,
      ratingCount: worker.ratingCount,
      completedJobs: worker.completedJobs,
    });
  });

  it("has no current job posts for anyone but the current user, since no one else's posts are modelled", () => {
    for (const worker of workers.filter((candidate) => candidate.id !== CURRENT_USER_ID)) {
      expect(getMarketplaceProfile(worker.id)?.currentJobPosts).toEqual([]);
    }
  });

  it("uses only the app-wide category list for Can Help With", () => {
    const validLabels = categories.map((category) => category.label);

    for (const worker of workers) {
      for (const label of getMarketplaceProfile(worker.id)?.canHelpWith ?? []) {
        expect(validLabels).toContain(label);
      }
    }
  });

  it("returns undefined for an unknown id", () => {
    expect(getMarketplaceProfile("not-a-real-id")).toBeUndefined();
  });
});
