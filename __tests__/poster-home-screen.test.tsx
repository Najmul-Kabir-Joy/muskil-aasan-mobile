import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import PosterHomeScreen from "../app/(poster)/index";
import { communityTasks, tasks } from "@/data/mock";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe("PosterHomeScreen", () => {
  it("shows Your Latest Job for the current user's own first active task", async () => {
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    const latestTask = tasks.find((task) => task.status !== "completed")!;

    const { getByText } = await render(<PosterHomeScreen />);

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

  it("does not render the Provider app-shell header itself — that's owned by the (poster) layout now", async () => {
    mockUseRouter.mockReturnValue({ push: jest.fn() });

    const { queryByLabelText } = await render(<PosterHomeScreen />);

    expect(queryByLabelText("Open navigation menu")).toBeNull();
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
