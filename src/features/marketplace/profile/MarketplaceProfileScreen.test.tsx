import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import type { ReactElement } from "react";
import { Share } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MarketplaceProfileScreen } from "./MarketplaceProfileScreen";
import { getCurrentUserProfile, tasks, workers } from "@/data/mock";
import type { CompletedJob, MarketplaceProfile } from "@/types/domain";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

// The profile's sheets read safe-area insets, which need a provider — see
// ProviderDrawer.test.tsx for the same pattern.
function renderWithSafeArea(element: ReactElement) {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      {element}
    </SafeAreaProvider>,
  );
}

function makeJob(overrides: Partial<CompletedJob>): CompletedJob {
  return {
    id: "job",
    title: "Job",
    area: "Mirpur 10",
    completedOn: "12 Oct",
    providerId: "provider",
    seekerId: "seeker",
    providerRating: 5,
    seekerFeedback: { rating: 5, comment: "Great work." },
    providerVisibility: "public",
    seekerVisibility: "public",
    ...overrides,
  };
}

const PROVIDER_PUBLIC_JOB = makeJob({
  id: "p1",
  title: "Emergency plumbing pipe leak fix",
  completedOn: "28 Sep",
  providerRating: 5,
  // Feedback the Provider wrote about their Seeker — belongs to the Seeker's
  // profile, never to this Provider's star-only Previous Job Posts.
  seekerFeedback: { rating: 5, comment: "Stopped the leak within the hour." },
});
const PROVIDER_HIDDEN_JOB = makeJob({
  id: "p2",
  title: "Kitchen shelf mounting",
  completedOn: "14 Aug",
  providerRating: 4,
  providerVisibility: "hidden",
  seekerFeedback: { rating: 4, comment: "Shelves are level and sturdy." },
});
const SEEKER_PUBLIC_JOB = makeJob({
  id: "s1",
  title: "Ceiling fan regulator fix",
  completedOn: "3 Oct",
  seekerFeedback: {
    rating: 5,
    comment: "Arrived on time and fixed everything properly.",
  },
});
const SEEKER_HIDDEN_JOB = makeJob({
  id: "s2",
  title: "Grocery delivery & urgent pickup",
  area: "Mirpur 2",
  completedOn: "11 Aug",
  seekerFeedback: { rating: 4, comment: "Took longer due to rain, but arrived safely." },
  seekerVisibility: "hidden",
});

const PROFILE: MarketplaceProfile = {
  id: "w7",
  name: "Nadia Rahman",
  area: "Mirpur",
  providerBio: "Looking for reliable help for home projects.",
  seekerBio: "Happy to help with appliance troubleshooting and errands.",
  providerRating: { rating: 4.7, ratingCount: 18 },
  seekerRating: { rating: 4.9, ratingCount: 21, completedJobs: 24 },
  canHelpWith: ["Repair", "Tutor"],
  currentJobPosts: [{ task: tasks[0], responseCount: 4 }],
  jobsAsProvider: [PROVIDER_PUBLIC_JOB, PROVIDER_HIDDEN_JOB],
  jobsAsSeeker: [SEEKER_PUBLIC_JOB, SEEKER_HIDDEN_JOB],
  sectionVisibility: {
    providerReputation: "public",
    previousJobPosts: "public",
    seekerReputation: "public",
    previousWork: "public",
  },
};

// Claims the finalized Profile deliberately does not make.
const UNAPPROVED_CLAIMS =
  /NID|verif|trust score|trusted|completion rate|success rate|pay safety|escrow|guarantee|funds locked|payout|follower|earning|wallet|member since|quick responder|active member|Hired by|send job request|message|contact|phone|away/i;

