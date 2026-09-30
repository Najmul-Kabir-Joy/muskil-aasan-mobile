import { MarketplaceProfileScreen } from "@/features/marketplace/profile/MarketplaceProfileScreen";
import { getCurrentUserProfile } from "@/data/mock";

// My Profile inside the Job Seeker shell shows the Seeker side: a profile
// follows the current app mode, switched from the drawer.
export default function SeekerProfileRoute() {
  return (
    <MarketplaceProfileScreen
      profile={getCurrentUserProfile()}
      viewer="owner"
      side="seeker"
      edges={["left", "right"]}
    />
  );
}
