import {
  categories,
  communityTasks,
  completedReferralJobs,
  getActiveJob,
  getEligibleReferrals,
  getJobsWithResponses,
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

    expect(eligible).toHaveLength(completedReferralJobs.length);
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