describe("MarketplaceProfileScreen — My Profile (owner)", () => {
  let push: jest.Mock;
  let replace: jest.Mock;

  beforeEach(() => {
    push = jest.fn();
    replace = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace, back: jest.fn() });
  });

  it("renders the Provider view by default: identity, Provider Reputation, current and previous job posts", async () => {
    const { getByText, getByRole } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={PROFILE} viewer="owner" />,
    );

    expect(getByText("Nadia Rahman")).toBeTruthy();
    expect(getByText("Mirpur, Dhaka")).toBeTruthy();
    expect(getByText(PROFILE.providerBio)).toBeTruthy();
    expect(getByText("Owner View")).toBeTruthy();
    expect(getByText("Provider Reputation")).toBeTruthy();
    expect(getByText("Current Job Posts")).toBeTruthy();
    expect(getByText(/^Previous Job Posts/)).toBeTruthy();
    expect(getByRole("button", { name: "Provider Profile" }).props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
  });

  it("renders the Seeker view: Seeker Reputation, Can Help With, Previous Work & Feedback", async () => {
    const { getByText, getByRole, queryByText } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={PROFILE} viewer="owner" initialSide="seeker" />,
    );

    expect(getByText("Seeker Reputation")).toBeTruthy();
    expect(getByText("Can Help With")).toBeTruthy();
    expect(getByText("Previous Work & Feedback")).toBeTruthy();
    expect(getByText(PROFILE.seekerBio)).toBeTruthy();
    expect(queryByText("Current Job Posts")).toBeNull();
    expect(getByRole("button", { name: "Seeker Profile" }).props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
  });

  it("the profile-view switch moves between the Provider and Seeker sides of the same account", async () => {
    const { getByText, getByRole, queryByText } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={PROFILE} viewer="owner" />,
    );

    await fireEvent.press(getByRole("button", { name: "Seeker Profile" }));
    expect(getByText("Seeker Reputation")).toBeTruthy();
    expect(queryByText("Provider Reputation")).toBeNull();
    expect(getByText("Nadia Rahman")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "Provider Profile" }));
    expect(getByText("Provider Reputation")).toBeTruthy();
    expect(queryByText("Seeker Reputation")).toBeNull();
  });

  it("switching the profile view never changes the app's Job Provider / Job Seeker mode", async () => {
    const { getByRole } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={PROFILE} viewer="owner" />,
    );

    await fireEvent.press(getByRole("button", { name: "Seeker Profile" }));
    await fireEvent.press(getByRole("button", { name: "Provider Profile" }));

    expect(replace).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("shows the Provider Rating on its own, with its rating count", async () => {
    const { getByText, getByLabelText, queryByText } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={PROFILE} viewer="owner" />,
    );

    expect(getByLabelText("Provider Rating: 4.7 out of 5")).toBeTruthy();
    expect(getByText("18 ratings received")).toBeTruthy();
    expect(queryByText("Seeker Rating")).toBeNull();
    expect(queryByText("4.9")).toBeNull();
  });

  it("shows the Seeker Rating on its own, with its completed-jobs context", async () => {
    const { getByText, getByLabelText, queryByText } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={PROFILE} viewer="owner" initialSide="seeker" />,
    );

    expect(getByLabelText("Seeker Rating: 4.9 out of 5")).toBeTruthy();
    expect(getByText("24 completed jobs")).toBeTruthy();
    expect(queryByText("Provider Rating")).toBeNull();
    expect(queryByText("4.7")).toBeNull();
  });

  it("lists current job posts with Responses (not Offers) and links to Responses and My Jobs", async () => {
    const { getByText, getByRole, queryByText } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={PROFILE} viewer="owner" />,
    );

    expect(getByText(tasks[0].title)).toBeTruthy();
    expect(getByText(tasks[0].budget)).toBeTruthy();
    expect(getByText("Active • 4 Responses")).toBeTruthy();
    expect(getByText("Responses received: 4")).toBeTruthy();
    expect(getByText("1 active")).toBeTruthy();
    expect(queryByText(/offer/i)).toBeNull();

    await fireEvent.press(getByRole("button", { name: `View responses to ${tasks[0].title}` }));
    expect(push).toHaveBeenCalledWith("/(poster)/responses");

    await fireEvent.press(getByRole("button", { name: "Manage job posts" }));
    expect(push).toHaveBeenCalledWith("/(poster)/tasks");
  });

  it("lists previous job posts with a star rating only — no written feedback on the Provider side", async () => {
    const { getByText, getAllByText, queryByText } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={PROFILE} viewer="owner" />,
    );

    expect(getByText(PROVIDER_PUBLIC_JOB.title)).toBeTruthy();
    expect(getByText("Completed 28 Sep")).toBeTruthy();
    expect(getByText(/\(2 total\)$/)).toBeTruthy();
    expect(getAllByText("Star Rating received")).toHaveLength(2);
    expect(queryByText(`“${PROVIDER_PUBLIC_JOB.seekerFeedback.comment}”`)).toBeNull();
    expect(queryByText(PROVIDER_PUBLIC_JOB.seekerFeedback.comment)).toBeNull();
    expect(queryByText(/Completed through/)).toBeNull();
  });

  it("shows Can Help With using the app-wide categories", async () => {
    const { getByText } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={PROFILE} viewer="owner" initialSide="seeker" />,
    );

    expect(getByText("Repair")).toBeTruthy();
    expect(getByText("Tutor")).toBeTruthy();
  });

  it("shows previous Seeker work with stars, written feedback, and neutral attribution only", async () => {
    const { getByText, getAllByText, queryByText } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={PROFILE} viewer="owner" initialSide="seeker" />,
    );

    expect(getByText(SEEKER_PUBLIC_JOB.title)).toBeTruthy();
    expect(getByText("Completed 3 Oct")).toBeTruthy();
    expect(getByText(`“${SEEKER_PUBLIC_JOB.seekerFeedback.comment}”`)).toBeTruthy();
    expect(getAllByText("Completed through MuSkill Aasan")).toHaveLength(2);
    expect(queryByText(/Hired by/)).toBeNull();
  });

  it("shows Edit Profile, which opens the prototype placeholder rather than an invented form", async () => {
    const { getByRole } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={PROFILE} viewer="owner" />,
    );

    await fireEvent.press(getByRole("button", { name: "Edit Profile" }));

    expect(push).toHaveBeenCalledWith({
      pathname: "/(poster)/coming-soon",
      params: { title: "Edit Profile" },
    });
  });

  it("shows hidden items to the owner, clearly marked as hidden, with a way to make them public", async () => {
    const { getByText, getByRole } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={PROFILE} viewer="owner" />,
    );

    expect(getByText(PROVIDER_HIDDEN_JOB.title)).toBeTruthy();
    expect(getByText("Hidden from public")).toBeTruthy();
    expect(getByText(/Hidden items are masked from other users/)).toBeTruthy();

    await fireEvent.press(
      getByRole("button", { name: `Make ${PROVIDER_HIDDEN_JOB.title} public` }),
    );

    expect(() => getByText("Hidden from public")).toThrow();
  });

  it("shows hidden Seeker work to the owner, marked as hidden", async () => {
    const { getByText } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={PROFILE} viewer="owner" initialSide="seeker" />,
    );

    expect(getByText(SEEKER_HIDDEN_JOB.title)).toBeTruthy();
    expect(getByText("Hidden from public")).toBeTruthy();
    expect(getByText(/Hidden from public view\. Its rating still counts/)).toBeTruthy();
  });

  it("hiding an item changes only its visibility — the aggregate rating it contributes to stays the same", async () => {
    const { getByText, getAllByText, getByRole, getByLabelText } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={PROFILE} viewer="owner" />,
    );

    await fireEvent.press(
      getByRole("button", { name: `Manage visibility of ${PROVIDER_PUBLIC_JOB.title}` }),
    );
    await fireEvent.press(getByRole("button", { name: /^Hidden/ }));

    expect(getAllByText("Hidden from public")).toHaveLength(2);
    expect(getByLabelText("Provider Rating: 4.7 out of 5")).toBeTruthy();
    expect(getByText("18 ratings received")).toBeTruthy();
    expect(getAllByText("4.7 Provider average")).toHaveLength(2);
  });

  it("can hide a whole section from the public, and marks it as hidden for the owner", async () => {
    const { getByRole, getByText } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={PROFILE} viewer="owner" />,
    );

    await fireEvent.press(getByRole("button", { name: "Provider Reputation visibility: Public" }));
    await fireEvent.press(getByRole("button", { name: /^Hidden/ }));

    expect(getByRole("button", { name: "Provider Reputation visibility: Hidden" })).toBeTruthy();
    expect(getByText("Hidden from public view. Only you can see this section.")).toBeTruthy();
    expect(getByText("Provider Reputation")).toBeTruthy();
  });

  it("Add Skill adds a category from the app-wide list to Can Help With (local only)", async () => {
    const { getByRole, getByText, queryByText } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={PROFILE} viewer="owner" initialSide="seeker" />,
    );

    expect(queryByText("Cleaning")).toBeNull();
    await fireEvent.press(getByRole("button", { name: "Add Skill" }));
    await fireEvent.press(getByRole("button", { name: "Cleaning" }));
    await fireEvent.press(getByRole("button", { name: "Done" }));

    expect(getByText("Cleaning")).toBeTruthy();
  });

  it("Share uses the platform share sheet with public profile text only", async () => {
    const shareSpy = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" });
    const { getByRole } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={PROFILE} viewer="owner" />,
    );

    await fireEvent.press(getByRole("button", { name: "Share profile" }));

    expect(shareSpy).toHaveBeenCalledWith({
      message: "Nadia Rahman — Provider Profile on MuSkill Aasan\nMirpur, Dhaka",
    });
    shareSpy.mockRestore();
  });

  it("wraps long names, bios, job titles and feedback instead of cutting them off", async () => {
    const longTitle =
      "Need an experienced electrician to rewire the ceiling fan, replace two regulators and check every socket";
    const longComment =
      "Arrived exactly on time, explained every step, fixed the wiring that two others could not, cleaned up afterwards, and followed up the next day to make sure everything still worked perfectly.";
    const longProfile: MarketplaceProfile = {
      ...PROFILE,
      name: "Nadia Rahman Chowdhury Siddiqua Begum",
      seekerBio: Array(6).fill("Electrical engineering undergrad & Mirpur neighbor.").join(" "),
      currentJobPosts: [{ task: { ...tasks[0], title: longTitle }, responseCount: 1 }],
      jobsAsSeeker: [{ ...SEEKER_PUBLIC_JOB, seekerFeedback: { rating: 5, comment: longComment } }],
      canHelpWith: ["Repair", "Tutor", "Delivery", "Design", "Photo", "Admin", "Cleaning"],
    };

    const { getByText, getByRole } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={longProfile} viewer="owner" />,
    );

    expect(getByText(longProfile.name).props.numberOfLines).toBeUndefined();
    // Two lines, then ellipsis — a job title can't push the budget off the card.
    expect(getByText(longTitle).props.numberOfLines).toBe(2);
    expect(getByText("Active • 1 Response")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "Seeker Profile" }));
    expect(getByText(longProfile.seekerBio).props.numberOfLines).toBeUndefined();
    expect(getByText(`“${longComment}”`).props.numberOfLines).toBeUndefined();
    for (const label of longProfile.canHelpWith) {
      expect(getByText(label)).toBeTruthy();
    }
  });
});

