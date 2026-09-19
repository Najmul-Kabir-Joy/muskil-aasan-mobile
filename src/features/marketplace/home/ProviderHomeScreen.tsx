import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Edges } from "react-native-safe-area-context";
import { CommunityJobOverflowSheet } from "@/features/marketplace/home/CommunityJobOverflowSheet";
import { ReferSomeoneSheet } from "@/features/marketplace/home/ReferSomeoneSheet";
import { CommunityPostCard } from "@/features/marketplace/components";
import { ActionButton, AppText, PrimaryButton, ScrollScreen } from "@/shared/components/ui";
import { communityTasks, getEligibleReferrals, tasks } from "@/data/mock";
import { colors, fonts, radius, spacing } from "@/theme/tokens";
import type { EligibleReferral, Task } from "@/types/domain";

function defaultLatestJob(): Task | null {
  return tasks.find((task) => task.status !== "completed") ?? null;
}

/**
 * The Job Provider Home screen — greeting, Post Job banner, "Your Latest
 * Job" (or its empty state), and the "Community Jobs" feed. The empty state
 * is NOT a separate screen: it's this same component rendering different
 * data (`latestJob` null vs set), per
 * docs/engineering/domain-and-terminology.md's guidance to derive state from
 * data rather than duplicate screens.
 *
 * Defaults read from the shared mock dataset so the real route needs no
 * props; explicit props exist so tests (and the empty/no-eligible states)
 * can render either state directly instead of mutating shared mock data.
 */
export function ProviderHomeScreen({
  edges,
  latestJob = defaultLatestJob(),
  communityJobs = communityTasks,
  eligibleReferrals = getEligibleReferrals(),
}: {
  edges?: Edges;
  latestJob?: Task | null;
  communityJobs?: Task[];
  eligibleReferrals?: EligibleReferral[];
} = {}) {
  const router = useRouter();
  const [referJob, setReferJob] = useState<Task | null>(null);
  const [isReferSheetVisible, setReferSheetVisible] = useState(false);
  const [overflowJob, setOverflowJob] = useState<Task | null>(null);
  const [isOverflowSheetVisible, setOverflowSheetVisible] = useState(false);

  function handleOpenRefer(job: Task) {
    setReferJob(job);
    setReferSheetVisible(true);
  }

  function handleOpenOverflow(job: Task) {
    setOverflowJob(job);
    setOverflowSheetVisible(true);
  }

  return (
    <>
      <ScrollScreen edges={edges}>
        <View>
          <Text style={styles.greeting}>Good evening, Nadia</Text>
          <AppText style={styles.greetingSubtitle}>What do you need help with today?</AppText>
        </View>

        <View style={styles.postBanner}>
          <View style={styles.postBannerText}>
            <MaterialIcons name="add-task" size={20} color={colors.card} />
            <AppText style={styles.postBannerCopy}>
              <Text style={styles.postBannerBold}>Need help with something? </Text>
              Post a job and find someone to help.
            </AppText>
          </View>
          <PrimaryButton label="+ Post a Job" href="/(poster)/post-task" tone="secondary" />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Your Latest Job</Text>
            {latestJob ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/(poster)/tasks")}
                style={styles.viewAllLink}
              >
                <Text style={styles.viewAllText}>View All My Jobs</Text>
                <MaterialIcons name="arrow-right-alt" size={16} color={colors.primary} />
              </Pressable>
            ) : null}
          </View>
          {latestJob ? (
            <LatestJobCard job={latestJob} />
          ) : (
            <View style={styles.emptyLatestCard}>
              <View style={styles.emptyLatestIconCircle}>
                <MaterialIcons name="assignment-add" size={26} color={colors.primary} />
              </View>
              <Text style={styles.emptyLatestTitle}>No jobs posted yet</Text>
              <AppText style={styles.emptyLatestBody}>
                Need help with something? Post your first job.
              </AppText>
              <PrimaryButton label="Post Your First Job" href="/(poster)/post-task" />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.communityHeaderRow}>
            <View style={styles.communityHeaderText}>
              <Text style={styles.sectionTitle}>Community Jobs</Text>
              <AppText style={styles.communitySubtitle}>
                Recent jobs from the Muskill Asaan community
              </AppText>
            </View>
            <View style={styles.nearbyChip}>
              <MaterialIcons name="near-me" size={14} color={colors.primary} />
              <Text style={styles.nearbyChipText}>Nearby</Text>
            </View>
          </View>
          <View style={styles.communityList}>
            {communityJobs.map((job) => (
              <CommunityPostCard
                key={job.id}
                task={job}
                onRefer={handleOpenRefer}
                onOverflow={handleOpenOverflow}
              />
            ))}
          </View>
        </View>
      </ScrollScreen>

      <ReferSomeoneSheet
        visible={isReferSheetVisible}
        onClose={() => setReferSheetVisible(false)}
        job={referJob}
        eligibleReferrals={eligibleReferrals}
      />
      <CommunityJobOverflowSheet
        visible={isOverflowSheetVisible}
        onClose={() => setOverflowSheetVisible(false)}
        job={overflowJob}
      />
    </>
  );
}

