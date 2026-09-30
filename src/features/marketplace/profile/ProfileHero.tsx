import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { COVER_HEIGHT } from "@/features/marketplace/profile/photoFraming";
import { ProfileBio } from "@/features/marketplace/profile/ProfileBio";
import type { ProfileSide, ProfileViewer } from "@/features/marketplace/profile/profileHelpers";
import { ProfilePhotoView } from "@/features/marketplace/profile/ProfilePhotoView";
import { SeekerAvatar } from "@/features/marketplace/responses/SeekerAvatar";
import { BRAND_NAME } from "@/shared/constants/brand";
import { colors, fonts, gradients, radius, shadows, spacing } from "@/theme/tokens";
import type { ProfilePhoto } from "@/types/domain";

const AVATAR_SIZE = 88;
const AVATAR_RING = 4;
const HIT_SLOP = { top: 6, bottom: 6, left: 6, right: 6 };

/**
 * The profile's identity block from the finalized Profile Stitch designs:
 * cover, overlapping profile photo, Share, name, area, and the bio for the
 * side being shown.
 *
 * Owners edit in place, Facebook-style — there is no separate Edit Profile
 * screen: a pencil on the cover and on the profile photo opens the photo
 * flow, and a pencil beside the bio edits it inline. Other people see none
 * of these controls.
 *
 * There is deliberately no Provider / Seeker switch here: which side shows
 * comes from context (your own profile follows your current app mode).
 */
export function ProfileHero({
  name,
  area,
  bio,
  profilePhoto,
  coverPhoto,
  viewer,
  side,
  onShare,
  onEditProfilePhoto,
  onEditCoverPhoto,
  onSaveBio,
  onBack,
}: {
  name: string;
  area: string;
  bio: string;
  profilePhoto: ProfilePhoto | null;
  coverPhoto: ProfilePhoto | null;
  viewer: ProfileViewer;
  side: ProfileSide;
  onShare: () => void;
  onEditProfilePhoto: () => void;
  onEditCoverPhoto: () => void;
  onSaveBio: (bio: string) => void;
  onBack?: () => void;
}) {
  const isOwner = viewer === "owner";
  // The cover spans the full screen width.
  const { width: coverWidth } = useWindowDimensions();

  return (
    <View style={styles.hero}>
      <View style={styles.cover}>
        {coverPhoto ? (
          <ProfilePhotoView photo={coverPhoto} width={coverWidth} height={COVER_HEIGHT} />
        ) : (
          <LinearGradient
            colors={gradients.profileCover}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
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
          </LinearGradient>
        )}
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
          <>
            <View style={styles.ownerPill}>
              <MaterialIcons name="admin-panel-settings" size={14} color={colors.primary} />
              <Text style={styles.ownerPillText}>Owner View</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit cover photo"
              hitSlop={HIT_SLOP}
              onPress={onEditCoverPhoto}
              style={[styles.pencil, styles.coverPencil]}
            >
              <MaterialIcons name="edit" size={16} color={colors.text} />
            </Pressable>
          </>
        ) : null}
      </View>

      <View style={styles.identity}>
        <View style={styles.avatarRow}>
          <View style={styles.avatarRing}>
            {profilePhoto ? (
              <ProfilePhotoView
                photo={profilePhoto}
                width={AVATAR_SIZE}
                height={AVATAR_SIZE}
                round
              />
            ) : (
              <SeekerAvatar name={name} size={AVATAR_SIZE} />
            )}
            {isOwner ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit profile photo"
                hitSlop={HIT_SLOP}
                onPress={onEditProfilePhoto}
                style={[styles.pencil, styles.avatarPencil]}
              >
                <MaterialIcons name="edit" size={15} color={colors.text} />
              </Pressable>
            ) : null}
          </View>
          <View style={styles.actions}>
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
        {/* Keyed by side so an unsaved edit of one side's bio never carries
            over to the other side's. */}
        <ProfileBio key={side} bio={bio} editable={isOwner} onSave={onSaveBio} />

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
    return side === "provider" ? (
      <Text style={styles.caption}>
        Showing your <Text style={styles.captionStrong}>Provider profile</Text> for Job Provider
        mode. Anyone on {BRAND_NAME} can see the parts marked Public.
      </Text>
    ) : (
      <Text style={styles.caption}>
        Showing your <Text style={styles.captionStrong}>Seeker profile</Text> for Job Seeker mode.
        Anyone on {BRAND_NAME} can see the parts marked Public.
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
    backgroundColor: colors.primaryDark,
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
  pencil: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    justifyContent: "center",
    position: "absolute",
    ...shadows.subtle,
  },
  coverPencil: {
    bottom: spacing.md,
    height: 34,
    right: spacing.lg,
    width: 34,
  },
  avatarPencil: {
    borderColor: colors.surface,
    borderWidth: 2,
    bottom: 0,
    height: 30,
    right: 0,
    width: 30,
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
  captionRow: {
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    flexDirection: "row",
    gap: spacing.xs + spacing.xxs,
    marginTop: spacing.lg,
    padding: spacing.sm + spacing.xxs,
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
