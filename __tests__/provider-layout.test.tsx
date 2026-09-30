import { render } from "@testing-library/react-native";
import { Tabs } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import PosterTabsLayout from "../app/(poster)/_layout";

jest.mock("expo-router", () => {
  const MockTabs = jest.fn(({ children }: { children?: unknown }) => children ?? null);
  return {
    Tabs: Object.assign(MockTabs, { Screen: () => null }),
    useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  };
});

const mockTabs = Tabs as unknown as jest.Mock;

describe("Provider tabs layout", () => {
  it("goes back to the previously visited screen, not the first tab", async () => {
    // Regression: with the default `firstRoute` behaviour, Back from Response
    // Detail (a secondary route in this navigator) landed on Home instead of
    // the Responses list it was opened from.
    await render(
      // The shell's drawer reads safe-area insets, which need a provider —
      // see AppDrawer.test.tsx.
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        <PosterTabsLayout />
      </SafeAreaProvider>,
    );

    expect(mockTabs).toHaveBeenCalledWith(
      expect.objectContaining({ backBehavior: "history" }),
      undefined,
    );
  });
});