function LatestJobCard({ job }: { job: Task }) {
  const router = useRouter();

  return (
    <View style={styles.latestCard}>
      <View style={styles.latestTopRow}>
        <AppText style={styles.latestMetaText} numberOfLines={1}>
          {job.category} · {job.area} · {job.timing}
        </AppText>
        <View style={styles.activePill}>
          <View style={styles.activeDot} />
          <Text style={styles.activePillText}>Active</Text>
        </View>
      </View>
      <Text style={styles.latestTitle}>{job.title}</Text>
      <View style={styles.latestMetricsRow}>
        <Text style={styles.latestBudget}>{job.budget}</Text>
        <View style={styles.responsesPill}>
          <Text style={styles.responsesPillText}>{job.offerCount} responses</Text>
        </View>
      </View>
      <View style={styles.latestButtonRow}>
        <View style={styles.latestButtonFlex}>
          <ActionButton
            label={`View Responses (${job.offerCount})`}
            onPress={() => router.push("/(poster)/responses")}
          />
        </View>
        <View style={styles.latestButtonFlex}>
          <ActionButton
            label="View Job"
            onPress={() => router.push("/(poster)/tasks")}
            tone="secondary"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  greeting: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 22,
  },
  greetingSubtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: spacing.xxs,
  },
  postBanner: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    padding: spacing.md,
  },
  postBannerText: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
  },
  postBannerCopy: {
    color: colors.card,
    flexShrink: 1,
    fontSize: 12,
  },
  postBannerBold: {
    fontFamily: fonts.bold,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 16,
  },
  viewAllLink: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
  },
  viewAllText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  latestCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  latestTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  latestMetaText: {
    color: colors.muted,
    flexShrink: 1,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  activePill: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  activeDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 6,
    width: 6,
  },
  activePillText: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  latestTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 17,
    lineHeight: 23,
  },
  latestMetricsRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  latestBudget: {
    color: colors.primary,
    fontFamily: fonts.extraBold,
    fontSize: 20,
  },
  responsesPill: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  responsesPillText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  latestButtonRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  latestButtonFlex: {
    flex: 1,
  },
  emptyLatestCard: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.xl,
  },
  emptyLatestIconCircle: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 56,
    justifyContent: "center",
    marginBottom: spacing.xs,
    width: 56,
  },
  emptyLatestTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 16,
  },
  emptyLatestBody: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  communityHeaderRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  communityHeaderText: {
    flex: 1,
    gap: 2,
  },
  communitySubtitle: {
    fontSize: 13,
  },
  nearbyChip: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  nearbyChipText: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  communityList: {
    gap: spacing.md,
  },
});
