import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { formatRating } from "@/features/marketplace/profile/profileHelpers";
import { colors, fonts, radius, shadows, spacing } from "@/theme/tokens";

const MAX_STARS = 5;
// Share of the filled bar drawn in the lighter tail tone, per the finalized
// Profile designs' two-tone rating bar.
const BAR_TAIL_SHARE = 0.1;

/**
 * One side's reputation — the Provider Rating or the Seeker Rating, never a
 * mix of both. Shows only the stored average and its context; the bar is a
 * decorative picture of that same average, so it's hidden from screen
 * readers.
 */
export function ReputationCard({
  label,
  rating,
  ratingCount,
  countLabel,
  note,
  emptyTitle,
}: {
  label: string;
  rating: number;
  ratingCount: number;
  countLabel: string;
  note: string;
  emptyTitle: string;
}) {
  if (ratingCount === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.emptyRow}>
          <MaterialIcons name="star-border" size={24} color={colors.muted} />
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
        </View>
        <Text style={styles.emptyNote}>Ratings appear here after completed jobs.</Text>
      </View>
    );
  }

  const filled = Math.min(Math.max(rating / MAX_STARS, 0), 1) * 100;
  const tail = filled * BAR_TAIL_SHARE;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View
          accessible
          accessibilityLabel={`${label}: ${formatRating(rating)} out of ${MAX_STARS}`}
          style={styles.scoreGroup}
        >
          <MaterialIcons name="star" size={26} color={colors.secondary} />
          <Text style={styles.score}>{formatRating(rating)}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{countLabel}</Text>
        </View>
      </View>

      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.barTrack}
      >
        <View style={[styles.barFill, { width: `${filled - tail}%` }]} />
        <View style={[styles.barTail, { width: `${tail}%` }]} />
      </View>

      <View style={styles.noteRow}>
        <MaterialIcons name="info-outline" size={14} color={colors.primary} />
        <Text style={styles.noteText}>{note}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.subtle,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  scoreGroup: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: spacing.xs,
  },
  score: {
    color: colors.secondaryDark,
    fontFamily: fonts.extraBold,
    fontSize: 26,
    lineHeight: 32,
  },
  label: {
    color: colors.muted,
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    marginLeft: spacing.xs,
    marginTop: spacing.xs,
  },
  countPill: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + spacing.xxs,
    paddingVertical: spacing.xs,
  },
  countText: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  barTrack: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: "row",
    height: 8,
    overflow: "hidden",
  },
  barFill: {
    backgroundColor: colors.secondary,
  },
  barTail: {
    backgroundColor: colors.secondaryLight,
  },
  noteRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.xs,
  },
  noteText: {
    color: colors.muted,
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  emptyRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  emptyNote: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
});
