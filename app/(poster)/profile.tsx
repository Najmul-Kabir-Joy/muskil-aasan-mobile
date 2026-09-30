import { MarketplaceProfileScreen } from "@/features/marketplace/profile/MarketplaceProfileScreen";
import { getCurrentUserProfile } from "@/data/mock";

// My Profile inside the Job Provider shell shows the Provider side: a
// profile follows the current app mode, switched from the drawer.
export default function ProviderProfileRoute() {
  return (
    <MarketplaceProfileScreen
      profile={getCurrentUserProfile()}
      viewer="owner"
      side="provider"
      edges={["left", "right"]}
    />
  );
}
