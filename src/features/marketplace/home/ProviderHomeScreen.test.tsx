import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import type { ReactElement } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ProviderHomeScreen } from "./ProviderHomeScreen";
import { communityTasks, tasks, workers } from "@/data/mock";
import type { EligibleReferral } from "@/types/domain";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

// The screen always mounts ReferSomeoneSheet/CommunityJobOverflowSheet
// (hidden until opened), both of which read insets via
// `useSafeAreaInsets()` — see ProviderDrawer.test.tsx for the same pattern.
function renderHome(element: ReactElement) {
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

const latestJob = tasks[0];
const eligibleReferrals: EligibleReferral[] = [
  { worker: workers[0], jobTitle: "Ceiling fan repair" },
];

describe("ProviderHomeScreen — canonical (has a latest job)", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn() });
  });

  it("renders the greeting, the latest job, and the Community Jobs feed", async () => {
    const { getByText } = await renderHome(
      <ProviderHomeScreen latestJob={latestJob} communityJobs={communityTasks} />,
    );

    expect(getByText("Good evening, Nadia")).toBeTruthy();
    expect(getByText(latestJob.title)).toBeTruthy();
    expect(getByText("Community Jobs")).toBeTruthy();
    expect(getByText(communityTasks[0].title)).toBeTruthy();
    expect(getByText(communityTasks[1].title)).toBeTruthy();
    expect(getByText(communityTasks[2].title)).toBeTruthy();
  });

  it("does not render its own header/menu button — the Provider shell owns that", async () => {
    const { queryByLabelText } = await renderHome(
      <ProviderHomeScreen latestJob={latestJob} communityJobs={communityTasks} />,
    );

    expect(queryByLabelText("Open navigation menu")).toBeNull();
  });

  it("never exposes a community responder's identity — response counts stay informational only", async () => {
    const { getByText, queryByText } = await renderHome(
      <ProviderHomeScreen latestJob={latestJob} communityJobs={communityTasks} />,
    );

    expect(getByText(`${communityTasks[0].responseCount} responses`)).toBeTruthy();
    // No responder name should ever be printed — only the poster's own name
    // (Nusrat Jahan here) appears, never a distinct list of responders.
    expect(queryByText(/responded/i)).toBeNull();
  });

  it("View Responses navigates to the Provider Responses route, not My Jobs", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn() });

    const { getByText } = await renderHome(
      <ProviderHomeScreen latestJob={latestJob} communityJobs={communityTasks} />,
    );
    await fireEvent.press(getByText(`View Responses (${latestJob.offerCount})`));

    expect(push).toHaveBeenCalledWith("/(poster)/responses");
  });

  it("View Job navigates to My Jobs (no dedicated Job Detail screen yet)", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn() });

    const { getByText } = await renderHome(
      <ProviderHomeScreen latestJob={latestJob} communityJobs={communityTasks} />,
    );
    await fireEvent.press(getByText("View Job"));

    expect(push).toHaveBeenCalledWith("/(poster)/tasks");
  });

  it("tapping a Community Job's Refer icon opens the Refer Someone sheet for that job", async () => {
    const { getAllByRole, getByText } = await renderHome(
      <ProviderHomeScreen
        latestJob={latestJob}
        communityJobs={communityTasks}
        eligibleReferrals={eligibleReferrals}
      />,
    );

    await fireEvent.press(getAllByRole("button", { name: "Refer someone" })[0]);

    expect(getByText("Refer Someone")).toBeTruthy();
    expect(getByText("Referral for Community Job")).toBeTruthy();
  });

  it("tapping a Community Job's top-right options opens the overflow sheet with exactly its three actions", async () => {
    const { getAllByRole, getByText } = await renderHome(
      <ProviderHomeScreen latestJob={latestJob} communityJobs={communityTasks} />,
    );

    await fireEvent.press(getAllByRole("button", { name: "More job options" })[0]);

    expect(getByText("Share Job")).toBeTruthy();
    expect(getByText("Report Job")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
  });

  it("renders only one overflow trigger per Community Job card — no duplicate three-dot menu", async () => {
    const { getAllByRole } = await renderHome(
      <ProviderHomeScreen latestJob={latestJob} communityJobs={[communityTasks[0]]} />,
    );

    expect(getAllByRole("button", { name: "More job options" })).toHaveLength(1);
  });
});

describe("ProviderHomeScreen — empty (no jobs posted)", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn() });
  });

  it("renders 'No jobs posted yet' in place of the latest job, while Community Jobs still renders", async () => {
    const { getByText, queryByText } = await renderHome(
      <ProviderHomeScreen latestJob={null} communityJobs={communityTasks} />,
    );

    expect(getByText("No jobs posted yet")).toBeTruthy();
    expect(getByText("Post Your First Job")).toBeTruthy();
    expect(queryByText(latestJob.title)).toBeNull();
    expect(getByText("Community Jobs")).toBeTruthy();
    expect(getByText(communityTasks[0].title)).toBeTruthy();
  });

  it("Post Your First Job navigates to the existing Post Job route", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn() });

    const { getByText } = await renderHome(
      <ProviderHomeScreen latestJob={null} communityJobs={communityTasks} />,
    );
    await fireEvent.press(getByText("Post Your First Job"));

    expect(push).toHaveBeenCalledWith("/(poster)/post-task");
  });
});
