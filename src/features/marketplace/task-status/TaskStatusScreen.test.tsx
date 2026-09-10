import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { TaskStatusScreen } from "./TaskStatusScreen";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe("TaskStatusScreen", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn() });
  });

  it("renders the shared timeline content", async () => {
    const { getByText } = await render(<TaskStatusScreen />);

    expect(getByText("One shared source of truth.")).toBeTruthy();
  });

  it("links to the standalone profile/support routes by default", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn() });

    const { getByRole } = await render(<TaskStatusScreen />);

    await fireEvent.press(getByRole("button", { name: "Go to profile" }));
    expect(push).toHaveBeenCalledWith("/profile");

    await fireEvent.press(getByRole("button", { name: "Report issue" }));
    expect(push).toHaveBeenCalledWith("/support");
  });

  it("stays inside the Provider shell when given a basePath, instead of dropping back to the standalone routes", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn() });

    const { getByRole } = await render(<TaskStatusScreen basePath="/(poster)" />);

    await fireEvent.press(getByRole("button", { name: "Go to profile" }));
    expect(push).toHaveBeenCalledWith("/(poster)/profile");

    await fireEvent.press(getByRole("button", { name: "Report issue" }));
    expect(push).toHaveBeenCalledWith("/(poster)/support");
  });
});