describe("MarketplaceProfileScreen — Public Profile", () => {
  let back: jest.Mock;
  let push: jest.Mock;

  beforeEach(() => {
    back = jest.fn();
    push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn(), back });
  });

  it("Provider view shows only public content and no owner controls", async () => {
    const { getByText, queryByText, queryByRole } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={PROFILE} viewer="public" />,
    );

    expect(getByText("Provider Reputation")).toBeTruthy();
    expect(getByText(PROVIDER_PUBLIC_JOB.title)).toBeTruthy();
    expect(getByText(/\(1 public job\)$/)).toBeTruthy();
    expect(getByText("4 Responses received")).toBeTruthy();
    expect(getByText("Open for responses")).toBeTruthy();

    expect(queryByText(PROVIDER_HIDDEN_JOB.title)).toBeNull();
    expect(queryByText(/Hidden/)).toBeNull();
    expect(queryByText("Owner View")).toBeNull();
    expect(queryByRole("button", { name: "Edit Profile" })).toBeNull();
    expect(queryByRole("button", { name: "Manage job posts" })).toBeNull();
    expect(queryByText(/Manage/)).toBeNull();
    expect(queryByText("Make Public")).toBeNull();
    expect(queryByText("Public")).toBeNull();
    expect(queryByText(/Responses received:/)).toBeNull();
    expect(queryByText("View Responses")).toBeNull();
  });

  it("Seeker view shows public work and feedback only, and no owner controls", async () => {
    const { getByText, queryByText, queryByRole } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={PROFILE} viewer="public" initialSide="seeker" />,
    );

    expect(getByText("Seeker Reputation")).toBeTruthy();
    expect(getByText("Repair")).toBeTruthy();
    expect(getByText(SEEKER_PUBLIC_JOB.title)).toBeTruthy();
    expect(getByText(`“${SEEKER_PUBLIC_JOB.seekerFeedback.comment}”`)).toBeTruthy();
    expect(getByText("Completed through MuSkill Aasan")).toBeTruthy();

    expect(queryByText(SEEKER_HIDDEN_JOB.title)).toBeNull();
    expect(queryByText(`“${SEEKER_HIDDEN_JOB.seekerFeedback.comment}”`)).toBeNull();
    expect(queryByRole("button", { name: "Add Skill" })).toBeNull();
    expect(queryByRole("button", { name: "Edit Profile" })).toBeNull();
    expect(queryByText(/Visibility/)).toBeNull();
    expect(queryByText(/Hidden/)).toBeNull();
  });

  it("drops a section entirely when its owner has hidden it", async () => {
    const { queryByText, getByText } = await renderWithSafeArea(
      <MarketplaceProfileScreen
        profile={{
          ...PROFILE,
          sectionVisibility: { ...PROFILE.sectionVisibility, previousJobPosts: "hidden" },
        }}
        viewer="public"
      />,
    );

    expect(getByText("Provider Reputation")).toBeTruthy();
    expect(queryByText(/^Previous Job Posts/)).toBeNull();
    expect(queryByText(PROVIDER_PUBLIC_JOB.title)).toBeNull();
  });

  it("keeps the aggregate rating public even when rated items are hidden", async () => {
    const { getByLabelText, getByText } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={PROFILE} viewer="public" />,
    );

    expect(getByLabelText("Provider Rating: 4.7 out of 5")).toBeTruthy();
    expect(getByText("18 ratings received")).toBeTruthy();
  });

  it("offers a Back action, since it's opened from another screen", async () => {
    const { getByRole } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={PROFILE} viewer="public" />,
    );

    await fireEvent.press(getByRole("button", { name: "Back" }));

    expect(back).toHaveBeenCalledTimes(1);
  });

  it("never identifies who wrote a Seeker's feedback", async () => {
    // Real mock data: each job on Nadia's Seeker side was posted by another
    // account — none of those people may appear on her public profile.
    const profile = getCurrentUserProfile();
    const reviewerNames = profile.jobsAsSeeker.map(
      (job) => workers.find((worker) => worker.id === job.providerId)?.name,
    );

    const { queryByText } = await renderWithSafeArea(
      <MarketplaceProfileScreen profile={profile} viewer="public" initialSide="seeker" />,
    );

    expect(reviewerNames.length).toBeGreaterThan(0);
    for (const name of reviewerNames) {
      expect(name).toBeTruthy();
      expect(queryByText(new RegExp(name ?? "", "i"))).toBeNull();
    }
    expect(queryByText(/Hired by/i)).toBeNull();
  });
});

describe("MarketplaceProfileScreen — no unapproved trust, verification or payment claims", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn(), back: jest.fn() });
  });

  it.each([
    ["owner", "provider"],
    ["owner", "seeker"],
    ["public", "provider"],
    ["public", "seeker"],
  ] as const)("%s %s view", async (viewer, side) => {
    const { toJSON } = await renderWithSafeArea(
      <MarketplaceProfileScreen
        profile={getCurrentUserProfile()}
        viewer={viewer}
        initialSide={side}
      />,
    );

    const visibleText = collectText(toJSON());
    expect(visibleText.length).toBeGreaterThan(0);
    for (const text of visibleText) {
      expect(text).not.toMatch(UNAPPROVED_CLAIMS);
    }
  });
});

type JsonNode = { children?: (JsonNode | string)[] | null } | string | null;

// Every string rendered as text — the words a user could actually read.
function collectText(node: JsonNode | JsonNode[]): string[] {
  if (node === null) return [];
  if (typeof node === "string") return [node];
  if (Array.isArray(node)) return node.flatMap(collectText);
  return (node.children ?? []).flatMap(collectText);
}
