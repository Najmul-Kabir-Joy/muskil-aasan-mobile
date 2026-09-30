import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import type { Edges } from "react-native-safe-area-context";
import { useSeekerActivity } from "@/features/marketplace/seeker/SeekerActivityContext";
import { SeekerJobList, SeekerJobSheet } from "@/features/marketplace/seeker/SeekerJobList";
import { SEEKER_HOME_ROUTE } from "@/features/marketplace/seeker/seekerRoutes";
import {
  SeekerEmptyState,
  SeekerPageHeader,
} from "@/features/marketplace/seeker/SeekerScreenParts";
import { ActionButton, ScrollScreen } from "@/shared/components/ui";
import { spacing } from "@/theme/tokens";
import type { Task } from "@/types/domain";

/**
 * Saved — Jobs the Job Seeker bookmarked to respond to later, most recently
 * saved first. Same cards as Home (so Respond works here too); tapping the
 * filled bookmark removes a Job from the list.
 *
 * Renders only page content; the Seeker shell owns the header and nav.
 */
export function SeekerSavedScreen({ edges }: { edges?: Edges } = {}) {
  const router = useRouter();
  const { savedJobs } = useSeekerActivity();
  const count = savedJobs.length;
  const [openJob, setOpenJob] = useState<Task | null>(null);

  return (
    <>
      <ScrollScreen edges={edges}>
        <View style={styles.page}>
          <SeekerPageHeader
            icon="bookmark"
            title="Saved"
            count={count > 0 ? `${count} saved ${count === 1 ? "job" : "jobs"}` : undefined}
            caption="Jobs you bookmarked to respond to later."
          />

          {count > 0 ? (
            <SeekerJobList jobs={savedJobs} onOpenJob={setOpenJob} />
          ) : (
            <SeekerEmptyState
              icon="bookmark-border"
              title="No saved jobs yet"
              body="Tap the bookmark on a job to keep it here until you're ready to respond."
              action={
                <ActionButton label="Browse jobs" onPress={() => router.push(SEEKER_HOME_ROUTE)} />
              }
            />
          )}
        </View>
      </ScrollScreen>
      <SeekerJobSheet job={openJob} onClose={() => setOpenJob(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: spacing.lg,
  },
});
