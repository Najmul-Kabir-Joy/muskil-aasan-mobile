import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { ResponsePreviewCard } from "@/features/marketplace/responses/ResponsePreviewCard";
import { CaptionText } from "@/shared/components/ui";
import { colors, fonts, radius, spacing } from "@/theme/tokens";
import type { JobWithResponses } from "@/types/domain";

/**
 * One Provider job and every response it has received, grouped together —
 * the Responses List's "JOB → Job Seekers who responded" hierarchy. The
 * job summary card never exposes responder identities itself; those live
 * only in the `ResponsePreviewCard`s beneath it.
 *
 * The timing chip is amber with a clock for an urgent job and teal with a
 * calendar otherwise, matching the "Provider Responses — List View" Stitch
 * design; the timing text itself always says which it is, so colour isn't
 * the only signal.
 */
export function JobResponsesSection({ task, responses }: JobWithResponses) {
  const responseCountLabel = `${responses.length} ${responses.length === 1 ? "response" : "responses"}`;
  const timingTone = task.urgent ? styles.timingUrgent : styles.timingScheduled;
  const timingTextTone = task.urgent ? styles.timingTextUrgent : styles.timingTextScheduled;
  const timingIconColor = task.urgent ? colors.secondaryDark : colors.tertiaryDark;

  return (
    <View style={styles.section}>
      <View style={styles.jobCard}>
        <View style={styles.jobTopRow}>
          <View style={[styles.timingChip, timingTone]}>
            <MaterialIcons
              name={task.urgent ? "schedule" : "calendar-today"}
              size={13}
              color={timingIconColor}
            />
            <Text numberOfLines={1} style={[styles.timingText, timingTextTone]}>
              {task.timing}
            </Text>
          </View>
          <View style={styles.countPill}>
            <MaterialIcons name="forum" size={13} color={colors.primaryDark} />
            <Text style={styles.countText}>{responseCountLabel}</Text>
          </View>
        </View>

        <Text style={styles.jobTitle}>{task.title}</Text>

        <View style={styles.jobMetaRow}>
          <View style={styles.areaRow}>
            <MaterialIcons name="location-on" size={15} color={colors.primary} />
            <CaptionText numberOfLines={1} style={styles.area}>
              {task.area}
            </CaptionText>
          </View>
          <Text style={styles.budgetRow}>
            <Text style={styles.budget}>{task.budget}</Text>
            <Text style={styles.budgetLabel}> Budget</Text>
          </Text>
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
    gap: spacing.md,
  },
  jobCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  jobTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  timingChip: {
    alignItems: "center",
    borderRadius: radius.pill,
    flexDirection: "row",
    flexShrink: 1,
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  timingUrgent: {
    backgroundColor: colors.secondarySoft,
  },
  timingScheduled: {
    backgroundColor: colors.tertiarySoft,
  },
  timingText: {
    flexShrink: 1,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  timingTextUrgent: {
    color: colors.secondaryDark,
  },
  timingTextScheduled: {
    color: colors.tertiaryDark,
  },
  countPill: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    flexDirection: "row",
    flexShrink: 0,
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  countText: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  jobTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 18,
    lineHeight: 24,
  },
  jobMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  areaRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
  },
  area: {
    flexShrink: 1,
  },
  budgetRow: {
    flexShrink: 0,
  },
  budget: {
    color: colors.secondaryDark,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  budgetLabel: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  responseList: {
    gap: spacing.md,
  },
});
