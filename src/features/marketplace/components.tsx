import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, CaptionText } from "@/shared/components/ui";
import { BRAND_NAME } from "@/shared/constants/brand";
import { colors, fonts, radius, shadows, spacing } from "@/theme/tokens";
import type { Category, Task } from "@/types/domain";

// Prototype/mock marketplace UI — tied to src/types/domain.ts's prototype
// shapes, not approved product requirements. See
// docs/engineering/domain-and-terminology.md.

/**
 * The shared app-shell top bar — brand, dummy location display, a
 * notification icon, and a navigation-menu (hamburger) icon. Rendered once
 * by each mode's layout (`app/(poster)/_layout.tsx` for Job Provider,
 * `app/(worker)/_layout.tsx` for Job Seeker) as the persistent header for
 * every screen in that shell, not re-rendered per screen — see
 * `src/features/marketplace/app-shell/`. Location and notifications are
 * static prototype display only — see
 * docs/engineering/domain-and-terminology.md.
 *
 * Profile intentionally has no button here — it's a bottom-navigation
 * destination in both modes. The hamburger button opens the mode's drawer
 * (`AppDrawer`) — its open/close state is owned by the layout, not this
 * component, so `onOpenMenu` is required to actually do anything; without
 * it the button is inert.
 *
 * Owns its own top safe-area inset, since it sits directly under the
 * status bar as the layout's header rather than inside each screen's own
 * safe-area-padded content.
 */
