import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import ExistingUserHomeScreen from "../app/existing-user-home";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe("ExistingUserHomeScreen", () => {
  it("shows a simple welcome-back confirmation with no mode, ratings, or verification claims", async () => {
    mockUseRouter.mockReturnValue({ replace: jest.fn() });
    const { getByText, queryByText } = await render(<ExistingUserHomeScreen />);

    expect(getByText("Welcome back!")).toBeTruthy();
    expect(getByText("You're signed in.")).toBeTruthy();
    expect(queryByText(/Job Seeker Mode|Job Provider Mode/)).toBeNull();
    expect(queryByText(/Rating|Verified|Guaranteed|Ready to Work/)).toBeNull();
  });

  it("routes to the default (Job Provider) prototype destination on Continue", async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });
    const { getByRole } = await render(<ExistingUserHomeScreen />);

    await fireEvent.press(getByRole("button", { name: "Continue →" }));

    expect(replace).toHaveBeenCalledWith("/(poster)");
  });
});
