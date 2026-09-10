import { useMemo, useState } from "react";
import { View } from "react-native";
import type { Edges } from "react-native-safe-area-context";
import {
  ActionButton,
  AppHeader,
  EmptyState,
  PrimaryButton,
  ScrollScreen,
  Timeline,
} from "@/shared/components/ui";
import { taskTimeline } from "@/data/mock";

/**
 * Shared "after hiring" timeline screen — reused as-is by the standalone
 * `/task-status` route and by the Provider bottom-navigation flow
 * (`app/(poster)/task-status.tsx`), so there is one implementation instead
 * of two. `edges` lets a caller inside a persistent shell opt out of
 * re-applying the safe area it already owns — see `ScrollScreen`. `basePath`
 * prefixes the "Go to profile"/"Report issue" links so navigating from
 * inside the Provider shell stays inside it instead of dropping back to the
 * standalone routes.
 */
export function TaskStatusScreen({ edges, basePath = "" }: { edges?: Edges; basePath?: string }) {
  const [completionConfirmed, setCompletionConfirmed] = useState(false);
  const [paymentTracked, setPaymentTracked] = useState(false);
  const timeline = useMemo(
    () =>
      taskTimeline.map((event) => {
        if (event.label === "Completion requested")
          return { ...event, completed: completionConfirmed };
        if (event.label === "Payment tracked") return { ...event, completed: paymentTracked };
        if (event.label === "Reviewed")
          return { ...event, completed: completionConfirmed && paymentTracked };
        return event;
      }),
    [completionConfirmed, paymentTracked],
  );

  return (
    <ScrollScreen edges={edges}>
      <AppHeader
        title="One shared source of truth."
        subtitle="After hiring, both sides need the same timeline, next action, payment status, and report entry point."
      />

      <Timeline events={timeline} />

      <EmptyState
        title="Payment block"
        body={`Status: ${paymentTracked ? "paid outside app" : "pending"} · Method: bKash/manual · Reference: ${paymentTracked ? "BK-1294" : "not added"} · No automated escrow claim.`}
      />

      <View style={{ gap: 12 }}>
        <ActionButton
          label={completionConfirmed ? "Completion confirmed" : "Confirm completion"}
          onPress={() => setCompletionConfirmed(true)}
          disabled={completionConfirmed}
        />
        <ActionButton
          label={paymentTracked ? "Payment tracked" : "Mark payment tracked"}
          onPress={() => setPaymentTracked(true)}
          tone="secondary"
          disabled={paymentTracked}
        />
        <PrimaryButton label="Go to profile" href={`${basePath}/profile`} tone="secondary" />
        <PrimaryButton label="Report issue" href={`${basePath}/support`} tone="secondary" />
      </View>
    </ScrollScreen>
  );
}
