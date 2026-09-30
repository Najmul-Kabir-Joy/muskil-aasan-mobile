import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import type { Edges } from "react-native-safe-area-context";
import { ApplicationCard, CompletedWorkCard } from "@/features/marketplace/seeker/ApplicationCards";
import { groupApplications } from "@/features/marketplace/seeker/seekerActivity";
import { useSeekerActivity } from "@/features/marketplace/seeker/SeekerActivityContext";
import { SEEKER_HOME_ROUTE } from "@/features/marketplace/seeker/seekerRoutes";
import {
  SeekerEmptyState,
  SeekerPageHeader,
} from "@/features/marketplace/seeker/SeekerScreenParts";
import { ActionButton, ScrollScreen } from "@/shared/components/ui";
import { getSeekerCompletedJobs } from "@/data/mock";
import { colors, fonts, radius, shadows, spacing } from "@/theme/tokens";
import type { CompletedJob, SeekerApplication } from "@/types/domain";

export type ApplicationsTab = "active" | "completed";

/**
 * Applications — the Jobs the Job Seeker responded to, and what's
 * happening with them. The Seeker's side of the confirmed flow: they
 * respond privately; the Provider may choose them and send a job request;
 * they accept it. Completed work sits on its own tab.
 *
 * Active is ordered by what needs them: job requests waiting for an answer
 * first, then accepted job requests, then Responses still waiting to hear
 * back. Deliberately nothing beyond the confirmed steps — no decline,
 * withdraw, "not selected", expiry, contact or payment — since those rules
 * are undefined.
 *
 * Renders only page content; the Seeker shell owns the header and nav.
 */
export function SeekerApplicationsScreen({
  edges,
  completedJobs = getSeekerCompletedJobs(),
  initialTab = "active",
}: {
  edges?: Edges;
  completedJobs?: CompletedJob[];
  initialTab?: ApplicationsTab;
} = {}) {
  const router = useRouter();
  const { applications, acceptRequest } = useSeekerActivity();
  const [tab, setTab] = useState<ApplicationsTab>(initialTab);
  const { jobRequests, accepted, responsesSent } = groupApplications(applications);
  const counts: Record<ApplicationsTab, number> = {
    active: applications.length,
    completed: completedJobs.length,
  };

  function confirmAccept(application: SeekerApplication) {
    const providerName = application.job.postedBy?.name ?? "the Job Provider";
    Alert.alert(
      "Accept this job request?",
      `You're agreeing to do “${application.job.title}” for ${providerName}.`,
      [
        { text: "Not now", style: "cancel" },
        { text: "Accept", onPress: () => acceptRequest(application.id) },
      ],
    );
  }

  const tabs: { id: ApplicationsTab; label: string }[] = [
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
  ];

  const sections: { key: string; title: string; hint?: string; items: SeekerApplication[] }[] = [
    {
      key: "jobRequests",
      title: "Job requests",
      hint: "Waiting for your answer",
      items: jobRequests,
    },
    { key: "accepted", title: "Accepted", items: accepted },
    { key: "responsesSent", title: "Responses sent", items: responsesSent },
  ];

  return (
    <ScrollScreen edges={edges}>
      <View style={styles.page}>
        <SeekerPageHeader
          icon="assignment"
          title="Applications"
          count={
            jobRequests.length > 0
              ? `${jobRequests.length} waiting for you`
              : `${applications.length} active`
          }
          caption="Jobs you've responded to. Each Response is private to that Job Provider."
        />

        {/* Equal-width fixed tabs, as on the Provider's My Jobs. */}
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

        {tab === "active" ? (
          applications.length === 0 ? (
            <SeekerEmptyState
              icon="assignment"
              title="No applications yet"
              body="When you respond to a job, it shows here so you can follow what happens next."
              action={
                <ActionButton label="Find jobs" onPress={() => router.push(SEEKER_HOME_ROUTE)} />
              }
            />
          ) : (
            sections
              .filter((section) => section.items.length > 0)
              .map((section) => (
                <View key={section.key} style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text accessibilityRole="header" style={styles.sectionTitle}>
                      {section.title}
                    </Text>
                    <View style={styles.sectionCount}>
                      <Text style={styles.sectionCountText}>{section.items.length}</Text>
                    </View>
                    {section.hint ? <Text style={styles.sectionHint}>{section.hint}</Text> : null}
                  </View>
                  {section.items.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      onAccept={() => confirmAccept(application)}
                    />
                  ))}
                </View>
              ))
          )
        ) : null}

        {tab === "completed" ? (
          completedJobs.length === 0 ? (
            <SeekerEmptyState
              icon="work-history"
              title="No completed work yet"
              body="Jobs you finish show here, with the rating and feedback you received."
            />
          ) : (
            <View style={styles.section}>
              {completedJobs.map((job) => (
                <CompletedWorkCard key={job.id} job={job} />
              ))}
            </View>
          )
        ) : null}
      </View>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: spacing.lg,
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
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 15,
  },
  sectionCount: {
    alignItems: "center",
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    minWidth: 20,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
  },
  sectionCountText: {
    color: colors.muted,
    fontFamily: fonts.extraBold,
    fontSize: 10,
  },
  sectionHint: {
    color: colors.secondaryDark,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
});
