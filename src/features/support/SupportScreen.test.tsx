import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { SupportScreen } from "./SupportScreen";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe("SupportScreen", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn() });
  });

  it("renders the report-issue content", async () => {
    const { getByText } = await render(<SupportScreen />);

    expect(getByText("Report issue")).toBeTruthy();
  });

  it("links to the standalone task-status route by default", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn() });

    const { getByRole } = await render(<SupportScreen />);

    await fireEvent.press(getByRole("button", { name: "Back to task status" }));
    expect(push).toHaveBeenCalledWith("/task-status");
  });

  it("stays inside the Provider shell when given a basePath, instead of dropping back to the standalone route", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn() });

    const { getByRole } = await render(<SupportScreen basePath="/(poster)" />);

    await fireEvent.press(getByRole("button", { name: "Back to task status" }));
    expect(push).toHaveBeenCalledWith("/(poster)/task-status");
  });
});
