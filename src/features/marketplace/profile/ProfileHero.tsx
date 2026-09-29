import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import type { ProfileSide, ProfileViewer } from "@/features/marketplace/profile/profileHelpers";
import { SeekerAvatar } from "@/features/marketplace/responses/SeekerAvatar";
import { BRAND_NAME } from "@/shared/constants/brand";
import { colors, fonts, gradients, radius, shadows, spacing } from "@/theme/tokens";

const COVER_HEIGHT = 128;
const AVATAR_SIZE = 88;
const AVATAR_RING = 4;
const HIT_SLOP = { top: 6, bottom: 6, left: 6, right: 6 };

const SIDES: {
  side: ProfileSide;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  { side: "provider", label: "Provider Profile", icon: "storefront" },
  { side: "seeker", label: "Seeker Profile", icon: "handyman" },
];

/**
 * The profile's identity block from the finalized Profile Stitch designs:
 * decorative cover, overlapping avatar, owner actions (Edit Profile) or none
 * for the public, Share, name, area, the bio for the side being shown, and
 * the Provider Profile / Seeker Profile switch.
 *
 * The switch only chooses which side of this one account is shown — it is
 * NOT the app's Job Provider / Job Seeker mode switch (that lives in the
 * Provider drawer), so it never navigates.
 */
export function ProfileHero({
  name,
  area,
  bio,
  viewer,
  side,
  onChangeSide,
  onShare,
  onEditProfile,
  onBack,
}: {
  name: string;
  area: string;
  bio: string;
  viewer: ProfileViewer;
  side: ProfileSide;
  onChangeSide: (side: ProfileSide) => void;
  onShare: () => void;
  onEditProfile?: () => void;
  onBack?: () => void;
}) {
  const isOwner = viewer === "owner";

  return (
    <View style={styles.hero}>
      <LinearGradient
        colors={gradients.profileCover}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.cover}
      >
        <Svg
          style={StyleSheet.absoluteFill}
          width="100%"
          height="100%"
          viewBox="0 0 400 128"
          preserveAspectRatio="xMidYMid slice"
        >
          <Circle cx={24} cy={18} r={48} fill={colors.card} fillOpacity={0.15} />
          <Circle cx={340} cy={96} r={64} fill={colors.card} fillOpacity={0.15} />
          <Path d="M120 -10L180 80L80 120Z" fill={colors.card} fillOpacity={0.15} />
          <Path d="M260 12L310 70L220 90Z" fill={colors.card} fillOpacity={0.15} />
        </Svg>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={HIT_SLOP}
            onPress={onBack}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
        ) : null}
        {isOwner ? (
          <View style={styles.ownerPill}>
            <MaterialIcons name="admin-panel-settings" size={14} color={colors.primary} />
            <Text style={styles.ownerPillText}>Owner View</Text>
          </View>
        ) : null}
      </LinearGradient>

      <View style={styles.identity}>
        <View style={styles.avatarRow}>
          <View style={styles.avatarRing}>
            <SeekerAvatar name={name} size={AVATAR_SIZE} />
          </View>
          <View style={styles.actions}>
            {isOwner && onEditProfile ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit Profile"
                hitSlop={HIT_SLOP}
                onPress={onEditProfile}
                style={styles.editButton}
              >
                <MaterialIcons name="edit" size={16} color={colors.text} />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share profile"
              hitSlop={HIT_SLOP}
              onPress={onShare}
              style={styles.shareButton}
            >
              <MaterialIcons name="share" size={18} color={colors.text} />
            </Pressable>
          </View>
        </View>

        <Text accessibilityRole="header" style={styles.name}>
          {name}
        </Text>
        <View style={styles.areaRow}>
          <MaterialIcons name="location-on" size={16} color={colors.primary} />
          {/* Dhaka is the confirmed launch city; areas are neighborhoods. */}
          <Text style={styles.areaText}>{area}, Dhaka</Text>
        </View>
        {bio ? <Text style={styles.bio}>{bio}</Text> : null}

        <View style={styles.switchTrack}>
          {SIDES.map((option) => {
            const selected = option.side === side;
            return (
              <Pressable
                key={option.side}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityState={{ selected }}
                onPress={() => onChangeSide(option.side)}
                style={[styles.switchOption, selected && styles.switchOptionSelected]}
              >
                <MaterialIcons
                  name={option.icon}
                  size={16}
                  color={selected ? colors.primary : colors.muted}
                />
                <Text
                  numberOfLines={1}
                  style={[styles.switchText, selected && styles.switchTextSelected]}
                >
                  {option.label}
                </Text>
                {selected ? <View style={styles.switchDot} /> : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.captionRow}>
          <MaterialIcons name="visibility" size={14} color={colors.primary} />
          <ViewCaption viewer={viewer} side={side} firstName={name.split(" ")[0] ?? name} />
        </View>
      </View>
    </View>
  );
}

function ViewCaption({
  viewer,
  side,
  firstName,
}: {
  viewer: ProfileViewer;
  side: ProfileSide;
  firstName: string;
}) {
  if (viewer === "owner") {
    return (
      <Text style={styles.caption}>
        Showing your{" "}
        <Text style={styles.captionStrong}>
          {side === "provider" ? "Provider reputation & activity" : "Seeker reputation & work"}
        </Text>
        . Anyone on {BRAND_NAME} can see the parts marked Public.
      </Text>
    );
  }

  return side === "provider" ? (
    <Text style={styles.caption}>
      Viewing {firstName}&apos;s public{" "}
      <Text style={styles.captionStrong}>Provider activity and ratings</Text>.
    </Text>
  ) : (
    <Text style={styles.caption}>
      Viewing {firstName}&apos;s public <Text style={styles.captionStrong}>Seeker profile</Text>,
      completed work, and feedback.
    </Text>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.card,
    paddingBottom: spacing.lg + spacing.xs,
    ...shadows.subtle,
  },
  cover: {
    height: COVER_HEIGHT,
    overflow: "hidden",
  },
  backButton: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    height: 36,
    justifyContent: "center",
    left: spacing.lg,
    position: "absolute",
    top: spacing.md,
    width: 36,
  },
  ownerPill: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    position: "absolute",
    right: spacing.lg,
    top: spacing.md,
  },
  ownerPillText: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  identity: {
    paddingHorizontal: spacing.lg,
  },
  avatarRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    marginTop: -(AVATAR_SIZE / 2 + AVATAR_RING),
  },
  avatarRing: {
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    padding: AVATAR_RING,
    ...shadows.card,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  editButton: {
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs + spacing.xxs,
    height: 36,
    paddingHorizontal: spacing.lg,
  },
  editButtonText: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  shareButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  name: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 28,
  },
  areaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  areaText: {
    color: colors.muted,
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  bio: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  switchTrack: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: "row",
    marginTop: spacing.xl,
    padding: spacing.xs,
  },
  switchOption: {
    alignItems: "center",
    borderRadius: radius.pill,
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs + spacing.xxs,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: spacing.sm,
  },
  switchOptionSelected: {
    backgroundColor: colors.card,
    ...shadows.subtle,
  },
  switchText: {
    color: colors.muted,
    flexShrink: 1,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  switchTextSelected: {
    color: colors.text,
  },
  switchDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 6,
    width: 6,
  },
  captionRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.xs + spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  caption: {
    color: colors.muted,
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  captionStrong: {
    color: colors.text,
    fontFamily: fonts.bold,
  },
});
