import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import WelcomeScreen from "../app/index";

// This test intentionally lives in a root-level __tests__/ rather than
// colocated as app/index.test.tsx or under app/__tests__/: Expo Router
// treats everything inside app/ — including subdirectories — as a route or
// layout candidate, and a test file bundled into the production app pulls in
// @testing-library/react-native, which requires Node's "console" module and
// breaks the Metro bundle. Keeping tests entirely outside app/ avoids that
// regardless of Metro's blockList configuration. See
// docs/engineering/testing.md.

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe("WelcomeScreen", () => {
  it("routes to the onboarding flow on Get Started", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });
    const { getByRole } = await render(<WelcomeScreen />);
    await fireEvent.press(getByRole("button", { name: "Get Started →" }));
    expect(push).toHaveBeenCalledWith("/onboarding");
  });
});
