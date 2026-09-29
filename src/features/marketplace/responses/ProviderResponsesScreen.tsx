import { useState } from "react";
import { StyleSheet, View } from "react-native";
import type { Edges } from "react-native-safe-area-context";
import { JobResponsesSection } from "@/features/marketplace/responses/JobResponsesSection";
import { ResponsesEmptyState } from "@/features/marketplace/responses/ResponsesEmptyState";
import { AppHeader, ScrollScreen, SelectableChip } from "@/shared/components/ui";
import { getActiveJob, getJobsWithResponses } from "@/data/mock";
import { spacing } from "@/theme/tokens";
import type { JobWithResponses, Task } from "@/types/domain";

const ALL_JOBS_FILTER = "all";

/**
 * The Job Provider Responses List — "Which of my jobs received responses,
 * and who responded?" Renders either the canonical grouped-by-job list or
 * the empty state from the same `jobsWithResponses` data, per
 * docs/engineering/domain-and-terminology.md's guidance to derive state
 * from data rather than duplicate screens/routes.
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
  const visibleJobs =
    selectedJobId === ALL_JOBS_FILTER
      ? jobsWithResponses
      : jobsWithResponses.filter(({ task }) => task.id === selectedJobId);

  return (
    <ScrollScreen edges={edges}>
      <AppHeader
        title="Responses"
        subtitle="Review who responded to your jobs and choose someone to help."
      />

      {jobsWithResponses.length === 0 ? (
        <ResponsesEmptyState activeJob={activeJob} />
      ) : (
        <>
          <View style={styles.filterRow}>
            <SelectableChip
              label="All Jobs"
              selected={selectedJobId === ALL_JOBS_FILTER}
              onPress={() => setSelectedJobId(ALL_JOBS_FILTER)}
            />
            {jobsWithResponses.map(({ task }) => (
              <SelectableChip
                key={task.id}
                label={task.title}
                selected={selectedJobId === task.id}
                onPress={() => setSelectedJobId(task.id)}
              />
            ))}
          </View>

          <View style={styles.sections}>
            {visibleJobs.map(({ task, responses }) => (
              <JobResponsesSection key={task.id} task={task} responses={responses} />
            ))}
          </View>
        </>
      )}
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  sections: {
    gap: spacing.xl,
  },
});
