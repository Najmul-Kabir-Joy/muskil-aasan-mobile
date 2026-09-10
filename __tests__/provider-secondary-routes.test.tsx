import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import ProviderTaskStatusRoute from "../app/(poster)/task-status";
import ProviderSupportRoute from "../app/(poster)/support";
import TaskStatusRoute from "../app/task-status";
import SupportRoute from "../app/support";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe("Provider-shell secondary routes stay inside the shell's navigation", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn() });
  });

  it("(poster)/task-status renders the shared screen and links within the shell", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn() });

    const { getByText, getByRole } = await render(<ProviderTaskStatusRoute />);

    expect(getByText("One shared source of truth.")).toBeTruthy();
    await fireEvent.press(getByRole("button", { name: "Go to profile" }));
    expect(push).toHaveBeenCalledWith("/(poster)/profile");
  });

  it("(poster)/support renders the shared screen and links within the shell", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn() });

    const { getByText, getByRole } = await render(<ProviderSupportRoute />);

    expect(getByText("Report issue")).toBeTruthy();
    await fireEvent.press(getByRole("button", { name: "Back to task status" }));
    expect(push).toHaveBeenCalledWith("/(poster)/task-status");
  });

  it("the standalone root routes are unchanged and still link to each other outside the shell", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn() });

    const { getByRole } = await render(<TaskStatusRoute />);
    await fireEvent.press(getByRole("button", { name: "Report issue" }));
    expect(push).toHaveBeenCalledWith("/support");

    const { getByRole: getByRoleSupport } = await render(<SupportRoute />);
    await fireEvent.press(getByRoleSupport("button", { name: "Back to task status" }));
    expect(push).toHaveBeenCalledWith("/task-status");
  });
});
