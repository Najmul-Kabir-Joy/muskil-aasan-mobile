import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Edges } from "react-native-safe-area-context";
import {
  ActionButton,
  AppHeader,
  AppText,
  PrimaryButton,
  ScrollScreen,
  SectionHeader,
  SelectableChip,
} from "@/shared/components/ui";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

const reasons = [
  "No show",
  "Unsafe behavior",
  "Payment issue",
  "Poor work quality",
  "Fake profile",
  "Spam/scam",
  "Other",
];

/**
 * Shared "report an issue" screen — reused as-is by the standalone
 * `/support` route and by the Provider bottom-navigation flow
 * (`app/(poster)/support.tsx`), so there is one implementation instead of
 * two. `edges` lets a caller inside a persistent shell opt out of
 * re-applying the safe area it already owns — see `ScrollScreen`. `basePath`
 * prefixes the "Back to task status" link so navigating from inside the
 * Provider shell stays inside it instead of dropping back to the
 * standalone route.
 */
export function SupportScreen({ edges, basePath = "" }: { edges?: Edges; basePath?: string }) {
  const [selectedReason, setSelectedReason] = useState("Payment issue");
  const [submitted, setSubmitted] = useState(false);

  return (
    <ScrollScreen edges={edges}>
      <AppHeader
        title="Report issue"
        subtitle="Safety entry points should be visible from profile, job detail, task status, job seeker profile, and offer cards."
      />

      <SectionHeader title="Reason" />
      <View style={styles.reasons}>
        {reasons.map((reason) => (
          <SelectableChip
            key={reason}
            label={reason}
            selected={selectedReason === reason}
            onPress={() => setSelectedReason(reason)}
          />
        ))}
      </View>

      <View style={styles.confirmation}>
        <Text style={styles.title}>
          {submitted ? "Support has received your report." : "Ready to submit report"}
        </Text>
        <AppText style={styles.body}>
          {submitted
            ? `Reason: ${selectedReason}. We may contact you by phone or WhatsApp during the pilot.`
            : `Selected reason: ${selectedReason}. Admin notes and resolution status will be part of the operations queue.`}
        </AppText>
      </View>

      <ActionButton
        label={submitted ? "Report submitted" : "Submit mock report"}
        onPress={() => setSubmitted(true)}
        disabled={submitted}
      />
      <PrimaryButton label="Back to task status" href={`${basePath}/task-status`} />
    </ScrollScreen>
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
    fontFamily: fonts.extraBold,
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
});
