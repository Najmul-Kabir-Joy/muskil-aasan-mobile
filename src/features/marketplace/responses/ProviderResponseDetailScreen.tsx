import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Edges } from "react-native-safe-area-context";
import { avatarToneFor, initialsFor } from "@/features/marketplace/responses/ResponsePreviewCard";
import { ActionButton, AppText, CaptionText, Screen } from "@/shared/components/ui";
import { BRAND_NAME } from "@/shared/constants/brand";
import { colors, fonts, radius, shadows, spacing } from "@/theme/tokens";
import type { JobResponse, Task } from "@/types/domain";

const FEEDBACK_STAR_COUNT = 5;

/**
 * The finalized Provider Response Detail — original job context, the Job
 * Seeker's public identity, their full response message, exactly one
 * previous-work feedback preview, and the "Select Job Seeker" CTA. Public
 * profile information only: no phone/email/NID, no verification/trust
 * badges, no reviewer identity on the feedback preview — see the "Provider
 * Response Detail" Stitch design and docs/engineering/domain-and-
 * terminology.md.
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
  const { worker } = response;
  const tone = avatarToneFor(worker.name);

  return (
    <Screen edges={edges}>
      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>
      <Text style={styles.pageTitle}>Response Detail</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Response to:</Text>
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
            <View style={[styles.avatar, { backgroundColor: tone.background }]}>
              <Text style={[styles.avatarText, { color: tone.text }]}>
                {initialsFor(worker.name)}
              </Text>
            </View>
            <View style={styles.identityInfo}>
              <Text style={styles.workerName}>{worker.name}</Text>
              <CaptionText>{worker.area}</CaptionText>
              <View style={styles.ratingRow}>
                <MaterialIcons name="star" size={13} color={colors.secondaryDark} />
                <Text style={styles.ratingText}>
                  {worker.rating} · {worker.ratingCount}{" "}
                  {worker.ratingCount === 1 ? "rating" : "ratings"}
                </Text>
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
            style={styles.linkRow}
          >
            <Text style={styles.linkText}>View Full Seeker Profile</Text>
            <MaterialIcons name="arrow-forward" size={14} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Response Message</Text>
          <CaptionText>Received {response.receivedAgo}</CaptionText>
          <AppText style={styles.message}>{response.message}</AppText>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Previous Work &amp; Feedback</Text>
          <Text style={styles.feedbackJobTitle}>{response.previousWork.jobTitle}</Text>
          <View style={styles.starsRow}>
            {Array.from({ length: FEEDBACK_STAR_COUNT }, (_, index) => (
              <MaterialIcons
                key={index}
                name={index < response.previousWork.rating ? "star" : "star-border"}
                size={16}
                color={colors.secondaryDark}
              />
            ))}
          </View>
          <AppText style={styles.message}>&ldquo;{response.previousWork.comment}&rdquo;</AppText>
          <CaptionText>Completed through {BRAND_NAME}</CaptionText>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          label={selected ? "Job Seeker Selected" : "Select Job Seeker"}
          accessibilityLabel={selected ? `${worker.name} selected` : `Select ${worker.name}`}
          disabled={selected}
          onPress={() => setSelected(true)}
          icon={
            <MaterialIcons
              name={selected ? "check" : "send"}
              size={14}
              color={selected ? colors.muted : colors.card}
            />
          }
        />
        <CaptionText style={styles.footerNote}>
          Selecting this Job Seeker will send them a job request for {task.budget}.
        </CaptionText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
  },
  backButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
    minHeight: 44,
    paddingVertical: spacing.xs,
  },
  backText: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  pageTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 20,
    marginTop: spacing.xs,
  },
  scroll: {
    flex: 1,
    marginTop: spacing.lg,
  },
  scrollContent: {
    gap: spacing.lg,
    paddingBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  sectionLabel: {
    color: colors.primary,
    fontFamily: fonts.extraBold,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  jobTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 17,
  },
  linkRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
    marginTop: spacing.xxs,
  },
  linkText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  identityRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
  },
  avatar: {
    alignItems: "center",
    borderRadius: radius.pill,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  avatarText: {
    fontFamily: fonts.extraBold,
    fontSize: 16,
  },
  identityInfo: {
    flex: 1,
    gap: spacing.xxs,
  },
  workerName: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
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
    color: colors.text,
  },
  feedbackJobTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  footer: {
    backgroundColor: colors.appBg,
    gap: spacing.xs,
    paddingTop: spacing.md,
    ...shadows.bottomBar,
  },
  footerNote: {
    textAlign: "center",
  },
});
