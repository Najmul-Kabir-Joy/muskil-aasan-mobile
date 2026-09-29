import { fireEvent, render } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import PublicProfileRoute from "../app/(poster)/public-profile";
import { workers } from "@/data/mock";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;
const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;

function renderRoute() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <PublicProfileRoute />
    </SafeAreaProvider>,
  );
}

describe("Public Profile route", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn(), back: jest.fn() });
  });

  it("opens the person matching the id, as a public viewer", async () => {
    const worker = workers[0];
    mockUseLocalSearchParams.mockReturnValue({ id: worker.id });

    const { getByText, queryByText, queryByRole } = await renderRoute();

    expect(getByText(worker.name)).toBeTruthy();
    expect(queryByText("Owner View")).toBeNull();
    expect(queryByRole("button", { name: "Edit Profile" })).toBeNull();
  });

  it("opens the Seeker side when view=seeker", async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: workers[0].id, view: "seeker" });

    const { getByText, getByRole } = await renderRoute();

    expect(getByText("Seeker Reputation")).toBeTruthy();
    expect(getByRole("button", { name: "Seeker Profile" }).props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
  });

  it("falls back to the Provider side for a missing or unknown view", async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: workers[0].id, view: "admin" });

    const { getByText, queryByText } = await renderRoute();

    expect(getByText("Provider Reputation")).toBeTruthy();
    expect(queryByText("Seeker Reputation")).toBeNull();
  });

  it("shows a not-found state for an unknown id instead of a blank screen", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn(), back: jest.fn() });
    mockUseLocalSearchParams.mockReturnValue({ id: "not-a-real-id" });

    const { getByText, getByRole } = await renderRoute();

    expect(getByText("Profile not found")).toBeTruthy();
    await fireEvent.press(getByRole("button", { name: "Back to Home" }));
    expect(push).toHaveBeenCalledWith("/(poster)");
  });

  it("shows the not-found state when no id is given", async () => {
    mockUseLocalSearchParams.mockReturnValue({});

    const { getByText } = await renderRoute();

    expect(getByText("Profile not found")).toBeTruthy();
  });
});
