import { render } from "@testing-library/react-native";
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
});
