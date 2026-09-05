import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { RoleSwitch, TaskCard } from "@/features/marketplace/components";
import { tasks } from "@/data/mock";

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
    await fireEvent.press(getByText("Job seeker"));

    expect(replace).toHaveBeenCalledWith("/(worker)/jobs");
    expect(push).not.toHaveBeenCalled();
  });

  it("replaces the route when switching to poster mode, instead of pushing", async () => {
    const replace = jest.fn();
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ replace, push });

    const { getByText } = await render(<RoleSwitch active="jobSeeker" />);
    await fireEvent.press(getByText("Poster mode"));

    expect(replace).toHaveBeenCalledWith("/(poster)");
    expect(push).not.toHaveBeenCalled();
  });
});

describe("TaskCard", () => {
  const task = tasks[0];

  it("navigates to the href the caller passes, not a hardcoded route", async () => {
    const replace = jest.fn();
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ replace, push });

    const { getByRole } = await render(
      <TaskCard task={task} cta="View job" href="/(worker)/offers" />,
    );
    await fireEvent.press(getByRole("button", { name: "View job" }));

    expect(push).toHaveBeenCalledWith("/(worker)/offers");
  });

  it("calls the caller's onPress instead of navigating when no href is given", async () => {
    const onPress = jest.fn();

    const { getByRole } = await render(<TaskCard task={task} cta="View job" onPress={onPress} />);
    await fireEvent.press(getByRole("button", { name: "View job" }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders no CTA button when the caller passes neither href nor onPress", async () => {
    const { queryByRole } = await render(<TaskCard task={task} />);

    expect(queryByRole("button")).toBeNull();
  });
});
