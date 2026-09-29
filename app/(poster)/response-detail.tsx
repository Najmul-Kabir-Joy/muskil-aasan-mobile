import { useLocalSearchParams } from "expo-router";
import { ProviderResponseDetailScreen } from "@/features/marketplace/responses/ProviderResponseDetailScreen";
import { getResponseWithJob } from "@/data/mock";

export default function ResponseDetailRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const match = id ? getResponseWithJob(id) : undefined;

  if (!match) return null;

  return (
    <ProviderResponseDetailScreen
      task={match.task}
      response={match.response}
      edges={["left", "right"]}
    />
  );
}
