import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { CaptionText, PrimaryButton } from "@/shared/components/ui";
import { colors, fonts, radius, spacing } from "@/theme/tokens";
import type { Task } from "@/types/domain";

/**
 * The Provider Responses List's empty state — shown when `jobResponses` is
 * empty, not a separate route (same pattern ProviderHomeScreen uses for its
 * own empty state). Still previews the current active job, since a
 * Provider with no responses yet may already have an open job waiting on
 * one — see the "Provider Responses — Empty State" Stitch design.
 */
export function ResponsesEmptyState({ activeJob }: { activeJob: Task | null }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.iconCircle}>
        <MaterialIcons name="inbox" size={26} color={colors.primary} />
      </View>
      <Text style={styles.title}>No responses yet</Text>
      <CaptionText style={styles.body}>
        Responses to your job posts will appear here. When Job Seekers respond, you&apos;ll be able
        to review their profiles and choose someone to help.
      </CaptionText>

      {activeJob ? (
        <View style={styles.activeJobCard}>
          <View style={styles.activePill}>
            <View style={styles.activeDot} />
            <Text style={styles.activePillText}>Active</Text>
          </View>
          <Text style={styles.activeJobTitle}>{activeJob.title}</Text>
          <CaptionText>{activeJob.area}</CaptionText>
          <View style={styles.activeJobMetricsRow}>
            <Text style={styles.activeJobBudget}>{activeJob.budget}</Text>
            {activeJob.postedAgo ? <CaptionText>Posted {activeJob.postedAgo}</CaptionText> : null}
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        <PrimaryButton label="View My Jobs" href="/(poster)/tasks" />
        <PrimaryButton label="Post Another Job" href="/(poster)/post-task" tone="secondary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    gap: spacing.xs,
  },
  iconCircle: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 56,
    justifyContent: "center",
    marginBottom: spacing.xs,
    width: 56,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 16,
  },
  body: {
    textAlign: "center",
  },
  activeJobCard: {
    alignSelf: "stretch",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xxs,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  activePill: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  activeDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 6,
    width: 6,
  },
  activePillText: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  activeJobTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 16,
    marginTop: spacing.xxs,
  },
  activeJobMetricsRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xxs,
  },
  activeJobBudget: {
    color: colors.primary,
    fontFamily: fonts.extraBold,
    fontSize: 18,
  },
  actions: {
    alignSelf: "stretch",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
