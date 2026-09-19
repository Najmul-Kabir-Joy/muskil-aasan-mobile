import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import {
  CommunityPostCard,
  ProviderAppHeader,
  RoleSwitch,
  TaskCard,
} from "@/features/marketplace/components";
import { communityTasks, tasks } from "@/data/mock";
import { BRAND_NAME } from "@/shared/constants/brand";

// Mock at the expo-router module boundary (per docs/engineering/testing.md)
// rather than mounting a real navigation tree, since the only behavior under
// test is *which router method* RoleSwitch calls.
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe("ProviderAppHeader", () => {
  it("shows the brand and a static location, with no logo icon", async () => {
    const { getByText } = await render(<ProviderAppHeader />);

    expect(getByText(BRAND_NAME)).toBeTruthy();
    expect(getByText("Mirpur, Dhaka")).toBeTruthy();
  });

  it("has a notification button and a navigation-menu button, and no profile button", async () => {
    const { getByLabelText, queryByLabelText } = await render(<ProviderAppHeader />);

    expect(getByLabelText("Notifications")).toBeTruthy();
    expect(getByLabelText("Open navigation menu")).toBeTruthy();
    expect(queryByLabelText("Open profile")).toBeNull();
  });

  it("the navigation-menu button is tappable without crashing when no handler is given", async () => {
    const { getByLabelText } = await render(<ProviderAppHeader />);

    await fireEvent.press(getByLabelText("Open navigation menu"));
  });

  it("the navigation-menu button opens the drawer via the provided onOpenMenu handler", async () => {
    const onOpenMenu = jest.fn();
    const { getByLabelText } = await render(<ProviderAppHeader onOpenMenu={onOpenMenu} />);

    await fireEvent.press(getByLabelText("Open navigation menu"));
    expect(onOpenMenu).toHaveBeenCalledTimes(1);
  });

  it("does not show a fake unread-notification badge — there's no real unread state yet", async () => {
    const { getByLabelText } = await render(<ProviderAppHeader />);

    const icon = getByLabelText("Notifications");
    // The notification icon should be the only thing in its wrapper — no
    // extra dot/badge view alongside it.
    expect(icon.parent?.children.length).toBe(1);
  });
});

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

  it("still renders offerCount as offers, unaffected by the community feed's separate responseCount", async () => {
    const { getByText } = await render(<TaskCard task={task} />);

    expect(getByText(`${task.offerCount} offers`)).toBeTruthy();
  });
});

describe("CommunityPostCard", () => {
  const firstTask = communityTasks[0];
  const remoteTask = communityTasks[2];

  it("renders the poster's name and area, with no verification claim", async () => {
    const { getByText, queryByLabelText, queryByText } = await render(
      <CommunityPostCard task={firstTask} />,
    );

    expect(getByText("Nusrat Jahan")).toBeTruthy();
    expect(getByText(/Dhanmondi · 25 min ago/)).toBeTruthy();
    expect(queryByLabelText("Verified neighbor")).toBeNull();
    expect(queryByText("Verified")).toBeNull();
  });

  it("shows a Remote badge only for a remote task", async () => {
    const { getByText, queryByText, rerender } = await render(
      <CommunityPostCard task={firstTask} />,
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
    const { getByRole, getByText } = await render(<CommunityPostCard task={firstTask} />);

    expect(getByText("18")).toBeTruthy();
    await fireEvent.press(getByRole("button", { name: "Like job" }));
    expect(getByText("19")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "Unlike job" }));
    expect(getByText("18")).toBeTruthy();
  });

  it("shows no count or text next to the Refer action — it's an action, not a metric", async () => {
    const { getByRole } = await render(<CommunityPostCard task={firstTask} />);

    const referButton = getByRole("button", { name: "Refer someone" });
    expect(referButton).toBeTruthy();
    // Only one child (the icon) — no count/label text rendered alongside it.
    expect(referButton.children.length).toBe(1);
  });

  it("calls onRefer with the task when the Refer action is pressed", async () => {
    const onRefer = jest.fn();
    const { getByRole } = await render(<CommunityPostCard task={firstTask} onRefer={onRefer} />);

    await fireEvent.press(getByRole("button", { name: "Refer someone" }));
    expect(onRefer).toHaveBeenCalledWith(firstTask);
  });

  it("calls onOverflow with the task when the top-right options button is pressed", async () => {
    const onOverflow = jest.fn();
    const { getByRole } = await render(
      <CommunityPostCard task={firstTask} onOverflow={onOverflow} />,
    );

    await fireEvent.press(getByRole("button", { name: "More job options" }));
    expect(onOverflow).toHaveBeenCalledWith(firstTask);
  });

  it("renders exactly one options ('More job options') control — no duplicate overflow menu", async () => {
    const { getAllByRole } = await render(<CommunityPostCard task={firstTask} />);

    expect(getAllByRole("button", { name: "More job options" })).toHaveLength(1);
  });

  it("gives the small icon-only controls a hitSlop so their touch target is close to 44x44 despite a smaller visual size", async () => {
    const { getByRole } = await render(<CommunityPostCard task={firstTask} />);

    expect(getByRole("button", { name: "More job options" }).props.hitSlop).toBe(6);
    expect(getByRole("button", { name: "Like job" }).props.hitSlop).toBe(12);
    expect(getByRole("button", { name: "Refer someone" }).props.hitSlop).toBe(12);
  });

  it("renders the task's responseCount, not offerCount, as the response count", async () => {
    // Guards against re-conflating the two: offerCount means offers/
    // applications elsewhere in the marketplace, responseCount is this
    // feed's own comment count — they must stay independent.
    expect(firstTask.offerCount).not.toBe(firstTask.responseCount);

    const { getByText, queryByText } = await render(<CommunityPostCard task={firstTask} />);

    expect(getByText("7 responses")).toBeTruthy();
    expect(queryByText(`${firstTask.offerCount} responses`)).toBeNull();
  });

  it("falls back to 0 responses when responseCount is not set", async () => {
    const { getByText } = await render(
      <CommunityPostCard task={{ ...firstTask, responseCount: undefined }} />,
    );

    expect(getByText("0 responses")).toBeTruthy();
  });
});
