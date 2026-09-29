import { MaterialIcons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius, spacing } from "@/theme/tokens";
import type { ProfileVisibility } from "@/types/domain";

const HIT_SLOP = { top: 10, bottom: 10, left: 6, right: 6 };

/**
 * Owner-only "Public ▾" / "Hidden ▾" control on a profile section header.
 * Opens the visibility sheet; the visible word alone is ambiguous, so the
 * accessibility label names the section too.
 */
export function SectionVisibilityPill({
  sectionTitle,
  visibility,
  onPress,
}: {
  sectionTitle: string;
  visibility: ProfileVisibility;
  onPress: () => void;
}) {
  const hidden = visibility === "hidden";
  const label = hidden ? "Hidden" : "Public";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${sectionTitle} visibility: ${label}`}
      hitSlop={HIT_SLOP}
      onPress={onPress}
      style={[styles.pill, hidden && styles.pillHidden]}
    >
      <MaterialIcons
        name={hidden ? "visibility-off" : "visibility"}
        size={14}
        color={hidden ? colors.secondaryDark : colors.primary}
      />
      <Text style={[styles.pillText, hidden && styles.hiddenText]}>{label}</Text>
      <MaterialIcons name="expand-more" size={14} color={colors.muted} />
    </Pressable>
  );
}

/**
 * Owner-only state + action for one job on the profile: a "Public" badge
 * with "Manage Visibility", or a "Hidden from public" badge with a direct
 * "Make Public".
 */
export function ItemVisibilityControls({
  itemTitle,
  visibility,
  onManage,
  onMakePublic,
}: {
  itemTitle: string;
  visibility: ProfileVisibility;
  onManage: () => void;
  onMakePublic: () => void;
}) {
  const hidden = visibility === "hidden";

  return (
    <View style={styles.itemControls}>
      {hidden ? (
        <View style={[styles.badge, styles.badgeHidden]}>
          <MaterialIcons name="visibility-off" size={13} color={colors.secondaryDark} />
          <Text style={[styles.badgeText, styles.hiddenText]}>Hidden from public</Text>
        </View>
      ) : (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Public</Text>
        </View>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          hidden ? `Make ${itemTitle} public` : `Manage visibility of ${itemTitle}`
        }
        hitSlop={HIT_SLOP}
        onPress={hidden ? onMakePublic : onManage}
      >
        <Text style={styles.linkText}>{hidden ? "Make Public" : "Manage Visibility"}</Text>
      </Pressable>
    </View>
  );
}

/** Small info panel explaining what "hidden" means where it applies. */
export function HiddenNote({ children }: { children: ReactNode }) {
  return (
    <View style={styles.note}>
      <MaterialIcons name="info-outline" size={15} color={colors.secondaryDark} />
      <Text style={styles.noteText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: "row",
    flexShrink: 0,
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + spacing.xxs,
    paddingVertical: spacing.xs,
  },
  pillHidden: {
    backgroundColor: colors.secondarySoft,
  },
  pillText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  hiddenText: {
    color: colors.secondaryDark,
  },
  itemControls: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "flex-end",
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.surfaceStrong,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  badgeHidden: {
    backgroundColor: colors.secondarySoft,
  },
  badgeText: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  linkText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  note: {
    alignItems: "flex-start",
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
  },
  noteText: {
    color: colors.muted,
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
});
