import {
  areaWithCity,
  categoryIconFor,
  firstNameOf,
  completedJobsLabel,
  formatRating,
  isShownTo,
  jobVisibilityOn,
  ratingsReceivedLabel,
  responsesLabel,
  withJobVisibility,
} from "./profileHelpers";
import { categories, completedJobs } from "@/data/mock";

describe("isShownTo", () => {
  it("shows public content to everyone", () => {
    expect(isShownTo("owner", "public")).toBe(true);
    expect(isShownTo("public", "public")).toBe(true);
  });

  it("shows hidden content to its owner only", () => {
    expect(isShownTo("owner", "hidden")).toBe(true);
    expect(isShownTo("public", "hidden")).toBe(false);
  });
});

describe("withJobVisibility", () => {
  it("changes only the chosen job's visibility on the chosen side", () => {
    const [first, second] = completedJobs;
    const updated = withJobVisibility([first, second], first.id, "provider", "hidden");

    expect(jobVisibilityOn(updated[0], "provider")).toBe("hidden");
    expect(updated[0].seekerVisibility).toBe(first.seekerVisibility);
    expect(updated[1]).toBe(second);
  });

  it("never touches the job's ratings, so hiding can't change an aggregate", () => {
    const [job] = completedJobs;
    const [updated] = withJobVisibility([job], job.id, "seeker", "hidden");

    expect(updated.providerRating).toBe(job.providerRating);
    expect(updated.seekerFeedback).toEqual(job.seekerFeedback);
  });
});

describe("labels", () => {
  it("formats ratings with one decimal place", () => {
    expect(formatRating(5)).toBe("5.0");
    expect(formatRating(4.7)).toBe("4.7");
  });

  it("uses the singular for one", () => {
    expect(ratingsReceivedLabel(1)).toBe("1 rating received");
    expect(ratingsReceivedLabel(18)).toBe("18 ratings received");
    expect(completedJobsLabel(1)).toBe("1 completed job");
    expect(completedJobsLabel(24)).toBe("24 completed jobs");
    expect(responsesLabel(1)).toBe("1 Response");
    expect(responsesLabel(4)).toBe("4 Responses");
  });
});

describe("categoryIconFor", () => {
  it("has an icon for every app-wide category", () => {
    for (const category of categories) {
      expect(categoryIconFor(category.label)).not.toBe("work-outline");
    }
  });

  it("falls back to a generic icon for a label outside the category list", () => {
    expect(categoryIconFor("Not a category")).toBe("work-outline");
  });
});

describe("names and places", () => {
  it("uses the first word of a name as the first name", () => {
    expect(firstNameOf("Nadia Rahman")).toBe("Nadia");
    expect(firstNameOf("Rafiq")).toBe("Rafiq");
  });

  it("shows an area with the launch city", () => {
    expect(areaWithCity("Mirpur 10")).toBe("Mirpur 10, Dhaka");
  });
});
