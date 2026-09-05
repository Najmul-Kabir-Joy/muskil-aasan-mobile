import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { RoleSwitch } from "@/features/marketplace/components";

// Mock at the expo-router module boundary (per docs/engineering/testing.md)
// rather than mounting a real navigation tree, since the only behavior under
// test is *which router method* RoleSwitch calls.
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe("RoleSwitch", () => {
  it("replaces the route when switching to job seeker mode, instead of pushing", async () => {
    const replace = jest.fn();
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ replace, push });

    const { getByText } = await render(<RoleSwitch active="poster" />);
    fireEvent.press(getByText("Job seeker"));

    expect(replace).toHaveBeenCalledWith("/(worker)/jobs");
    expect(push).not.toHaveBeenCalled();
  });

  it("replaces the route when switching to poster mode, instead of pushing", async () => {
    const replace = jest.fn();
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ replace, push });

    const { getByText } = await render(<RoleSwitch active="jobSeeker" />);
    fireEvent.press(getByText("Poster mode"));

    expect(replace).toHaveBeenCalledWith("/(poster)");
    expect(push).not.toHaveBeenCalled();
  });
});
