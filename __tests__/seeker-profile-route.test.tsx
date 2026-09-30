import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import type { ReactElement } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SeekerProfileRoute from "../app/(worker)/profile";
import { getCurrentUserProfile } from "@/data/mock";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

function renderRoute(element: ReactElement) {
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

const profile = getCurrentUserProfile();

describe("Job Seeker Profile route", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ replace: jest.fn(), push: jest.fn(), back: jest.fn() });
  });

  it("shows the signed-in account's own Seeker profile, in owner view", async () => {
    const { getByText, queryByText, getByLabelText } = await renderRoute(<SeekerProfileRoute />);

    expect(getByText(profile.name)).toBeTruthy();
    expect(getByText("Owner View")).toBeTruthy();
    expect(getByText(profile.seekerBio)).toBeTruthy();
    expect(getByText(/for Job Seeker mode/)).toBeTruthy();
    expect(getByText("Seeker Reputation")).toBeTruthy();
    expect(getByLabelText(/^Seeker Rating: /)).toBeTruthy();
    expect(getByText("Can Help With")).toBeTruthy();
    expect(getByText("Previous Work & Feedback")).toBeTruthy();
    // Job Seeker mode → the Seeker side only.
    expect(queryByText("Provider Reputation")).toBeNull();
    expect(queryByText("Current Job Posts")).toBeNull();
  });

  it("has no Provider / Seeker switch on the profile — mode is switched in the drawer", async () => {
    const { queryByRole } = await renderRoute(<SeekerProfileRoute />);

    expect(queryByRole("button", { name: "Provider Profile" })).toBeNull();
    expect(queryByRole("button", { name: "Seeker Profile" })).toBeNull();
    expect(queryByRole("button", { name: /switch/i })).toBeNull();
  });

  it("edits in place: profile photo, cover photo and bio", async () => {
    const { getByRole, getByLabelText, getByText } = await renderRoute(<SeekerProfileRoute />);

    expect(getByRole("button", { name: "Edit profile photo" })).toBeTruthy();
    expect(getByRole("button", { name: "Edit cover photo" })).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "Edit bio" }));
    await fireEvent.changeText(getByLabelText("Bio"), "Happy to help with fans and tutoring.");
    await fireEvent.press(getByRole("button", { name: "Save" }));

    expect(getByText("Happy to help with fans and tutoring.")).toBeTruthy();
  });

  it("keeps Seeker skills editable from the profile, using the app-wide categories", async () => {
    const { getByRole, getByText, queryByText } = await renderRoute(<SeekerProfileRoute />);

    expect(queryByText("Plumbing")).toBeNull();
    await fireEvent.press(getByRole("button", { name: "Add Skill" }));
    await fireEvent.press(getByRole("button", { name: "Plumbing" }));
    await fireEvent.press(getByRole("button", { name: "Done" }));

    expect(getByText("Plumbing")).toBeTruthy();
  });

  it("shows the owner their hidden work, marked as hidden, with visibility controls", async () => {
    const hiddenJob = profile.jobsAsSeeker.find((job) => job.seekerVisibility === "hidden");
    const { getByText, getByRole } = await renderRoute(<SeekerProfileRoute />);

    expect(hiddenJob).toBeDefined();
    expect(getByText(hiddenJob?.title ?? "")).toBeTruthy();
    expect(getByText("Hidden from public")).toBeTruthy();
    expect(getByRole("button", { name: `Make ${hiddenJob?.title} public` })).toBeTruthy();
  });

  it("doesn't render the shell's header itself — the (worker) layout owns it", async () => {
    const { queryByLabelText } = await renderRoute(<SeekerProfileRoute />);

    expect(queryByLabelText("Open navigation menu")).toBeNull();
  });
});
