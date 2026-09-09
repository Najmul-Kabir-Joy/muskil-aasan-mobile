import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import PosterHomeScreen from "../app/(poster)/index";
import { communityTasks, tasks } from "@/data/mock";
import { BRAND_NAME } from "@/shared/constants/brand";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe("PosterHomeScreen", () => {
  it("renders the brand name and shows Your Latest Job for the current user's own first active task", async () => {
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    const latestTask = tasks.find((task) => task.status !== "completed")!;

    const { getByText } = await render(<PosterHomeScreen />);

    expect(getByText(BRAND_NAME)).toBeTruthy();
    expect(getByText("Your Latest Job")).toBeTruthy();
    expect(getByText(latestTask.title)).toBeTruthy();
  });

  it("renders every community-posted job", async () => {
    mockUseRouter.mockReturnValue({ push: jest.fn() });

    const { getByText } = await render(<PosterHomeScreen />);

    for (const task of communityTasks) {
      expect(getByText(task.title)).toBeTruthy();
    }
  });

  it("opens the existing profile route from the header's profile button, not an invented one", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });

    const { getByLabelText } = await render(<PosterHomeScreen />);
    await fireEvent.press(getByLabelText("Open profile"));

    expect(push).toHaveBeenCalledWith("/profile");
  });

  it("posting a job from the top banner navigates to the existing post-task route", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });

    const { getByRole } = await render(<PosterHomeScreen />);
    await fireEvent.press(getByRole("button", { name: "+ Post a Job" }));

    expect(push).toHaveBeenCalledWith("/(poster)/post-task");
  });

  it("View All My Listings navigates to the existing tasks route", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });

    const { getByText } = await render(<PosterHomeScreen />);
    await fireEvent.press(getByText("View All My Listings"));

    expect(push).toHaveBeenCalledWith("/(poster)/tasks");
  });
});
