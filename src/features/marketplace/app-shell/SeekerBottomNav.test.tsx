import type { BottomTabBarProps } from "expo-router/js-tabs";
import { fireEvent, render } from "@testing-library/react-native";
import { SeekerActivityProvider } from "@/features/marketplace/seeker/SeekerActivityContext";
import { seekerApplications } from "@/data/mock";
import type { SeekerApplication } from "@/types/domain";
import { SEEKER_NAV_ITEMS, SeekerBottomNav } from "./SeekerBottomNav";

const ROUTES = [
  { key: "index-1", name: "index", params: undefined },
  { key: "applications-1", name: "applications", params: undefined },
  { key: "saved-1", name: "saved", params: undefined },
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

function renderNav(props: BottomTabBarProps, applications: SeekerApplication[] = []) {
  return render(
    <SeekerActivityProvider initialApplications={applications}>
      <SeekerBottomNav {...props} />
    </SeekerActivityProvider>,
  );
}

describe("SeekerBottomNav", () => {
  it("has exactly four destinations, in order: Home, Applications, Saved, Profile", async () => {
    expect(SEEKER_NAV_ITEMS.map((item) => item.label)).toEqual([
      "Home",
      "Applications",
      "Saved",
      "Profile",
    ]);

    const { getAllByRole } = await renderNav(buildProps(0));
    expect(getAllByRole("button")).toHaveLength(4);
  });

  it("has no Earnings, Offers or Post Job action", async () => {
    const { queryByText, queryByLabelText } = await renderNav(buildProps(0));

    expect(queryByText(/earnings/i)).toBeNull();
    expect(queryByText(/offers?/i)).toBeNull();
    expect(queryByText(/post/i)).toBeNull();
    expect(queryByLabelText("Post a Job")).toBeNull();
  });

  it("marks the current route's tab as selected", async () => {
    const { getByLabelText } = await renderNav(buildProps(2));

    expect(getByLabelText("Saved").props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(getByLabelText("Home").props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
  });

  it("navigates to the tapped destination's route", async () => {
    const navigate = jest.fn();
    const { getByLabelText } = await renderNav(buildProps(0, navigate));

    await fireEvent.press(getByLabelText("Applications"));
    expect(navigate).toHaveBeenCalledWith("applications");

    await fireEvent.press(getByLabelText("Saved"));
    expect(navigate).toHaveBeenCalledWith("saved");

    await fireEvent.press(getByLabelText("Profile"));
    expect(navigate).toHaveBeenCalledWith("profile");
  });

  it("doesn't navigate again when the active tab is pressed", async () => {
    const navigate = jest.fn();
    const { getByLabelText } = await renderNav(buildProps(0, navigate));

    await fireEvent.press(getByLabelText("Home"));
    expect(navigate).not.toHaveBeenCalled();
  });

  it("shows how many job requests are waiting on Applications", async () => {
    const { getByLabelText, getByText } = await renderNav(buildProps(0), seekerApplications);

    expect(getByLabelText("Applications, 1 job request waiting")).toBeTruthy();
    expect(getByText("1")).toBeTruthy();
  });

  it("shows no count when no job request is waiting", async () => {
    const { getByLabelText, queryByText } = await renderNav(buildProps(0));

    expect(getByLabelText("Applications")).toBeTruthy();
    expect(queryByText("1")).toBeNull();
  });
});
