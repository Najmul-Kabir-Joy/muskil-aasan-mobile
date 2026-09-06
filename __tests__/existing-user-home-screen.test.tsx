import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import ExistingUserHomeScreen from "../app/existing-user-home";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe("ExistingUserHomeScreen", () => {
  it("defaults to Job Seeker mode and routes to the worker jobs feed", async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });
    const { getByRole, getByText } = await render(<ExistingUserHomeScreen />);

    expect(getByText("Job Seeker Mode")).toBeTruthy();
    await fireEvent.press(getByRole("button", { name: "Go to Home Feed →" }));

    expect(replace).toHaveBeenCalledWith("/(worker)/jobs");
  });

  it("switches to Job Provider mode and routes to the poster home", async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });
    const { getByRole, getByText } = await render(<ExistingUserHomeScreen />);

    await fireEvent.press(getByRole("button", { name: "Switch to Job Provider" }));
    expect(getByText("Job Provider Mode")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "Go to Home Feed →" }));

    expect(replace).toHaveBeenCalledWith("/(poster)");
  });
});
