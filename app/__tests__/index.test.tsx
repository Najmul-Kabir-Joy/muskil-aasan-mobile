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

// Mock at the expo-router module boundary (per docs/engineering/testing.md)
// rather than mounting a real navigation tree, since the only behavior under
// test is *which route* Get Started pushes to for the selected mode.
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe("WelcomeScreen", () => {
  it("navigates to the poster route by default (Need Help is preselected)", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });

    const { getByRole } = await render(<WelcomeScreen />);
    await fireEvent.press(getByRole("button", { name: "Get Started →" }));

    expect(push).toHaveBeenCalledWith("/(poster)");
  });

  it("navigates to the job seeker route after selecting Want to Earn", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });

    const { getByRole } = await render(<WelcomeScreen />);
    await fireEvent.press(getByRole("button", { name: /Want to Earn/ }));
    await fireEvent.press(getByRole("button", { name: "Get Started →" }));

    expect(push).toHaveBeenCalledWith("/(worker)/jobs");
  });

  it("switching back to Need Help after selecting Want to Earn routes to poster again", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });

    const { getByRole } = await render(<WelcomeScreen />);
    await fireEvent.press(getByRole("button", { name: /Want to Earn/ }));
    await fireEvent.press(getByRole("button", { name: /Need Help/ }));
    await fireEvent.press(getByRole("button", { name: "Get Started →" }));

    expect(push).toHaveBeenCalledWith("/(poster)");
  });
});
