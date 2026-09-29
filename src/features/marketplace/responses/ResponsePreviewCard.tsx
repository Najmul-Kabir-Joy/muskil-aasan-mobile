import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ActionButton, Badge, CaptionText } from "@/shared/components/ui";
import { colors, fonts, radius, spacing } from "@/theme/tokens";
import type { JobResponse } from "@/types/domain";

const AVATAR_TONES = [
  { background: colors.primarySoft, text: colors.primaryDark },
  { background: colors.secondarySoft, text: colors.secondaryDark },
  { background: colors.tertiarySoft, text: colors.tertiaryDark },
];

export function avatarToneFor(name: string) {
  return AVATAR_TONES[name.length % AVATAR_TONES.length];
}

export function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function ratingLabel(rating: number, ratingCount: number) {
  return `${rating} · ${ratingCount} ${ratingCount === 1 ? "rating" : "ratings"}`;
}

/**
 * One Job Seeker's response preview on the Provider Responses List — public
 * profile summary, a truncated message preview, and the only navigation
 * into the full Response Detail. Deliberately has no hire/select action of
 * its own (that belongs on Response Detail) and no verification/trust/
 * earnings signals — see the "Provider Responses" Stitch designs.
 */
export function ResponsePreviewCard({
  response,
  category,
}: {
  response: JobResponse;
  category: string;
}) {
  const router = useRouter();
  const { worker } = response;
  const tone = avatarToneFor(worker.name);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.avatar, { backgroundColor: tone.background }]}>
          <Text style={[styles.avatarText, { color: tone.text }]}>{initialsFor(worker.name)}</Text>
        </View>
        <View style={styles.identity}>
          <Text style={styles.name}>{worker.name}</Text>
          <CaptionText>{worker.area}</CaptionText>
          <View style={styles.ratingRow}>
            <MaterialIcons name="star" size={13} color={colors.secondaryDark} />
            <Text style={styles.ratingText}>{ratingLabel(worker.rating, worker.ratingCount)}</Text>
          </View>
        </View>
      </View>

      <Badge label={category} />

      <CaptionText numberOfLines={2} style={styles.message}>
        &ldquo;{response.message}&rdquo;
      </CaptionText>

      <CaptionText>Received {response.receivedAgo}</CaptionText>

      <ActionButton
        label="View Response"
        accessibilityLabel={`View response from ${worker.name}`}
        onPress={() =>
          router.push({ pathname: "/(poster)/response-detail", params: { id: response.id } })
        }
        icon={<MaterialIcons name="arrow-forward" size={14} color={colors.card} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  topRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
  },
  avatar: {
    alignItems: "center",
    borderRadius: radius.pill,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  avatarText: {
    fontFamily: fonts.extraBold,
    fontSize: 14,
  },
  identity: {
    flex: 1,
    gap: spacing.xxs,
  },
  name: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  ratingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
  },
  ratingText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  message: {
    fontStyle: "italic",
  },
});
