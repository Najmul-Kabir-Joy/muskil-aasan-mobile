import {
  ALL_JOBS,
  acceptJobRequest,
  addResponse,
  applicationForJob,
  categoriesWithJobs,
  filterJobs,
  groupApplications,
  isJobSaved,
  toggleSavedJob,
} from "@/features/marketplace/seeker/seekerActivity";
import { categories, seekerApplications, seekerFeedJobs } from "@/data/mock";
import type { SeekerApplication, Task } from "@/types/domain";

function makeJob(overrides: Partial<Task>): Task {
  return {
    id: "job",
    title: "Fix a leaking kitchen tap",
    category: "Plumbing",
    budget: "৳500",
    area: "Mirpur 1",
    timing: "Today",
    status: "open",
    urgent: false,
    offerCount: 0,
    description: "The kitchen tap drips all day.",
    postedBy: { name: "Jasim Uddin", area: "Mirpur 1" },
    postedAgo: "3 hours ago",
    ...overrides,
  };
}

const TAP = makeJob({ id: "tap" });
const MENU = makeJob({
  id: "menu",
  title: "Design a menu card",
  category: "Design",
  area: "Remote",
  remote: true,
  description: "Twelve items and our logo.",
});
const TUTOR = makeJob({
  id: "tutor",
  title: "Class 10 English conversation practice",
  category: "Tutor",
  area: "Bashundhara R/A",
  description: "Twice a week at home.",
});

describe("toggleSavedJob", () => {
  it("saves a job to the front of the list, most recent first", () => {
    const saved = toggleSavedJob(toggleSavedJob([], TAP), MENU);
    expect(saved.map((job) => job.id)).toEqual(["menu", "tap"]);
    expect(isJobSaved(saved, "tap")).toBe(true);
  });

  it("unsaves a job that's already saved", () => {
    const saved = toggleSavedJob([MENU, TAP], TAP);
    expect(saved.map((job) => job.id)).toEqual(["menu"]);
    expect(isJobSaved(saved, "tap")).toBe(false);
  });
});

describe("addResponse", () => {
  it("records a new private Response as the newest application, with the trimmed message", () => {
    const applications = addResponse(seekerApplications, TAP, "  I can come this evening.  ");

    expect(applications).toHaveLength(seekerApplications.length + 1);
    expect(applications[0]).toEqual({
      id: "response-tap",
      job: TAP,
      message: "I can come this evening.",
      sentAgo: "Just now",
      stage: "responseSent",
    });
  });

  it("keeps one Response per job — a second one leaves the list unchanged", () => {
    const once = addResponse([], TAP, "First message");
    expect(addResponse(once, TAP, "Second message")).toBe(once);
  });

  it("ignores an empty or whitespace-only message", () => {
    expect(addResponse([], TAP, "   ")).toEqual([]);
  });

  it("stores only a message — no price, bid or estimate", () => {
    const [application] = addResponse([], TAP, "Hello");
    expect(Object.keys(application ?? {}).sort()).toEqual(
      ["id", "job", "message", "sentAgo", "stage"].sort(),
    );
  });
});

describe("acceptJobRequest", () => {
  const request: SeekerApplication = {
    id: "a1",
    job: TAP,
    message: "I live nearby.",
    sentAgo: "yesterday",
    stage: "jobRequest",
  };

  it("moves a received job request to accepted", () => {
    const [accepted] = acceptJobRequest([request], "a1");
    expect(accepted?.stage).toBe("accepted");
  });

  it("can't accept something that isn't a job request", () => {
    const sent: SeekerApplication = { ...request, stage: "responseSent" };
    expect(acceptJobRequest([sent], "a1")[0]?.stage).toBe("responseSent");
  });
});

describe("groupApplications", () => {
  it("groups by what needs the Seeker first: job requests, accepted, responses sent", () => {
    const groups = groupApplications(seekerApplications);
    expect(groups.jobRequests.map((item) => item.stage)).toEqual(["jobRequest"]);
    expect(groups.accepted.map((item) => item.stage)).toEqual(["accepted"]);
    expect(groups.responsesSent.map((item) => item.stage)).toEqual(["responseSent"]);
  });
});

describe("applicationForJob", () => {
  it("finds the application for a job, if the Seeker responded to it", () => {
    const applications = addResponse([], TAP, "Hello");
    expect(applicationForJob(applications, "tap")?.id).toBe("response-tap");
    expect(applicationForJob(applications, "menu")).toBeUndefined();
  });
});

describe("filterJobs", () => {
  const jobs = [TAP, MENU, TUTOR];

  it("returns every job with no search or filter", () => {
    expect(filterJobs(jobs, "", ALL_JOBS)).toEqual(jobs);
  });

  it("keeps only Remote jobs", () => {
    expect(filterJobs(jobs, "", { kind: "remote" })).toEqual([MENU]);
  });

  it("keeps only one category", () => {
    expect(filterJobs(jobs, "", { kind: "category", label: "Tutor" })).toEqual([TUTOR]);
  });

  it("searches title, category, area and description, ignoring case", () => {
    expect(filterJobs(jobs, "KITCHEN", ALL_JOBS)).toEqual([TAP]);
    expect(filterJobs(jobs, "design", ALL_JOBS)).toEqual([MENU]);
    expect(filterJobs(jobs, "bashundhara", ALL_JOBS)).toEqual([TUTOR]);
    expect(filterJobs(jobs, "twice a week", ALL_JOBS)).toEqual([TUTOR]);
  });

  it("combines search with a filter", () => {
    expect(filterJobs(jobs, "menu", { kind: "category", label: "Tutor" })).toEqual([]);
  });
});

describe("categoriesWithJobs", () => {
  it("lists only categories that have jobs, in the app-wide category order", () => {
    const order = categories.map((category) => category.label);
    expect(categoriesWithJobs([TUTOR, TAP, MENU], order)).toEqual(["Tutor", "Design", "Plumbing"]);
  });

  it("never offers a category outside the app-wide list", () => {
    const order = categories.map((category) => category.label);
    for (const label of categoriesWithJobs(seekerFeedJobs, order)) {
      expect(order).toContain(label);
    }
  });
});
