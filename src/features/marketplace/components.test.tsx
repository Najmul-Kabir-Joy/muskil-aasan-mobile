import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { CommunityPostCard, RoleSwitch, TaskCard } from "@/features/marketplace/components";
import { communityTasks, tasks } from "@/data/mock";

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

describe("CommunityPostCard", () => {
  const verifiedTask = communityTasks[0];
  const remoteTask = communityTasks[2];

  it("renders the poster's name, area, and verified badge", async () => {
    const { getByText, getByLabelText } = await render(<CommunityPostCard task={verifiedTask} />);

    expect(getByText("Nusrat Jahan")).toBeTruthy();
    expect(getByText(/Dhanmondi · 25 min ago/)).toBeTruthy();
    expect(getByLabelText("Verified neighbor")).toBeTruthy();
  });

  it("does not render a verified badge for a poster with no verification", async () => {
    const { queryByLabelText } = await render(<CommunityPostCard task={remoteTask} />);

    expect(queryByLabelText("Verified neighbor")).toBeNull();
  });

  it("shows a Remote badge only for a remote task", async () => {
    const { getByText, queryByText, rerender } = await render(
      <CommunityPostCard task={verifiedTask} />,
    );
    expect(queryByText("Remote")).toBeNull();

    await rerender(<CommunityPostCard task={remoteTask} />);
    expect(getByText("Remote")).toBeTruthy();
  });

  it("shows a photo note only when the task has one", async () => {
    const { queryByText } = await render(<CommunityPostCard task={communityTasks[1]} />);

    expect(queryByText("Hatil box & flatpack kit photo attached")).toBeTruthy();
  });

  it("toggles the like count locally without a backend, starting from the task's like count", async () => {
    const { getByRole, getByText } = await render(<CommunityPostCard task={verifiedTask} />);

    expect(getByText("18")).toBeTruthy();
    await fireEvent.press(getByRole("button", { name: "Like" }));
    expect(getByText("19")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "Unlike" }));
    expect(getByText("18")).toBeTruthy();
  });

  it("toggles Save / Saved locally", async () => {
    const { getByRole } = await render(<CommunityPostCard task={verifiedTask} />);

    await fireEvent.press(getByRole("button", { name: "Save" }));
    expect(getByRole("button", { name: "Saved" })).toBeTruthy();
  });

  it("renders the offer count as responses, not a separate invented metric", async () => {
    const { getByText } = await render(<CommunityPostCard task={verifiedTask} />);

    expect(getByText("7 responses")).toBeTruthy();
  });
});
