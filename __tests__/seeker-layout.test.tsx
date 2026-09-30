import { render } from "@testing-library/react-native";
import { Tabs } from "expo-router";
import type { ReactElement } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import WorkerTabsLayout from "../app/(worker)/_layout";
import { BRAND_NAME } from "@/shared/constants/brand";

jest.mock("expo-router", () => {
  const MockTabs = jest.fn(({ children }: { children?: unknown }) => children ?? null);
  const MockScreen = jest.fn(() => null);
  return {
    Tabs: Object.assign(MockTabs, { Screen: MockScreen }),
    useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  };
});

const mockTabs = Tabs as unknown as jest.Mock;
const mockScreen = Tabs.Screen as unknown as jest.Mock;

function renderLayout(element: ReactElement) {
  return render(
    // The drawer reads safe-area insets — see AppDrawer.test.tsx.
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

function screenNames(): string[] {
  return mockScreen.mock.calls.map(([props]) => (props as { name: string }).name);
}

describe("Job Seeker tabs layout", () => {
  beforeEach(() => {
    mockTabs.mockClear();
    mockScreen.mockClear();
  });

  it("registers Home first (the default Seeker destination), then Applications, Saved, Profile", async () => {
    await renderLayout(<WorkerTabsLayout />);

    expect(screenNames().slice(0, 4)).toEqual(["index", "applications", "saved", "profile"]);
  });

  it("has no legacy Find jobs, Offers or Earnings routes", async () => {
    await renderLayout(<WorkerTabsLayout />);

    expect(screenNames()).not.toContain("jobs");
    expect(screenNames()).not.toContain("offers");
    expect(screenNames()).not.toContain("earnings");
  });

  it("goes back to the previously visited screen, like the Provider shell", async () => {
    await renderLayout(<WorkerTabsLayout />);

    expect(mockTabs).toHaveBeenCalledWith(
      expect.objectContaining({ backBehavior: "history" }),
      undefined,
    );
  });

  it("shows the shared app header (brand, menu) above every Seeker screen, with no mode switch in it", async () => {
    await renderLayout(<WorkerTabsLayout />);

    const [[props]] = mockTabs.mock.calls as [
      [{ screenOptions: { headerShown: boolean; header: () => ReactElement } }],
    ];
    expect(props.screenOptions.headerShown).toBe(true);

    const { getByText, getByLabelText, queryByText } = await renderLayout(
      props.screenOptions.header(),
    );
    expect(getByText(BRAND_NAME)).toBeTruthy();
    expect(getByLabelText("Open navigation menu")).toBeTruthy();
    expect(queryByText(/job seeker|job provider|poster mode/i)).toBeNull();
  });
});
