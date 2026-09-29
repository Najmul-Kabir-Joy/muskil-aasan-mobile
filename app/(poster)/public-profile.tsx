import { useLocalSearchParams } from "expo-router";
import { MarketplaceProfileScreen } from "@/features/marketplace/profile/MarketplaceProfileScreen";
import { ProfileNotFoundState } from "@/features/marketplace/profile/ProfileNotFoundState";
import { getMarketplaceProfile } from "@/data/mock";

const SHELL_EDGES = ["left", "right"] as const;

// How someone else sees a person's profile: `id` is their account id; `view`
// opens the Seeker side when it's "seeker", and the Provider side otherwise.
export default function PublicProfileRoute() {
  const { id, view } = useLocalSearchParams<{ id?: string; view?: string }>();
  const profile = id ? getMarketplaceProfile(id) : undefined;

  if (!profile) return <ProfileNotFoundState edges={SHELL_EDGES} />;

  const initialSide = view === "seeker" ? "seeker" : "provider";

  // Keyed by person and side: this route lives in a tab navigator, so it
  // stays mounted when its params change. Without the key, one person's
  // Provider/Seeker selection would carry over to the next profile opened.
  return (
    <MarketplaceProfileScreen
      key={`${profile.id}:${initialSide}`}
      profile={profile}
      viewer="public"
      initialSide={initialSide}
      edges={SHELL_EDGES}
    />
  );
}
