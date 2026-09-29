import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SeekerAvatar } from "@/features/marketplace/responses/SeekerAvatar";
import { ratingCountLabel } from "@/features/marketplace/responses/ratingCountLabel";
import { ActionButton, CaptionText } from "@/shared/components/ui";
import { colors, fonts, radius, spacing } from "@/theme/tokens";
import type { JobResponse } from "@/types/domain";

const MESSAGE_PREVIEW_LINES = 3;

/**
 * One Job Seeker's response preview on the Provider Responses List — public
 * profile summary, a truncated message preview, and the only navigation
 * into the full Response Detail. Deliberately has no hire/select action of
 * its own (that belongs on Response Detail) and no verification/trust/
 * earnings signals — see the "Provider Responses — List View" Stitch design.
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

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <SeekerAvatar name={worker.name} size={48} />
        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{worker.name}</Text>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          </View>
          <View style={styles.areaRow}>
            <MaterialIcons name="location-on" size={14} color={colors.muted} />
            <CaptionText numberOfLines={1} style={styles.area}>
              {worker.area}
            </CaptionText>
          </View>
        </View>
        <View style={styles.ratingPill}>
          <MaterialIcons name="star" size={14} color={colors.secondary} />
          <Text style={styles.ratingText}>
            <Text style={styles.ratingValue}>{worker.rating}</Text>
            {` · ${ratingCountLabel(worker.ratingCount)}`}
          </Text>
        </View>
      </View>

      <View style={styles.quoteBlock}>
        <MaterialIcons name="format-quote" size={18} color={colors.primary} />
        <CaptionText numberOfLines={MESSAGE_PREVIEW_LINES} style={styles.quote}>
          &ldquo;{response.message}&rdquo;
        </CaptionText>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.receivedRow}>
          <MaterialIcons name="schedule" size={13} color={colors.muted} />
          <CaptionText style={styles.received}>Received {response.receivedAgo}</CaptionText>
        </View>
        <ActionButton
          label="View Response"
          accessibilityLabel={`View response from ${worker.name}`}
          onPress={() =>
            router.push({ pathname: "/(poster)/response-detail", params: { id: response.id } })
          }
          icon={<MaterialIcons name="arrow-forward" size={16} color={colors.card} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  topRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
  },
  identity: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  // Wraps rather than ellipsizing: the category chip drops under the name when
  // the row is tight, so a Job Seeker's name is never cut off.
  nameRow: {
    alignItems: "center",
    columnGap: spacing.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: spacing.xxs,
  },
  name: {
    color: colors.text,
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  categoryChip: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  categoryText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  areaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  area: {
    flexShrink: 1,
  },
  ratingPill: {
    alignItems: "center",
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.pill,
    flexDirection: "row",
    flexShrink: 0,
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  ratingText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  ratingValue: {
    color: colors.secondaryDark,
    fontFamily: fonts.extraBold,
    fontSize: 12,
  },
  quoteBlock: {
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  quote: {
    color: colors.text,
    flex: 1,
    fontStyle: "italic",
  },
  footerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  receivedRow: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: spacing.xs,
  },
  received: {
    flexShrink: 1,
  },
});
