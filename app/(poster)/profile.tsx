import { MarketplaceProfileScreen } from "@/features/marketplace/profile/MarketplaceProfileScreen";
import { getCurrentUserProfile } from "@/data/mock";

export default function ProviderProfileRoute() {
  return (
    <MarketplaceProfileScreen
      profile={getCurrentUserProfile()}
      viewer="owner"
      edges={["left", "right"]}
    />
  );
}
