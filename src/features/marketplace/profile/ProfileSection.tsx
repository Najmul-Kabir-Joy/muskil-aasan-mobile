import { MaterialIcons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { HiddenNote } from "@/features/marketplace/profile/VisibilityControls";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

/**
 * A titled profile section — icon, title, optional count/badge, and an
 * optional trailing action (a visibility pill, "Manage >", "+ Add Skill").
 * `hiddenFromPublic` marks an owner-visible section that other people can't
 * see.
 */
export function ProfileSection({
  icon,
  title,
  titleSuffix,
  badge,
  action,
  hiddenFromPublic = false,
  children,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  titleSuffix?: string;
  badge?: string;
  action?: ReactNode;
  hiddenFromPublic?: boolean;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <MaterialIcons name={icon} size={20} color={colors.primary} />
          {/* The suffix is inline text inside the heading, so a long title
              wraps as one sentence instead of pushing the icon onto its own
              line. */}
          <Text accessibilityRole="header" style={styles.title}>
            {title}
            {titleSuffix ? <Text style={styles.titleSuffix}> {titleSuffix}</Text> : null}
          </Text>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        {action}
      </View>
      {hiddenFromPublic ? (
        <HiddenNote>Hidden from public view. Only you can see this section.</HiddenNote>
      ) : null}
      {children}
    </View>
  );
}

/** Neutral placeholder card for a section with nothing to show. */
export function SectionEmptyCard({ message }: { message: string }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  titleGroup: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs + spacing.xxs,
  },
  title: {
    color: colors.text,
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  titleSuffix: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  badgeText: {
    color: colors.primaryDark,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "dashed",
    borderWidth: 1,
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
});
