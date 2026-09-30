import { MaterialIcons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CaptionText } from "@/shared/components/ui";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

type IconName = keyof typeof MaterialIcons.glyphMap;

// A Seeker tab's page title — icon, title, an optional count pill and one
// line of context — matching the Provider's My Jobs header.
export function SeekerPageHeader({
  icon,
  title,
  count,
  caption,
}: {
  icon: IconName;
  title: string;
  count?: string;
  caption: string;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.titleGroup}>
          <View style={styles.titleIcon}>
            <MaterialIcons name={icon} size={18} color={colors.primary} />
          </View>
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
        </View>
        {count ? (
          <View style={styles.countPill}>
            <Text numberOfLines={1} style={styles.countText}>
              {count}
            </Text>
          </View>
        ) : null}
      </View>
      <CaptionText>{caption}</CaptionText>
    </View>
  );
}

// The dashed empty-state card of the Seeker screens, as on the Provider's My Jobs.
export function SeekerEmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: IconName;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <MaterialIcons name={icon} size={26} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <CaptionText style={styles.emptyBody}>{body}</CaptionText>
      {action ? <View style={styles.emptyAction}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  titleGroup: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    gap: spacing.sm,
  },
  titleIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 20,
  },
  countPill: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexShrink: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  countText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "dashed",
    borderWidth: 1,
    padding: spacing.xl,
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 17,
    marginTop: spacing.md,
    textAlign: "center",
  },
  emptyBody: {
    marginTop: spacing.xs,
    textAlign: "center",
  },
  emptyAction: {
    alignSelf: "stretch",
    marginTop: spacing.lg,
  },
});
