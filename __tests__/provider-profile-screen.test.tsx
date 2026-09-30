import { render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ProviderProfileRoute from "../app/(poster)/profile";
import ProfileRoute from "../app/profile";
import { getCurrentUserProfile } from "@/data/mock";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe("Profile routes", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ replace: jest.fn(), push: jest.fn(), back: jest.fn() });
  });

  it("the Provider Profile tab shows the signed-in account's own Provider profile, in owner view", async () => {
    const { getByText, getByRole, queryByRole } = await render(
      <SafeAreaProvider initialMetrics={METRICS}>
        <ProviderProfileRoute />
      </SafeAreaProvider>,
    );

    expect(getByText(getCurrentUserProfile().name)).toBeTruthy();
    expect(getByText("Owner View")).toBeTruthy();
    // Job Provider mode → the Provider side, with no in-page side switch.
    expect(getByText("Provider Reputation")).toBeTruthy();
    expect(queryByRole("button", { name: "Seeker Profile" })).toBeNull();
    expect(getByRole("button", { name: "Edit profile photo" })).toBeTruthy();
    // No Back action on the tab itself — that's only for someone else's profile.
    expect(queryByRole("button", { name: "Back" })).toBeNull();
  });

  it("does not render the Provider shell's header itself — that's owned by the (poster) layout", async () => {
    const { queryByLabelText } = await render(
      <SafeAreaProvider initialMetrics={METRICS}>
        <ProviderProfileRoute />
      </SafeAreaProvider>,
    );

    expect(queryByLabelText("Open navigation menu")).toBeNull();
  });

  it("the standalone /profile route shows the same owner profile", async () => {
    const { getByText } = await render(
      <SafeAreaProvider initialMetrics={METRICS}>
        <ProfileRoute />
      </SafeAreaProvider>,
    );

    expect(getByText(getCurrentUserProfile().name)).toBeTruthy();
    expect(getByText("Owner View")).toBeTruthy();
  });
});
