import { useMemo, useState } from "react";
import { View } from "react-native";
import {
  ActionButton,
  AppHeader,
  EmptyState,
  PrimaryButton,
  Screen,
  Timeline,
} from "@/shared/components/ui";
import { taskTimeline } from "@/data/mock";

export default function TaskStatusScreen() {
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
    <Screen>
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
        <PrimaryButton label="Go to profile" href="/profile" tone="secondary" />
        <PrimaryButton label="Report issue" href="/support" tone="secondary" />
      </View>
    </Screen>
  );
}
