import { Tabs } from "expo-router";
import { useState } from "react";
import { AppDrawer } from "@/features/marketplace/app-shell/AppDrawer";
import { SeekerBottomNav } from "@/features/marketplace/app-shell/SeekerBottomNav";
import { AppShellHeader } from "@/features/marketplace/components";
import { SeekerActivityProvider } from "@/features/marketplace/seeker/SeekerActivityContext";

/**
 * Owns the persistent Job Seeker app shell — the shared top app bar, the
 * four-item Seeker bottom navigation (Home, Applications, Saved, Profile)
 * and the navigation drawer, whose mode switch is the only way back to Job
 * Provider mode. Individual screens render only their own page content.
 * The Job Provider counterpart is `app/(poster)/_layout.tsx`.
 *
 * Also owns the Seeker's shared prototype state (saved Jobs and
 * Applications), so it carries across the tabs.
 *
 * `backBehavior="history"`, as in the Provider shell: Back returns to the
 * previously visited screen rather than always to Home.
 */
export default function WorkerTabsLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <SeekerActivityProvider>
      <Tabs
        backBehavior="history"
        screenOptions={{
          headerShown: true,
          header: () => <AppShellHeader onOpenMenu={() => setDrawerOpen(true)} />,
        }}
        tabBar={(props) => <SeekerBottomNav {...props} />}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="applications" options={{ title: "Applications" }} />
        <Tabs.Screen name="saved" options={{ title: "Saved" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
        {/* Secondary: the drawer's not-yet-built destinations. */}
        <Tabs.Screen name="coming-soon" options={{ title: "Coming soon" }} />
      </Tabs>
      <AppDrawer mode="seeker" visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </SeekerActivityProvider>
  );
}