export function AppShellHeader({ onOpenMenu }: { onOpenMenu?: () => void }) {
  return (
    <SafeAreaView edges={["top"]} style={styles.shellTopBarSafeArea}>
      <View style={styles.shellTopBar}>
        <View style={styles.shellBrandColumn}>
          <Text style={styles.shellBrandName}>{BRAND_NAME}</Text>
          <View style={styles.shellLocationRow}>
            <MaterialIcons name="location-on" size={14} color={colors.primary} />
            <Text style={styles.shellLocationText}>Mirpur, Dhaka</Text>
            <MaterialIcons name="expand-more" size={14} color={colors.muted} />
          </View>
        </View>
        <View style={styles.shellTopBarActions}>
          <View style={styles.shellNotificationButton}>
            <MaterialIcons
              accessibilityLabel="Notifications"
              name="notifications"
              size={22}
              color={colors.muted}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open navigation menu"
            onPress={onOpenMenu}
            style={styles.shellMenuButton}
          >
            <MaterialIcons name="menu" size={24} color={colors.text} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

export function CategoryTile({ category }: { category: Category }) {
  return (
    <View style={styles.categoryTile}>
      <Text style={styles.categoryIcon}>{category.icon}</Text>
      <Text style={styles.cardTitle}>{category.label}</Text>
      <CaptionText>{category.example}</CaptionText>
    </View>
  );
}

const AVATAR_TONES = [
  { background: colors.primarySoft, text: colors.primaryDark },
  { background: colors.secondarySoft, text: colors.secondaryDark },
  { background: colors.tertiarySoft, text: colors.tertiaryDark },
];

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/**
 * A task posted by someone other than the current viewer, shown in the
 * Provider Home "Community Jobs" feed — a social-feed layout (poster
 * identity, like/refer) rather than TaskCard's compact list-item layout.
 * `task.postedBy` must be set; this is not meant for the current user's own
 * tasks. Like is local-only UI state (no backend, nothing persisted — see
 * docs/engineering/domain-and-terminology.md).
 *
 * The bottom action row is Like + Responses (both informational/toggleable)
 * plus a Refer action. Refer has no public count — it's an action, not a
 * metric — and there is deliberately only one "more options" affordance
 * (the top-right `onOverflow` button); do not add a second one here.
 * `onRefer`/`onOverflow` are optional so the card still renders standalone
 * (e.g. in isolation tests) without requiring a sheet to exist.
 */
export function CommunityPostCard({
  task,
  onRefer,
  onOverflow,
}: {
  task: Task;
  onRefer?: (task: Task) => void;
  onOverflow?: (task: Task) => void;
}) {
  const [liked, setLiked] = useState(false);
  const baseLikes = task.likes ?? 0;

  if (!task.postedBy) return null;
  const tone = AVATAR_TONES[task.postedBy.name.length % AVATAR_TONES.length];
  const isRoute = task.area.includes("→");
  const areaIcon: "near-me" | "language" | "pin-drop" = isRoute
    ? "near-me"
    : task.remote
      ? "language"
      : "pin-drop";
  const timingIcon: "alarm" | "schedule" = task.urgent ? "alarm" : "schedule";

  return (
    <View style={styles.communityCard}>
      <View style={styles.communityHeaderRow}>
        <View style={styles.communityPosterRow}>
          <View style={[styles.communityAvatar, { backgroundColor: tone.background }]}>
            <Text style={[styles.communityAvatarText, { color: tone.text }]}>
              {initialsFor(task.postedBy.name)}
            </Text>
          </View>
          <View>
            <Text style={styles.communityName}>{task.postedBy.name}</Text>
            <CaptionText style={styles.communityMeta}>
              {task.postedBy.area} · {task.postedAgo}
            </CaptionText>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="More job options"
          onPress={() => onOverflow?.(task)}
          style={styles.communityOverflowButton}
          hitSlop={6}
        >
          <MaterialIcons name="more-horiz" size={20} color={colors.muted} />
        </Pressable>
      </View>

      <View style={styles.communityBadgeRow}>
        <Badge label={task.category} />
        {task.remote ? <Badge label="Remote" tone="info" /> : null}
      </View>

      <Text style={styles.cardTitle}>{task.title}</Text>
      <CaptionText numberOfLines={2}>{task.description}</CaptionText>

      {task.photoNote ? (
        <View style={styles.communityPhotoNote}>
          <MaterialIcons name="inventory-2" size={22} color={colors.primary} />
          <Text style={styles.communityPhotoNoteText}>{task.photoNote}</Text>
        </View>
      ) : null}

      <View style={styles.communityMetaStrip}>
        <Text style={styles.communityMetaPrice}>
          <MaterialIcons name="payments" size={14} color={colors.primary} /> {task.budget}
        </Text>
        <Text style={styles.communityMetaDot}>•</Text>
        <View style={styles.communityMetaItem}>
          <MaterialIcons name={areaIcon} size={14} color={colors.muted} />
          <Text style={styles.communityMetaText}>{task.area}</Text>
        </View>
        <Text style={styles.communityMetaDot}>•</Text>
        <View style={styles.communityMetaItem}>
          <MaterialIcons
            name={timingIcon}
            size={14}
            color={task.urgent ? colors.danger : colors.muted}
          />
          <Text style={styles.communityMetaText}>{task.timing}</Text>
        </View>
      </View>

      <View style={styles.communityFooter}>
        <View style={styles.communityFooterActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={liked ? "Unlike job" : "Like job"}
            accessibilityState={{ selected: liked }}
            onPress={() => setLiked((current) => !current)}
            style={styles.communityFooterButton}
            hitSlop={12}
          >
            <MaterialIcons
              name={liked ? "favorite" : "favorite-border"}
              size={18}
              color={liked ? colors.primary : colors.muted}
            />
            <Text style={[styles.communityFooterText, liked && styles.communityFooterTextActive]}>
              {baseLikes + (liked ? 1 : 0)}
            </Text>
          </Pressable>
          <View style={styles.communityFooterButton}>
            <MaterialIcons name="chat-bubble-outline" size={18} color={colors.muted} />
            <Text style={styles.communityFooterText}>{task.responseCount ?? 0} responses</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Refer someone"
          onPress={() => onRefer?.(task)}
          style={styles.communityFooterButton}
          hitSlop={12}
        >
          <MaterialIcons name="person-add" size={18} color={colors.muted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shellTopBarSafeArea: {
    backgroundColor: colors.card,
  },
  shellTopBar: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: spacing.md,
  },
  shellBrandColumn: {
    gap: spacing.xxs,
  },
  shellBrandName: {
    color: colors.primary,
    fontFamily: fonts.extraBold,
    fontSize: 20,
    letterSpacing: -0.3,
  },
  shellLocationRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
  },
  shellLocationText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  shellTopBarActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  shellNotificationButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  shellMenuButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  categoryTile: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    gap: spacing.sm,
    minWidth: "30%",
    padding: spacing.md,
    ...shadows.card,
  },
  categoryIcon: {
    color: colors.primary,
    fontFamily: fonts.extraBold,
    fontSize: 16,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 17,
    lineHeight: 23,
  },
  communityCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
    ...shadows.card,
  },
  communityHeaderRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  communityOverflowButton: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    marginTop: -spacing.xs,
    width: 32,
  },
  communityPosterRow: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: spacing.sm,
  },
  communityAvatar: {
    alignItems: "center",
    borderRadius: radius.pill,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  communityAvatarText: {
    fontFamily: fonts.extraBold,
    fontSize: 14,
  },
  communityName: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  communityMeta: {
    marginTop: 0,
  },
  communityBadgeRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  communityPhotoNote: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    height: 64,
    justifyContent: "center",
  },
  communityPhotoNoteText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  communityMetaStrip: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    padding: spacing.sm,
  },
  communityMetaPrice: {
    color: colors.primary,
    fontFamily: fonts.extraBold,
    fontSize: 14,
  },
  communityMetaDot: {
    color: colors.muted,
  },
  communityMetaItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
  },
  communityMetaText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  communityFooter: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
  },
  communityFooterActions: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  communityFooterButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
  },
  communityFooterText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  communityFooterTextActive: {
    color: colors.primary,
  },
});
