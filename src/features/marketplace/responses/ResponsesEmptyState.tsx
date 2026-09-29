import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ActionButton, CaptionText } from "@/shared/components/ui";
import { colors, fonts, radius, spacing } from "@/theme/tokens";
import type { Task } from "@/types/domain";

/**
 * The Provider Responses List's empty state — shown when there are no
 * responses, not a separate route (same pattern ProviderHomeScreen uses for
 * its own empty state). Still previews the current active job, since a
 * Provider with no responses yet may already have an open job waiting on
 * one — see the "Provider Responses — Empty State" Stitch design. Makes no
 * promise about when responses will arrive or who will respond.
 */
export function ResponsesEmptyState({ activeJob }: { activeJob: Task | null }) {
  const router = useRouter();
  const activeJobMeta = activeJob
    ? [
        activeJob.area,
        activeJob.budget,
        activeJob.postedAgo ? `Posted ${activeJob.postedAgo}` : null,
      ]
        .filter(Boolean)
        .join(" • ")
    : "";

  return (
    <View style={styles.card}>
      <View style={styles.halo}>
        <View style={styles.haloRing} />
        <View style={styles.iconCircle}>
          <MaterialIcons name="mark-email-unread" size={32} color={colors.primary} />
        </View>
      </View>
      <Text accessibilityRole="header" style={styles.title}>
        No responses yet
      </Text>
      <CaptionText style={styles.body}>
        Responses to your job posts will appear here. When Job Seekers respond, you&apos;ll be able
        to review their profiles and choose someone to help.
      </CaptionText>

      {activeJob ? (
        <View style={styles.activeJob}>
          <View style={styles.activeJobTopRow}>
            <Text style={styles.activeJobKicker}>You have 1 active job post</Text>
            <View style={styles.budgetPill}>
              <Text style={styles.budgetPillText}>Budget: {activeJob.budget}</Text>
            </View>
          </View>
          <Text numberOfLines={2} style={styles.activeJobTitle}>
            {activeJob.title}
          </Text>
          <CaptionText>{activeJobMeta}</CaptionText>
        </View>
      ) : null}

      <View style={styles.actions}>
        <ActionButton
          label="View My Jobs"
          onPress={() => router.push("/(poster)/tasks")}
          icon={<MaterialIcons name="assignment" size={18} color={colors.card} />}
        />
        <ActionButton
          label="Post Another Job"
          tone="secondary"
          onPress={() => router.push("/(poster)/post-task")}
          icon={<MaterialIcons name="add-circle-outline" size={18} color={colors.text} />}
        />
      </View>
    </View>
  );
}

const HALO_SIZE = 96;

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
  },
  halo: {
    alignItems: "center",
    height: HALO_SIZE,
    justifyContent: "center",
    width: HALO_SIZE,
  },
  haloRing: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: HALO_SIZE,
    opacity: 0.5,
    position: "absolute",
    width: HALO_SIZE,
  },
  iconCircle: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 18,
    marginTop: spacing.sm,
  },
  body: {
    marginTop: spacing.xs,
    maxWidth: 300,
    textAlign: "center",
  },
  activeJob: {
    alignSelf: "stretch",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    gap: spacing.xs,
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  activeJobTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  activeJobKicker: {
    color: colors.muted,
    flexShrink: 1,
    fontFamily: fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  budgetPill: {
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.pill,
    flexShrink: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
  },
  budgetPillText: {
    color: colors.secondaryDark,
    fontFamily: fonts.extraBold,
    fontSize: 12,
  },
  activeJobTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  actions: {
    alignSelf: "stretch",
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
});
