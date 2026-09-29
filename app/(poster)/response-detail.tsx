import { useLocalSearchParams } from "expo-router";
import { ProviderResponseDetailScreen } from "@/features/marketplace/responses/ProviderResponseDetailScreen";
import { ResponseNotFoundState } from "@/features/marketplace/responses/ResponseNotFoundState";
import { getResponseWithJob } from "@/data/mock";

const SHELL_EDGES = ["left", "right"] as const;

export default function ResponseDetailRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const match = id ? getResponseWithJob(id) : undefined;

  if (!match) return <ResponseNotFoundState edges={SHELL_EDGES} />;

  // Keyed by response id: this route lives in a tab navigator, so it stays
  // mounted when the `id` param changes. Without the key, the local
  // "selected" state would carry over from one Job Seeker's response to the
  // next one the Provider opens.
  return (
    <ProviderResponseDetailScreen
      key={match.response.id}
      task={match.task}
      response={match.response}
      edges={SHELL_EDGES}
    />
  );
}
