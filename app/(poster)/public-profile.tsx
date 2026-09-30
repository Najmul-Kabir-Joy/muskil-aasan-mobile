import { useLocalSearchParams } from "expo-router";
import { MarketplaceProfileScreen } from "@/features/marketplace/profile/MarketplaceProfileScreen";
import { ProfileNotFoundState } from "@/features/marketplace/profile/ProfileNotFoundState";
import { getMarketplaceProfile } from "@/data/mock";

const SHELL_EDGES = ["left", "right"] as const;

// How someone else sees a person's profile: `id` is their account id; `view`
// picks the side the entry point is about — "seeker" (e.g. from a Response)
// or the Provider side otherwise. There's no switch on the profile itself.
export default function PublicProfileRoute() {
  const { id, view } = useLocalSearchParams<{ id?: string; view?: string }>();
  const profile = id ? getMarketplaceProfile(id) : undefined;

  if (!profile) return <ProfileNotFoundState edges={SHELL_EDGES} />;

  const side = view === "seeker" ? "seeker" : "provider";

  // Keyed by person and side: this route lives in a tab navigator, so it
  // stays mounted when its params change. Without the key, local state (e.g.
  // scroll position) would carry over from one profile to the next.
  return (
    <MarketplaceProfileScreen
      key={`${profile.id}:${side}`}
      profile={profile}
      viewer="public"
      side={side}
      edges={SHELL_EDGES}
    />
  );
}
