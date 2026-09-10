import type { Edges } from "react-native-safe-area-context";
import { AppHeader, EmptyState, ScrollScreen } from "@/shared/components/ui";

/**
 * Provider "Responses" tab — a safe placeholder for now. This PR is scoped
 * to the app shell/navigation, not the Responses product flow (ratings,
 * verification, offer status, hiring, etc. are all undefined product
 * decisions — see docs/engineering/domain-and-terminology.md). It exists so
 * the bottom-navigation destination has somewhere real to land and can be
 * navigated to/tested; the actual feature will be designed separately.
 */
export function ResponsesScreen({ edges }: { edges?: Edges }) {
  return (
    <ScrollScreen edges={edges}>
      <AppHeader title="Responses" />
      <EmptyState title="No responses yet" body="Responses to your job posts will appear here." />
    </ScrollScreen>
  );
}
