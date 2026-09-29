import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Edges } from "react-native-safe-area-context";
import { JobFilterChips } from "@/features/marketplace/responses/JobFilterChips";
import { JobResponsesSection } from "@/features/marketplace/responses/JobResponsesSection";
import { ResponsesEmptyState } from "@/features/marketplace/responses/ResponsesEmptyState";
import { CaptionText, ScrollScreen } from "@/shared/components/ui";
import { getActiveJob, getJobsWithResponses } from "@/data/mock";
import { colors, fonts, radius, spacing } from "@/theme/tokens";
import type { JobWithResponses, Task } from "@/types/domain";

const ALL_JOBS_FILTER = "all";

/**
 * The Job Provider Responses List — "Which of my jobs received responses,
 * and who responded?" Renders either the canonical grouped-by-job list or
 * the empty state from the same `jobsWithResponses` data, per
 * docs/engineering/domain-and-terminology.md's guidance to derive state
 * from data rather than duplicate screens/routes. Matches the "Provider
 * Responses — List View" and "— Empty State" Stitch designs.
 *
 * Renders only page content: the global header, drawer and bottom
 * navigation belong to the Provider shell (`app/(poster)/_layout.tsx`).
 *
 * Defaults read from the shared mock dataset so the real route needs no
 * props; explicit props exist so tests can render either state directly.
 */
export function ProviderResponsesScreen({
  edges,
  jobsWithResponses = getJobsWithResponses(),
  activeJob = getActiveJob(),
}: {
  edges?: Edges;
  jobsWithResponses?: JobWithResponses[];
  activeJob?: Task | null;
} = {}) {
  const [selectedJobId, setSelectedJobId] = useState<string>(ALL_JOBS_FILTER);
  const hasResponses = jobsWithResponses.length > 0;

  // Fall back to "All Jobs" if the selected job is no longer in the data, so
  // a stale selection can never leave the list blank.
  const activeFilterId = jobsWithResponses.some(({ task }) => task.id === selectedJobId)
    ? selectedJobId
    : ALL_JOBS_FILTER;
  const visibleJobs =
    activeFilterId === ALL_JOBS_FILTER
      ? jobsWithResponses
      : jobsWithResponses.filter(({ task }) => task.id === activeFilterId);

  const filterOptions = [
    {
      id: ALL_JOBS_FILTER,
      label: "All Jobs",
      count: jobsWithResponses.reduce((total, { responses }) => total + responses.length, 0),
    },
    ...jobsWithResponses.map(({ task, responses }) => ({
      id: task.id,
      label: task.title,
      count: responses.length,
    })),
  ];

  return (
    <ScrollScreen edges={edges}>
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.titleGroup}>
              {hasResponses ? (
                <View style={styles.titleIcon}>
                  <MaterialIcons name="forum" size={18} color={colors.primary} />
                </View>
              ) : null}
              <Text accessibilityRole="header" style={styles.title}>
                Responses
              </Text>
            </View>
            {hasResponses ? (
              <View style={styles.summaryPill}>
                <Text style={styles.summaryText}>
                  {`${jobsWithResponses.length} active ${jobsWithResponses.length === 1 ? "job" : "jobs"} with responses`}
                </Text>
              </View>
            ) : null}
          </View>
          <CaptionText>Review Job Seekers who responded to your active job posts.</CaptionText>
        </View>

        {hasResponses ? (
          <>
            <JobFilterChips
              options={filterOptions}
              selectedId={activeFilterId}
              onSelect={setSelectedJobId}
            />
            <View style={styles.sections}>
              {visibleJobs.map(({ task, responses }) => (
                <JobResponsesSection key={task.id} task={task} responses={responses} />
              ))}
            </View>
          </>
        ) : (
          <ResponsesEmptyState activeJob={activeJob} />
        )}
      </View>
    </ScrollScreen>
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
  sections: {
    gap: spacing.xl,
  },
});
