import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { JobResponseSheet } from "@/features/marketplace/seeker/JobResponseSheet";
import { useSeekerActivity } from "@/features/marketplace/seeker/SeekerActivityContext";
import { SeekerJobCard } from "@/features/marketplace/seeker/SeekerJobCard";
import { SEEKER_APPLICATIONS_ROUTE } from "@/features/marketplace/seeker/seekerRoutes";
import { spacing } from "@/theme/tokens";
import type { Task } from "@/types/domain";

/**
 * A list of Seeker Job cards wired to the shared Seeker state — Save, jump
 * to an existing Application — so Home and Saved behave identically.
 * Opening a Job (its body or Respond) calls `onOpenJob`; the screen shows
 * `SeekerJobSheet` for it, outside its ScrollView (see `JobResponseSheet`).
 */
export function SeekerJobList({
  jobs,
  onOpenJob,
}: {
  jobs: Task[];
  onOpenJob: (job: Task) => void;
}) {
  const router = useRouter();
  const { isSaved, toggleSaved, applicationFor } = useSeekerActivity();

  return (
    <View style={styles.list}>
      {jobs.map((job) => (
        <SeekerJobCard
          key={job.id}
          job={job}
          saved={isSaved(job.id)}
          stage={applicationFor(job.id)?.stage}
          onOpen={() => onOpenJob(job)}
          onToggleSave={() => toggleSaved(job)}
          onRespond={() => onOpenJob(job)}
          onViewApplication={() => router.push(SEEKER_APPLICATIONS_ROUTE)}
        />
      ))}
    </View>
  );
}

// The open Job's sheet, wired to the shared Seeker state. Keyed by job so a
// draft never carries over to the next Job.
export function SeekerJobSheet({ job, onClose }: { job: Task | null; onClose: () => void }) {
  const router = useRouter();
  const { applicationFor, respond } = useSeekerActivity();

  if (!job) return null;

  return (
    <JobResponseSheet
      key={job.id}
      job={job}
      application={applicationFor(job.id)}
      onSend={(message) => respond(job, message)}
      onViewApplications={() => {
        onClose();
        router.push(SEEKER_APPLICATIONS_ROUTE);
      }}
      onClose={onClose}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
});
