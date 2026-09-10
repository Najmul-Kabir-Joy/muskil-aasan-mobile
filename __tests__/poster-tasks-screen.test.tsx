import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import PosterTasksScreen from "../app/(poster)/tasks";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe("PosterTasksScreen (My Jobs)", () => {
  it("still renders its own page content after being restricted to left/right safe-area edges", async () => {
    mockUseRouter.mockReturnValue({ push: jest.fn() });

    const { getByText } = await render(<PosterTasksScreen />);

    expect(getByText("Compare offers safely.")).toBeTruthy();
    expect(getByText("My tasks")).toBeTruthy();
  });

  it("links to task status and support inside the Provider shell, not the standalone routes", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });

    const { getByRole } = await render(<PosterTasksScreen />);

    await fireEvent.press(getByRole("button", { name: "View task timeline" }));
    expect(push).toHaveBeenCalledWith("/(poster)/task-status");

    await fireEvent.press(getByRole("button", { name: "Report an issue" }));
    expect(push).toHaveBeenCalledWith("/(poster)/support");
  });
});
