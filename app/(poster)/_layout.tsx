import { Tabs } from "expo-router";
import { ProviderAppHeader } from "@/features/marketplace/components";
import { ProviderBottomNav } from "@/features/marketplace/provider-shell/ProviderBottomNav";

/**
 * Owns the persistent Job Provider app shell — the shared top app bar and
 * the notched bottom navigation with the elevated Post Job action — for
 * every authenticated Provider screen. Individual screens must not render
 * `ProviderAppHeader` or a nav bar themselves; only their own page content.
 * See `src/features/marketplace/provider-shell/ProviderBottomNav.tsx`.
 */
export default function PosterTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: () => <ProviderAppHeader />,
      }}
      tabBar={(props) => <ProviderBottomNav {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="responses" options={{ title: "Responses" }} />
      <Tabs.Screen name="post-task" options={{ title: "Post Job" }} />
      <Tabs.Screen name="tasks" options={{ title: "My Jobs" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
