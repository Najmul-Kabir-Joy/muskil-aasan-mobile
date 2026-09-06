import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import WelcomeScreen from "../index";

// This test intentionally lives in app/__tests__/ rather than colocated as
// app/index.test.tsx: Expo Router treats every file under app/ as a route
// candidate, so a colocated test file gets bundled into the production app
// (pulling in @testing-library/react-native, which requires Node's "console"
// module and breaks the Metro bundle). Metro's default resolver.blockList
// already excludes __tests__ directories, so Jest still finds this file
// while Metro/Expo Router never sees it. See docs/engineering/testing.md.

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
