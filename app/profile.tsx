import { MarketplaceProfileScreen } from "@/features/marketplace/profile/MarketplaceProfileScreen";
import { getCurrentUserProfile } from "@/data/mock";

export default function ProfileRoute() {
  return <MarketplaceProfileScreen profile={getCurrentUserProfile()} viewer="owner" />;
}
