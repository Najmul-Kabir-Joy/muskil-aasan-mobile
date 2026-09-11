import { useLocalSearchParams } from "expo-router";
import { ComingSoonScreen } from "@/features/marketplace/provider-shell/ComingSoonScreen";

export default function ProviderComingSoonRoute() {
  const { title } = useLocalSearchParams<{ title?: string }>();
  return <ComingSoonScreen title={title ?? "Coming soon"} edges={["left", "right"]} />;
}
