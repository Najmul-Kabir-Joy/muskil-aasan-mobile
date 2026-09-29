import { Tabs } from "expo-router";
import { useState } from "react";
import { ProviderAppHeader } from "@/features/marketplace/components";
import { ProviderBottomNav } from "@/features/marketplace/provider-shell/ProviderBottomNav";
import { ProviderDrawer } from "@/features/marketplace/provider-shell/ProviderDrawer";

/**
 * Owns the persistent Job Provider app shell — the shared top app bar, the
 * notched bottom navigation with the elevated Post Job action, and the
 * navigation drawer the header's hamburger button opens — for every
 * authenticated Provider screen. Individual screens must not render
 * `ProviderAppHeader`, a nav bar, or a drawer themselves; only their own
 * page content. See `src/features/marketplace/provider-shell/`.
 *
 * Drawer open/close state is owned here (not by `ProviderAppHeader` or by
 * individual screens) so there is exactly one drawer instance, reachable
 * identically from every screen in this layout.
 *
 * `backBehavior="history"`: Back returns to the previously visited screen.
 * The default (`firstRoute`) would send Back from a secondary screen such as
 * Response Detail to Home instead of the Responses list it was opened from.
 */
export default function PosterTabsLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Tabs
        backBehavior="history"
        screenOptions={{
          headerShown: true,
          header: () => <ProviderAppHeader onOpenMenu={() => setDrawerOpen(true)} />,
        }}
        tabBar={(props) => <ProviderBottomNav {...props} />}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="responses" options={{ title: "Responses" }} />
        <Tabs.Screen name="post-task" options={{ title: "Post Job" }} />
        <Tabs.Screen name="tasks" options={{ title: "My Jobs" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
        {/* Secondary Provider screens — reachable by navigation, not bottom-nav
            or drawer destinations directly listed here, but living here
            (rather than at the app root) keeps the shared header/bottom nav
            visible instead of dropping away. */}
        <Tabs.Screen name="task-status" options={{ title: "Task status" }} />
        <Tabs.Screen name="support" options={{ title: "Support" }} />
        <Tabs.Screen name="coming-soon" options={{ title: "Coming soon" }} />
        <Tabs.Screen name="response-detail" options={{ title: "Response Detail" }} />
      </Tabs>
      <ProviderDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
