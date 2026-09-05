import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { ActionButton, AppHeader, Badge, EmptyState, OfferCard, PrimaryButton, Screen, SectionHeader, SelectableChip, TaskCard } from "@/components/ui";
import { offers, tasks } from "@/data/mock";
import { colors } from "@/theme/tokens";

export default function PosterTasksScreen() {
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0].id);
  const [sort, setSort] = useState("Best match");
  const [hiddenOfferIds, setHiddenOfferIds] = useState<string[]>([]);
  const [hiredOfferId, setHiredOfferId] = useState<string | null>(null);
  const activeTask = tasks.find((task) => task.id === selectedTaskId) ?? tasks[0];
  const taskOffers = useMemo(() => {
    const visibleOffers = offers.filter((offer) => offer.taskId === activeTask.id && !hiddenOfferIds.includes(offer.id));

    if (sort === "Lowest price") {
      return [...visibleOffers].sort((a, b) => Number(a.amount.replace(/\D/g, "")) - Number(b.amount.replace(/\D/g, "")));
    }

    if (sort === "Highest rating") {
      return [...visibleOffers].sort((a, b) => b.worker.rating - a.worker.rating);
    }

    return visibleOffers;
  }, [activeTask.id, hiddenOfferIds, sort]);
  const hiredOffer = offers.find((offer) => offer.id === hiredOfferId);

  return (
    <Screen>
      <AppHeader title="Compare offers safely." subtitle="Show status, budget, timeline summary, and clear hire/pass decisions before contact is unlocked." />

      <SectionHeader title="My tasks" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {tasks.map((task) => (
          <SelectableChip key={task.id} label={task.title} selected={selectedTaskId === task.id} onPress={() => setSelectedTaskId(task.id)} />
        ))}
      </View>

      <TaskCard task={activeTask} cta="Status" />

      {hiredOffer ? (
        <EmptyState title={`Mock hire confirmed: ${hiredOffer.worker.name}`} body="Other offers should move to not selected after a real backend status transition. This prototype keeps it local for UI review." />
      ) : null}

      <SectionHeader title="Offers received" action={<Badge label={`${taskOffers.length} visible`} tone="success" />} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {["Best match", "Lowest price", "Highest rating"].map((item) => (
          <SelectableChip key={item} label={item} selected={sort === item} onPress={() => setSort(item)} />
        ))}
      </View>
      {taskOffers.length ? (
        taskOffers.map((offer) => (
          <View key={offer.id} style={{ gap: 10 }}>
            <OfferCard offer={{ ...offer, status: hiredOfferId === offer.id ? "accepted" : offer.status }} />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <ActionButton label="Pass" onPress={() => setHiddenOfferIds((value) => [...value, offer.id])} tone="secondary" />
              <ActionButton label={`Hire for ${offer.amount}`} onPress={() => setHiredOfferId(offer.id)} />
            </View>
          </View>
        ))
      ) : (
        <Text style={{ color: colors.muted }}>No visible offers. Change task or reset by reopening the screen.</Text>
      )}

      <View style={{ gap: 12 }}>
        <PrimaryButton label="View task timeline" href="/task-status" />
        <PrimaryButton label="Report an issue" href="/support" tone="secondary" />
      </View>
    </Screen>
  );
}
