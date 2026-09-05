import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActionButton, AppHeader, PrimaryButton, Screen, SectionHeader, SelectableChip } from "@/components/ui";
import { colors, radius, spacing } from "@/theme/tokens";

const reasons = ["No show", "Unsafe behavior", "Payment issue", "Poor work quality", "Fake profile", "Spam/scam", "Other"];

export default function SupportScreen() {
  const [selectedReason, setSelectedReason] = useState("Payment issue");
  const [submitted, setSubmitted] = useState(false);

  return (
    <Screen>
      <AppHeader title="Report issue" subtitle="Safety entry points should be visible from profile, job detail, task status, job seeker profile, and offer cards." />

      <SectionHeader title="Reason" />
      <View style={styles.reasons}>
        {reasons.map((reason) => (
          <SelectableChip key={reason} label={reason} selected={selectedReason === reason} onPress={() => setSelectedReason(reason)} />
        ))}
      </View>

      <View style={styles.confirmation}>
        <Text style={styles.title}>{submitted ? "Support has received your report." : "Ready to submit report"}</Text>
        <Text style={styles.body}>
          {submitted
            ? `Reason: ${selectedReason}. We may contact you by phone or WhatsApp during the pilot.`
            : `Selected reason: ${selectedReason}. Admin notes and resolution status will be part of the operations queue.`}
        </Text>
      </View>

      <ActionButton label={submitted ? "Report submitted" : "Submit mock report"} onPress={() => setSubmitted(true)} disabled={submitted} />
      <PrimaryButton label="Back to task status" href="/task-status" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  reasons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  confirmation: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
});
