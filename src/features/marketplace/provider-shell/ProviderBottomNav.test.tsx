import type { BottomTabBarProps } from "expo-router/js-tabs";
import { fireEvent, render } from "@testing-library/react-native";
import { ProviderBottomNav } from "./ProviderBottomNav";

const ROUTES = [
  { key: "index-1", name: "index", params: undefined },
  { key: "responses-1", name: "responses", params: undefined },
  { key: "post-task-1", name: "post-task", params: undefined },
  { key: "tasks-1", name: "tasks", params: undefined },
  { key: "profile-1", name: "profile", params: undefined },
];

function buildProps(activeIndex: number, navigate = jest.fn()): BottomTabBarProps {
  return {
    state: { index: activeIndex, routes: ROUTES } as unknown as BottomTabBarProps["state"],
    descriptors: {} as unknown as BottomTabBarProps["descriptors"],
    navigation: { navigate } as unknown as BottomTabBarProps["navigation"],
    insets: { top: 0, right: 0, bottom: 34, left: 0 },
  };
}

describe("ProviderBottomNav", () => {
  it("renders all five destinations in the exact required order", async () => {
    const { getByLabelText } = await render(<ProviderBottomNav {...buildProps(0)} />);

    expect(getByLabelText("Home")).toBeTruthy();
    expect(getByLabelText("Responses")).toBeTruthy();
    expect(getByLabelText("Post a Job")).toBeTruthy();
    expect(getByLabelText("My Jobs")).toBeTruthy();
    expect(getByLabelText("Profile")).toBeTruthy();
  });

  it("marks the current route's tab as the selected accessibility state", async () => {
    const { getByLabelText } = await render(<ProviderBottomNav {...buildProps(3)} />);

    expect(getByLabelText("My Jobs").props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(getByLabelText("Home").props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
  });

  it("navigates to the tapped destination's route", async () => {
    const navigate = jest.fn();
    const { getByLabelText } = await render(<ProviderBottomNav {...buildProps(0, navigate)} />);

    await fireEvent.press(getByLabelText("Responses"));
    expect(navigate).toHaveBeenCalledWith("responses");

    await fireEvent.press(getByLabelText("My Jobs"));
    expect(navigate).toHaveBeenCalledWith("tasks");

    await fireEvent.press(getByLabelText("Profile"));
    expect(navigate).toHaveBeenCalledWith("profile");
  });

  it("does not navigate again when the already-active tab is pressed", async () => {
    const navigate = jest.fn();
    const { getByLabelText } = await render(<ProviderBottomNav {...buildProps(0, navigate)} />);

    await fireEvent.press(getByLabelText("Home"));
    expect(navigate).not.toHaveBeenCalled();
  });

  it("Post Job is a distinct elevated action, not a normal grid tab, and navigates to the post-task route", async () => {
    const navigate = jest.fn();
    const { getByLabelText } = await render(<ProviderBottomNav {...buildProps(0, navigate)} />);

    const postJobButton = getByLabelText("Post a Job");
    expect(postJobButton.props.accessibilityRole).toBe("button");

    await fireEvent.press(postJobButton);
    expect(navigate).toHaveBeenCalledWith("post-task");
  });

  it("Post Job remains present and pressable while a different tab is active", async () => {
    const navigate = jest.fn();
    const { getByLabelText } = await render(<ProviderBottomNav {...buildProps(4, navigate)} />);

    await fireEvent.press(getByLabelText("Post a Job"));
    expect(navigate).toHaveBeenCalledWith("post-task");
  });

  it("keeps Responses highlighted while on the response-detail secondary route", async () => {
    const props = buildProps(0);
    props.state = {
      index: 5,
      routes: [
        ...ROUTES,
        { key: "response-detail-1", name: "response-detail", params: { id: "r1" } },
      ],
    } as unknown as BottomTabBarProps["state"];

    const { getByLabelText } = await render(<ProviderBottomNav {...props} />);

    expect(getByLabelText("Responses").props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(getByLabelText("Home").props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
  });

  it("keeps Profile highlighted on the Profile tab", async () => {
    const { getByLabelText } = await render(<ProviderBottomNav {...buildProps(4)} />);

    expect(getByLabelText("Profile").props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(getByLabelText("Home").props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
  });

  it("keeps Profile highlighted while viewing someone's public profile", async () => {
    const props = buildProps(0);
    props.state = {
      index: 5,
      routes: [
        ...ROUTES,
        { key: "public-profile-1", name: "public-profile", params: { id: "w1" } },
      ],
    } as unknown as BottomTabBarProps["state"];

    const { getByLabelText } = await render(<ProviderBottomNav {...props} />);

    expect(getByLabelText("Profile").props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
  });

  it("pressing Profile from someone's public profile returns to the user's own Profile tab", async () => {
    const navigate = jest.fn();
    const props = buildProps(0, navigate);
    props.state = {
      index: 5,
      routes: [
        ...ROUTES,
        { key: "public-profile-1", name: "public-profile", params: { id: "w1" } },
      ],
    } as unknown as BottomTabBarProps["state"];

    const { getByLabelText } = await render(<ProviderBottomNav {...props} />);
    await fireEvent.press(getByLabelText("Profile"));

    expect(navigate).toHaveBeenCalledWith("profile");
  });

  it("pressing Responses while on response-detail still navigates to the Responses list", async () => {
    const navigate = jest.fn();
    const props = buildProps(0, navigate);
    props.state = {
      index: 5,
      routes: [
        ...ROUTES,
        { key: "response-detail-1", name: "response-detail", params: { id: "r1" } },
      ],
    } as unknown as BottomTabBarProps["state"];

    const { getByLabelText } = await render(<ProviderBottomNav {...props} />);
    await fireEvent.press(getByLabelText("Responses"));

    expect(navigate).toHaveBeenCalledWith("responses");
  });
});
