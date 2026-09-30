import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Edges } from "react-native-safe-area-context";
import {
  CompletedJobCard,
  InProgressJobCard,
  OpenJobCard,
} from "@/features/marketplace/my-jobs/MyJobCards";
import { ActionButton, CaptionText, ScrollScreen } from "@/shared/components/ui";
import { BRAND_NAME } from "@/shared/constants/brand";
import { getProviderJobs } from "@/data/mock";
import { colors, fonts, radius, shadows, spacing } from "@/theme/tokens";
import type { ProviderJobs, WorkerProfile } from "@/types/domain";

export type MyJobsTab = "open" | "inProgress" | "completed";

const EMPTY_STATES: Record<
  MyJobsTab,
  { icon: keyof typeof MaterialIcons.glyphMap; title: string; body: string }
> = {
  open: {
    icon: "post-add",
    title: "No open jobs",
    body: "Post a job to start getting responses from Job Seekers nearby.",
  },
  inProgress: {
    icon: "hourglass-empty",
    title: "Nothing in progress",
    body: "When a Job Seeker accepts your job request, the job shows here.",
  },
  completed: {
    icon: "work-history",
    title: "No completed jobs yet",
    body: `Jobs you finish through ${BRAND_NAME} show here, with the rating you received.`,
  },
};

/**
 * The Job Provider's My Jobs — every job they've posted, in three tabs that
 * follow the confirmed flow: Open (collecting private Responses), In
 * progress (a Job Seeker accepted the job request), and Completed.
 *
 * Deliberately no lifecycle actions (mark complete, cancel, edit, pay):
 * those rules aren't defined yet. Nor a "waiting for the Job Seeker to
 * accept" stage — whether a job stays open to Responses meanwhile is an
 * open product decision.
 *
 * Renders only page content; the header, drawer and bottom navigation
 * belong to the Provider shell. Reads the shared mock data by default;
 * explicit props let tests render any state.
 */
export function ProviderMyJobsScreen({
  edges,
  jobs = getProviderJobs(),
  initialTab = "open",
}: {
  edges?: Edges;
  jobs?: ProviderJobs;
  initialTab?: MyJobsTab;
} = {}) {
  const router = useRouter();
  const [tab, setTab] = useState<MyJobsTab>(initialTab);
  const counts: Record<MyJobsTab, number> = {
    open: jobs.open.length,
    inProgress: jobs.inProgress.length,
    completed: jobs.completed.length,
  };
  const total = counts.open + counts.inProgress + counts.completed;

  function viewSeeker(seeker: WorkerProfile) {
    router.push({
      pathname: "/(poster)/public-profile",
      params: { id: seeker.id, view: "seeker" },
    });
  }

  const tabs: { id: MyJobsTab; label: string }[] = [
    { id: "open", label: "Open" },
    { id: "inProgress", label: "In progress" },
    { id: "completed", label: "Completed" },
  ];

  return (
    <ScrollScreen edges={edges}>
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.titleGroup}>
              <View style={styles.titleIcon}>
                <MaterialIcons name="assignment-turned-in" size={18} color={colors.primary} />
              </View>
              <Text accessibilityRole="header" style={styles.title}>
                My Jobs
              </Text>
            </View>
            <View style={styles.summaryPill}>
              <Text style={styles.summaryText}>
                {total} {total === 1 ? "job" : "jobs"} posted
              </Text>
            </View>
          </View>
          <CaptionText>
            Track every job you&apos;ve posted, from first response to done.
          </CaptionText>
        </View>

        {/* Three fixed tabs, always all visible — equal widths rather than
            scrolling chips, so none can be pushed off a narrow screen. */}
        <View accessibilityRole="tablist" style={styles.tabs}>
          {tabs.map((option) => {
            const selected = option.id === tab;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="tab"
                accessibilityLabel={`${option.label}, ${counts[option.id]}`}
                accessibilityState={{ selected }}
                onPress={() => setTab(option.id)}
                style={[styles.tab, selected && styles.tabSelected]}
              >
                <Text
                  numberOfLines={1}
                  style={[styles.tabLabel, selected && styles.tabLabelSelected]}
                >
                  {option.label}
                </Text>
                <View style={[styles.tabCount, selected && styles.tabCountSelected]}>
                  <Text style={[styles.tabCountText, selected && styles.tabCountTextSelected]}>
                    {counts[option.id]}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.list}>
          {counts[tab] === 0 ? (
            <EmptyTab tab={tab} onPostJob={() => router.push("/(poster)/post-task")} />
          ) : null}

          {tab === "open"
            ? jobs.open.map((post) => (
                <OpenJobCard
                  key={post.task.id}
                  post={post}
                  onViewResponses={() => router.push("/(poster)/responses")}
                />
              ))
            : null}

          {tab === "inProgress"
            ? jobs.inProgress.map(({ task, seekers }) => (
                <InProgressJobCard
                  key={task.id}
                  task={task}
                  seekers={seekers}
                  onViewSeeker={viewSeeker}
                />
              ))
            : null}

          {tab === "completed"
            ? jobs.completed.map(({ job, seeker }) => (
                <CompletedJobCard
                  key={job.id}
                  job={job}
                  seeker={seeker}
                  onViewSeeker={() => viewSeeker(seeker)}
                />
              ))
            : null}
        </View>
      </View>
    </ScrollScreen>
  );
}

function EmptyTab({ tab, onPostJob }: { tab: MyJobsTab; onPostJob: () => void }) {
  const { icon, title, body } = EMPTY_STATES[tab];
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <MaterialIcons name={icon} size={26} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <CaptionText style={styles.emptyBody}>{body}</CaptionText>
      {tab === "open" ? (
        <View style={styles.emptyAction}>
          <ActionButton label="Post a Job" onPress={onPostJob} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  titleGroup: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    gap: spacing.sm,
  },
  titleIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 20,
  },
  summaryPill: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexShrink: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  summaryText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  tabs: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: "row",
    padding: spacing.xs,
  },
  tab: {
    alignItems: "center",
    borderRadius: radius.pill,
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: spacing.xxs,
  },
  tabSelected: {
    backgroundColor: colors.card,
    ...shadows.subtle,
  },
  tabLabel: {
    color: colors.muted,
    flexShrink: 1,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  tabLabelSelected: {
    color: colors.text,
    fontFamily: fonts.bold,
  },
  tabCount: {
    alignItems: "center",
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    minWidth: 20,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
  },
  tabCountSelected: {
    backgroundColor: colors.primary,
  },
  tabCountText: {
    color: colors.muted,
    fontFamily: fonts.extraBold,
    fontSize: 10,
  },
  tabCountTextSelected: {
    color: colors.card,
  },
  list: {
    gap: spacing.md,
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "dashed",
    borderWidth: 1,
    padding: spacing.xl,
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 17,
    marginTop: spacing.md,
  },
  emptyBody: {
    marginTop: spacing.xs,
    textAlign: "center",
  },
  emptyAction: {
    alignSelf: "stretch",
    marginTop: spacing.lg,
  },
});
