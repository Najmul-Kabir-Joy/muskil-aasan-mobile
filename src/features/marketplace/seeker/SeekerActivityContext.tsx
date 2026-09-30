import { createContext, useContext, useState, type ReactNode } from "react";
import {
  acceptJobRequest,
  addResponse,
  applicationForJob,
  isJobSaved,
  toggleSavedJob,
} from "@/features/marketplace/seeker/seekerActivity";
import { seekerApplications, seekerFeedJobs } from "@/data/mock";
import type { SeekerApplication, Task } from "@/types/domain";

type SeekerActivity = {
  savedJobs: Task[];
  applications: SeekerApplication[];
  isSaved: (jobId: string) => boolean;
  toggleSaved: (job: Task) => void;
  applicationFor: (jobId: string) => SeekerApplication | undefined;
  respond: (job: Task, message: string) => void;
  acceptRequest: (applicationId: string) => void;
};

const SeekerActivityContext = createContext<SeekerActivity | null>(null);

// Two jobs start saved so Saved has something to show on first visit.
const INITIAL_SAVED_JOBS = seekerFeedJobs.filter((job) => job.id === "c2" || job.id === "c6");

/**
 * The Job Seeker's prototype state shared across the Seeker tabs: which Jobs
 * are saved, and the Applications (their own Responses). Save on Home shows
 * up in Saved; a Response sent from Home or Saved shows up in Applications.
 *
 * Owned by `app/(worker)/_layout.tsx`, so it lasts while the Seeker shell is
 * mounted and resets when the app switches mode — local prototype state,
 * nothing is persisted or sent anywhere. A plain context rather than a
 * store library: three screens share two lists.
 */
export function SeekerActivityProvider({
  children,
  initialSavedJobs = INITIAL_SAVED_JOBS,
  initialApplications = seekerApplications,
}: {
  children: ReactNode;
  initialSavedJobs?: Task[];
  initialApplications?: SeekerApplication[];
}) {
  const [savedJobs, setSavedJobs] = useState(initialSavedJobs);
  const [applications, setApplications] = useState(initialApplications);

  const value: SeekerActivity = {
    savedJobs,
    applications,
    isSaved: (jobId) => isJobSaved(savedJobs, jobId),
    toggleSaved: (job) => setSavedJobs((current) => toggleSavedJob(current, job)),
    applicationFor: (jobId) => applicationForJob(applications, jobId),
    respond: (job, message) => setApplications((current) => addResponse(current, job, message)),
    acceptRequest: (applicationId) =>
      setApplications((current) => acceptJobRequest(current, applicationId)),
  };

  return <SeekerActivityContext.Provider value={value}>{children}</SeekerActivityContext.Provider>;
}

export function useSeekerActivity(): SeekerActivity {
  const activity = useContext(SeekerActivityContext);
  if (!activity) {
    throw new Error("useSeekerActivity must be used inside SeekerActivityProvider");
  }
  return activity;
}
