import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Edges } from "react-native-safe-area-context";
import { SeekerAvatar } from "@/features/marketplace/responses/SeekerAvatar";
import { ratingCountLabel } from "@/features/marketplace/responses/ratingCountLabel";
import { ActionButton, CaptionText, Screen } from "@/shared/components/ui";
import { BRAND_NAME } from "@/shared/constants/brand";
import { colors, fonts, radius, spacing } from "@/theme/tokens";
import type { JobResponse, Task } from "@/types/domain";

const FEEDBACK_STAR_COUNT = 5;

// How far the Provider bottom navigation's elevated Post Job button rises
// above the bar (see `FAB_LIFT` + the ring in ProviderBottomNav). The sticky
// footer needs at least this much clearance under its button, or the button
// would sit underneath the raised Post Job action.
const POST_JOB_BUTTON_CLEARANCE = 24;

/**
 * The finalized Provider Response Detail — original job context, the Job
 * Seeker's public identity, their full response message, exactly one
 * previous-work feedback preview, and the "Select Job Seeker" CTA. Public
 * profile information only: no phone/email/NID, no verification/trust
 * badges, no reviewer identity on the feedback preview — see the "Provider
 * Response Detail" Stitch design and docs/engineering/domain-and-
 * terminology.md.
 *
 * Renders only the page's own sub-header (Back + title) and content: the
 * global header, drawer and bottom navigation belong to the Provider shell.
 *
 * `task`/`response` are resolved by the route from an `id` param (see
 * `app/(poster)/response-detail.tsx`) so this component itself stays
 * trivially testable with explicit props, matching every other screen in
 * this feature.
 */
export function ProviderResponseDetailScreen({
  task,
  response,
  edges,
}: {
  task: Task;
  response: JobResponse;
  edges?: Edges;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(false);
  const { worker, previousWork } = response;

  return (
    <Screen edges={edges} padded={false}>
      <View style={styles.subHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={18} color={colors.text} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text accessibilityRole="header" numberOfLines={1} style={styles.subHeaderTitle}>
          Response Detail
        </Text>
        <View style={styles.subHeaderBalance} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.jobBanner}>
          <View style={styles.bannerLabelRow}>
            <MaterialIcons name="assignment-turned-in" size={16} color={colors.primary} />
            <Text style={styles.bannerLabel}>Response to:</Text>
          </View>
          <Text style={styles.jobTitle}>{task.title}</Text>
          <CaptionText>
            {task.area} • Budget: {task.budget}
            {task.postedAgo ? ` • Posted ${task.postedAgo}` : ""}
          </CaptionText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View original job"
            onPress={() => router.push("/(poster)/tasks")}
            style={styles.linkRow}
          >
            <Text style={styles.linkText}>View Original Job</Text>
            <MaterialIcons name="arrow-forward" size={14} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.identityRow}>
            <SeekerAvatar name={worker.name} size={64} />
            <View style={styles.identityInfo}>
              <Text numberOfLines={2} style={styles.workerName}>
                {worker.name}
              </Text>
              <View style={styles.areaRow}>
                <MaterialIcons name="location-on" size={14} color={colors.primary} />
                <CaptionText numberOfLines={1} style={styles.area}>
                  {worker.area}
                </CaptionText>
              </View>
              <View style={styles.ratingRow}>
                <MaterialIcons name="star" size={15} color={colors.secondary} />
                <Text style={styles.ratingValue}>{worker.rating} Seeker Rating</Text>
                <Text style={styles.ratingCount}>({ratingCountLabel(worker.ratingCount)})</Text>
              </View>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${worker.name}'s profile`}
            onPress={() =>
              router.push({
                pathname: "/(poster)/coming-soon",
                params: { title: `${worker.name}'s Profile` },
              })
            }
            style={styles.profileButton}
          >
            <Text style={styles.linkText}>View Full Seeker Profile</Text>
            <MaterialIcons name="north-east" size={15} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Response Message</Text>
            <CaptionText style={styles.sentTime}>Sent {response.receivedAgo}</CaptionText>
          </View>
          <View style={styles.card}>
            <Text style={styles.message}>&ldquo;{response.message}&rdquo;</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Previous Work &amp; Feedback</Text>
          </View>
          <View style={styles.feedbackCard}>
            <View style={styles.feedbackTopRow}>
              <Text style={styles.feedbackJobTitle}>{previousWork.jobTitle}</Text>
              <View style={styles.starsRow}>
                {Array.from({ length: FEEDBACK_STAR_COUNT }, (_, index) => (
                  <MaterialIcons
                    key={index}
                    name={index < previousWork.rating ? "star" : "star-border"}
                    size={15}
                    color={colors.secondary}
                  />
                ))}
                <Text style={styles.feedbackRatingValue}>{previousWork.rating.toFixed(1)}</Text>
              </View>
            </View>
            <Text style={styles.feedbackComment}>&ldquo;{previousWork.comment}&rdquo;</Text>
            <View style={styles.completedRow}>
              <MaterialIcons name="check-circle" size={14} color={colors.primary} />
              <CaptionText>Completed through {BRAND_NAME}</CaptionText>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.budgetRow}>
          <MaterialIcons name="payments" size={15} color={colors.primary} />
          <CaptionText>
            Budget: <Text style={styles.budgetValue}>{task.budget}</Text>
          </CaptionText>
        </View>
        <ActionButton
          label={selected ? "Job Seeker Selected" : "Select Job Seeker"}
          accessibilityLabel={selected ? `${worker.name} selected` : `Select ${worker.name}`}
          disabled={selected}
          onPress={() => setSelected(true)}
          icon={
            <MaterialIcons
              name="check-circle"
              size={20}
              color={selected ? colors.muted : colors.card}
            />
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subHeader: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 44,
    minWidth: 72,
  },
  backText: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  subHeaderTitle: {
    color: colors.text,
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 16,
    textAlign: "center",
  },
  // Mirrors the Back button's width so the title stays truly centered.
  subHeaderBalance: {
    minWidth: 72,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  jobBanner: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  bannerLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  bannerLabel: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  jobTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 16,
    lineHeight: 22,
  },
  linkRow: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: spacing.xxs,
    marginTop: spacing.xs,
    minHeight: 32,
  },
  linkText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  identityRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  identityInfo: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  workerName: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 18,
    lineHeight: 24,
  },
  areaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  area: {
    flexShrink: 1,
  },
  ratingRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  ratingValue: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 12,
  },
  ratingCount: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  profileButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
  },
  sectionLabel: {
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  sentTime: {
    flexShrink: 1,
    fontSize: 11,
  },
  message: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 22,
  },
  feedbackCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  feedbackTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  feedbackJobTitle: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 21,
  },
  starsRow: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    gap: 1,
    paddingTop: spacing.xxs,
  },
  feedbackRatingValue: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 11,
    marginLeft: spacing.xs,
  },
  feedbackComment: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 19,
  },
  completedRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  footer: {
    backgroundColor: colors.appBg,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.sm,
    paddingBottom: POST_JOB_BUTTON_CLEARANCE,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  budgetRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
  },
  budgetValue: {
    color: colors.text,
    fontFamily: fonts.extraBold,
  },
});
