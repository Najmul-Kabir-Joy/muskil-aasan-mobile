import { StyleSheet, Text, View } from "react-native";
import { ResponsePreviewCard } from "@/features/marketplace/responses/ResponsePreviewCard";
import { Badge, CaptionText } from "@/shared/components/ui";
import { colors, fonts, radius, spacing } from "@/theme/tokens";
import type { JobWithResponses } from "@/types/domain";

/**
 * One Provider job and every response it has received, grouped together —
 * the Responses List's "JOB → Job Seekers who responded" hierarchy. The
 * job summary card never exposes responder identities itself; those live
 * only in the `ResponsePreviewCard`s beneath it.
 */
export function JobResponsesSection({ task, responses }: JobWithResponses) {
  return (
    <View style={styles.section}>
      <View style={styles.jobCard}>
        <Text style={styles.jobTitle}>{task.title}</Text>
        <CaptionText>{task.area}</CaptionText>
        <View style={styles.jobMetricsRow}>
          <Text style={styles.jobBudget}>{task.budget}</Text>
          <Badge
            label={`${responses.length} ${responses.length === 1 ? "response" : "responses"}`}
          />
        </View>
      </View>

      <View style={styles.responseList}>
        {responses.map((response) => (
          <ResponsePreviewCard key={response.id} response={response} category={task.category} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  jobCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.xxs,
    padding: spacing.md,
  },
  jobTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 16,
  },
  jobMetricsRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xxs,
  },
  jobBudget: {
    color: colors.primary,
    fontFamily: fonts.extraBold,
    fontSize: 18,
  },
  responseList: {
    gap: spacing.md,
  },
});
