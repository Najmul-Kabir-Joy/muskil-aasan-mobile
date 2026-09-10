import { View } from "react-native";
import type { Edges } from "react-native-safe-area-context";
import { OfferCard } from "@/features/marketplace/components";
import { AppHeader, EmptyState, ScrollScreen } from "@/shared/components/ui";
import { offers } from "@/data/mock";
import { spacing } from "@/theme/tokens";

/**
 * Provider "Responses" tab — a read-only view of offers received across the
 * Provider's posted jobs, using the same mock `offers`/`OfferCard` already
 * used by the "My Jobs" screen. Intentionally minimal: this screen exists
 * to give the new bottom-navigation destination somewhere real to land,
 * not to introduce a new response-management flow.
 */
export function ResponsesScreen({ edges }: { edges?: Edges }) {
  return (
    <ScrollScreen edges={edges}>
      <AppHeader title="Responses" subtitle="Offers your community has sent on your posted jobs." />
      {offers.length ? (
        <View style={{ gap: spacing.md }}>
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </View>
      ) : (
        <EmptyState
          title="No responses yet"
          body="When someone responds to one of your jobs, it will show up here."
        />
      )}
    </ScrollScreen>
  );
}
