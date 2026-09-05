import { useMemo, useState } from "react";
import { View } from "react-native";
import {
  ActionButton,
  AppHeader,
  EmptyState,
  OfferCard,
  PrimaryButton,
  Screen,
  SectionHeader,
  SelectableChip,
} from "@/shared/components/ui";
import { offers } from "@/data/mock";
import type { Offer } from "@/types/domain";

const tabs = ["Active", "Hired", "Completed", "Not selected"];

export default function WorkerOffersScreen() {
  const [activeTab, setActiveTab] = useState("Active");
  const [withdrawnOfferIds, setWithdrawnOfferIds] = useState<string[]>([]);
  const visibleOffers = useMemo(() => {
    const withLocalStatus: Offer[] = offers.map((offer) =>
      withdrawnOfferIds.includes(offer.id) ? { ...offer, status: "withdrawn" } : offer,
    );

    if (activeTab === "Hired")
      return withLocalStatus.filter((offer) => offer.status === "accepted");
    if (activeTab === "Not selected")
      return withLocalStatus.filter((offer) => ["rejected", "withdrawn"].includes(offer.status));
    if (activeTab === "Completed") return [];
    return withLocalStatus.filter((offer) => ["submitted", "viewed"].includes(offer.status));
  }, [activeTab, withdrawnOfferIds]);

  return (
    <Screen>
      <AppHeader
        title="Track your job offers."
        subtitle="Job seeker mode should always show status, last update, amount, and the next action."
      />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {tabs.map((tab) => (
          <SelectableChip
            key={tab}
            label={tab}
            selected={activeTab === tab}
            onPress={() => setActiveTab(tab)}
          />
        ))}
      </View>

      <SectionHeader title={`${activeTab} offers`} />
      {visibleOffers.map((offer) => (
        <View key={offer.id} style={{ gap: 10 }}>
          <OfferCard offer={offer} />
          {["submitted", "viewed"].includes(offer.status) ? (
            <ActionButton
              label="Withdraw offer"
              onPress={() => setWithdrawnOfferIds((value) => [...value, offer.id])}
              tone="secondary"
            />
          ) : null}
        </View>
      ))}

      {!visibleOffers.length ? (
        <EmptyState
          title={`No ${activeTab.toLowerCase()} offers`}
          body="Browse jobs and send your first offer with price, timing, relevant experience, and what is included."
          action={<PrimaryButton label="Browse jobs" href="/(worker)/jobs" />}
        />
      ) : null}
    </Screen>
  );
}
