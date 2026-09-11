import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import type { ReactElement } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ProviderDrawer } from "./ProviderDrawer";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

// `ProviderDrawer` reads insets via `useSafeAreaInsets()` (see the
// component for why), which throws without a `SafeAreaProvider` ancestor —
// the real app gets one for free from expo-router's root layout, so tests
// supply their own. `initialMetrics` makes it render synchronously instead
// of waiting for a native layout event that never fires under the test
// renderer.
function renderDrawer(element: ReactElement) {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      {element}
    </SafeAreaProvider>,
  );
}

describe("ProviderDrawer", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn() });
  });

  it("renders the user summary, switch-mode section (Provider active), and every expected row", async () => {
    const { getByText, getAllByText, getByLabelText } = await renderDrawer(
      <ProviderDrawer visible onClose={jest.fn()} />,
    );

    // User summary — "Mirpur, Dhaka" appears twice: the user's own area, and
    // again as the Location/Area row's trailing value.
    expect(getByText("Nadia Rahman")).toBeTruthy();
    expect(getAllByText("Mirpur, Dhaka")).toHaveLength(2);
    expect(getByText("+880 17••••••••")).toBeTruthy();
    expect(getByText("View Profile")).toBeTruthy();

    // Switch mode — Provider is the active mode
    expect(getByText("Switch mode")).toBeTruthy();
    expect(getByText("Job Provider")).toBeTruthy();
    expect(getByText("ACTIVE")).toBeTruthy();
    expect(getByText("I need help")).toBeTruthy();
    expect(getByText("Job Seeker")).toBeTruthy();
    expect(getByText("I want to help & earn")).toBeTruthy();
    expect(getByText("One account • Switch anytime")).toBeTruthy();

    // Secondary actions
    expect(getByText("Saved Jobs")).toBeTruthy();
    expect(getByText("Identity Setup")).toBeTruthy();
    expect(getByText("Not added")).toBeTruthy();
    expect(getByText("Job Interests")).toBeTruthy();

    // Account & preferences
    expect(getByText("Account & Preferences")).toBeTruthy();
    expect(getByText("Personal Information")).toBeTruthy();
    expect(getByText("Location / Area")).toBeTruthy();
    expect(getByText("Notifications")).toBeTruthy();

    // Support & legal
    expect(getByText("Support & Legal")).toBeTruthy();
    expect(getByText("Help & Support")).toBeTruthy();
    expect(getByText("Terms & Conditions")).toBeTruthy();
    expect(getByText("Privacy Policy")).toBeTruthy();

    // Log out
    expect(getByText("Log Out")).toBeTruthy();
    expect(getByLabelText("Close navigation menu")).toBeTruthy();
  });

  it("never duplicates the primary bottom-navigation destinations as drawer rows", async () => {
    const { queryByText } = await renderDrawer(<ProviderDrawer visible onClose={jest.fn()} />);

    // "Home", "Responses", "Post Job", "My Jobs" must not appear as their own
    // drawer row labels — those live only in the persistent bottom nav.
    // ("Job Interests" contains none of these as a substring, so exact
    // matches are safe here.)
    expect(queryByText("Home")).toBeNull();
    expect(queryByText("Responses")).toBeNull();
    expect(queryByText("Post Job")).toBeNull();
    expect(queryByText("My Jobs")).toBeNull();
  });

  it("uses neutral identity wording, never verification/trust claims", async () => {
    const { queryByText } = await renderDrawer(<ProviderDrawer visible onClose={jest.fn()} />);

    expect(queryByText(/verified/i)).toBeNull();
    expect(queryByText(/trusted/i)).toBeNull();
    expect(queryByText(/approved/i)).toBeNull();
    expect(queryByText(/rating/i)).toBeNull();
    expect(queryByText(/earnings/i)).toBeNull();
  });

  it("has a clear close (X) button that closes the drawer", async () => {
    const onClose = jest.fn();
    const { getByLabelText } = await renderDrawer(<ProviderDrawer visible onClose={onClose} />);

    await fireEvent.press(getByLabelText("Close navigation menu"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("tapping outside the drawer (the dimmed overlay) closes it", async () => {
    const onClose = jest.fn();
    const { getByLabelText } = await renderDrawer(<ProviderDrawer visible onClose={onClose} />);

    await fireEvent.press(getByLabelText("Close navigation menu overlay"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("View Profile navigates to the in-shell Provider profile and closes the drawer", async () => {
    const push = jest.fn();
    const onClose = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn() });

    const { getByText } = await renderDrawer(<ProviderDrawer visible onClose={onClose} />);
    await fireEvent.press(getByText("View Profile"));

    expect(push).toHaveBeenCalledWith("/(poster)/profile");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("switching to Job Seeker uses the existing prototype routing (replace, not push) and closes the drawer", async () => {
    const replace = jest.fn();
    const push = jest.fn();
    const onClose = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace });

    const { getByLabelText } = await renderDrawer(<ProviderDrawer visible onClose={onClose} />);
    await fireEvent.press(getByLabelText("Switch to Job Seeker"));

    expect(replace).toHaveBeenCalledWith("/(worker)/jobs");
    expect(push).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Help & Support navigates to the existing in-shell support route", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn() });

    const { getByText } = await renderDrawer(<ProviderDrawer visible onClose={jest.fn()} />);
    await fireEvent.press(getByText("Help & Support"));

    expect(push).toHaveBeenCalledWith("/(poster)/support");
  });

  it("a not-yet-built destination navigates to the shared coming-soon placeholder with its own title", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn() });

    const { getByText } = await renderDrawer(<ProviderDrawer visible onClose={jest.fn()} />);
    await fireEvent.press(getByText("Saved Jobs"));

    expect(push).toHaveBeenCalledWith({
      pathname: "/(poster)/coming-soon",
      params: { title: "Saved Jobs" },
    });
  });

  it("Log Out returns to the welcome screen and closes the drawer", async () => {
    const replace = jest.fn();
    const onClose = jest.fn();
    mockUseRouter.mockReturnValue({ push: jest.fn(), replace });

    const { getByText } = await renderDrawer(<ProviderDrawer visible onClose={onClose} />);
    await fireEvent.press(getByText("Log Out"));

    expect(replace).toHaveBeenCalledWith("/");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
