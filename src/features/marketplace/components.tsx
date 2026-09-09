import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { statusTone, verificationLabel } from "@/features/marketplace/status";
import { ActionButton, Badge, CaptionText, PrimaryButton } from "@/shared/components/ui";
import { colors, fonts, radius, shadows, spacing } from "@/theme/tokens";
import type { Category, Offer, Task } from "@/types/domain";

// Prototype/mock marketplace UI — tied to src/types/domain.ts's prototype
// shapes, not approved product requirements. See
// docs/engineering/domain-and-terminology.md.

/**
 * Top-level poster/job-seeker mode switch. Uses `router.replace` (not
 * `push`) so repeatedly switching modes doesn't stack an unbounded back
 * history — see docs/engineering/git-workflow.md history for context.
 */
export function RoleSwitch({ active }: { active: "poster" | "jobSeeker" }) {
  const router = useRouter();
  return (
    <View style={styles.roleSwitch}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: active === "poster" }}
        onPress={() => router.replace("/(poster)")}
        style={[styles.rolePill, active === "poster" && styles.rolePillActive]}
      >
        <Text style={[styles.roleText, active === "poster" && styles.roleTextActive]}>
          Poster mode
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: active === "jobSeeker" }}
        onPress={() => router.replace("/(worker)/jobs")}
        style={[styles.rolePill, active === "jobSeeker" && styles.rolePillActive]}
      >
        <Text style={[styles.roleText, active === "jobSeeker" && styles.roleTextActive]}>
          Job seeker
        </Text>
      </Pressable>
    </View>
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

/**
 * Renders its footer CTA via `href` (navigation, handled by `PrimaryButton`)
 * or `onPress` (a caller-owned local action, handled by `ActionButton`) —
 * never both, and never a default. TaskCard is used by both poster and job
 * seeker screens, so it must not decide a top-level route on its callers'
 * behalf; see docs/engineering/domain-and-terminology.md — job details is
 * not a defined flow yet, so a caller with no real destination should pass
 * neither prop rather than be given an invented one.
 */
export function TaskCard({
  task,
  cta = "View task",
  href,
  onPress,
}: {
  task: Task;
  cta?: string;
  href?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <Badge label={task.category} />
        <Badge label={task.status} tone={statusTone(task.status)} />
      </View>
      <Text style={styles.cardTitle}>{task.title}</Text>
      <CaptionText>{task.description}</CaptionText>
      <View style={styles.signalRow}>
        <Text style={styles.price}>{task.budget}</Text>
        <Text style={styles.signal}>{task.area}</Text>
        <Text style={styles.signal}>{task.timing}</Text>
        {task.urgent ? <Badge label="Urgent" tone="danger" /> : null}
      </View>
      <View style={styles.cardFooter}>
        <CaptionText>{task.offerCount} offers</CaptionText>
        {href ? (
          <PrimaryButton label={cta} href={href} tone="secondary" />
        ) : onPress ? (
          <ActionButton label={cta} onPress={onPress} tone="secondary" />
        ) : null}
      </View>
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
 * identity, like/save) rather than TaskCard's compact list-item layout.
 * `task.postedBy` must be set; this is not meant for the current user's own
 * tasks. Like/save are local-only UI state (no backend, nothing persisted —
 * see docs/engineering/domain-and-terminology.md).
 */
export function CommunityPostCard({ task }: { task: Task }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
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
        <MaterialIcons name="more-horiz" size={20} color={colors.muted} />
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
            accessibilityLabel={liked ? "Unlike" : "Like"}
            accessibilityState={{ selected: liked }}
            onPress={() => setLiked((current) => !current)}
            style={styles.communityFooterButton}
          >
            <MaterialIcons
              name={liked ? "thumb-up" : "thumb-up-off-alt"}
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
          accessibilityLabel={saved ? "Saved" : "Save"}
          accessibilityState={{ selected: saved }}
          onPress={() => setSaved((current) => !current)}
          style={styles.communityFooterButton}
        >
          <MaterialIcons
            name={saved ? "bookmark" : "bookmark-border"}
            size={18}
            color={saved ? colors.primary : colors.muted}
          />
          <Text style={[styles.communityFooterText, saved && styles.communityFooterTextActive]}>
            {saved ? "Saved" : "Save"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export function OfferCard({ offer }: { offer: Offer }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <View>
          <Text style={styles.cardTitle}>{offer.worker.name}</Text>
          <CaptionText>
            {offer.worker.rating} rating · {offer.worker.completedJobs} jobs · {offer.worker.area}
          </CaptionText>
        </View>
        <Badge
          label={verificationLabel(offer.worker.verification)}
          tone={offer.worker.verification === "verified" ? "success" : "warning"}
        />
      </View>
      <Text style={styles.offerMessage}>{offer.message}</Text>
      <View style={styles.signalRow}>
        <Text style={styles.price}>{offer.amount}</Text>
        <Text style={styles.signal}>{offer.estimatedTime}</Text>
        <Badge label={offer.status} tone={offer.status === "accepted" ? "success" : "neutral"} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  roleSwitch: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: "row",
    flexShrink: 1,
    padding: spacing.xs,
  },
  rolePill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rolePillActive: {
    backgroundColor: colors.primary,
  },
  roleText: {
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  roleTextActive: {
    color: colors.card,
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
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 17,
    lineHeight: 23,
  },
  signalRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  price: {
    color: colors.primary,
    fontFamily: fonts.extraBold,
    fontSize: 20,
  },
  signal: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  cardFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  offerMessage: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 21,
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
