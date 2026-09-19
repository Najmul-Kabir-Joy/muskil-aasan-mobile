import {
  categories,
  communityTasks,
  completedReferralJobs,
  getEligibleReferrals,
  workers,
} from "@/data/mock";

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
