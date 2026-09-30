import type { MaterialIcons } from "@expo/vector-icons";
import { categories } from "@/data/mock";
import type { CompletedJob, ProfileVisibility } from "@/types/domain";

type IconName = keyof typeof MaterialIcons.glyphMap;

// Who is looking at a profile: the account owner, or anyone else.
export type ProfileViewer = "owner" | "public";

// Which side of the one account the profile is showing — your own profile
// follows your current Job Provider / Job Seeker mode.
export type ProfileSide = "provider" | "seeker";

// Hidden content stays visible to its owner (marked as hidden) and never
// renders for anyone else.
export function isShownTo(viewer: ProfileViewer, visibility: ProfileVisibility) {
  return viewer === "owner" || visibility === "public";
}

// Returns a copy of `jobs` with one job's visibility on `side` changed.
export function withJobVisibility(
  jobs: CompletedJob[],
  jobId: string,
  side: ProfileSide,
  visibility: ProfileVisibility,
): CompletedJob[] {
  return jobs.map((job) => {
    if (job.id !== jobId) return job;
    return side === "provider"
      ? { ...job, providerVisibility: visibility }
      : { ...job, seekerVisibility: visibility };
  });
}

export function jobVisibilityOn(job: CompletedJob, side: ProfileSide): ProfileVisibility {
  return side === "provider" ? job.providerVisibility : job.seekerVisibility;
}

// "4.7", "5.0" — ratings always show one decimal place.
export function formatRating(rating: number) {
  return rating.toFixed(1);
}

export function ratingsReceivedLabel(count: number) {
  return `${count} ${count === 1 ? "rating" : "ratings"} received`;
}

export function completedJobsLabel(count: number) {
  return `${count} completed ${count === 1 ? "job" : "jobs"}`;
}

export function responsesLabel(count: number) {
  return `${count} ${count === 1 ? "Response" : "Responses"}`;
}

// Icons for the app-wide `categories` list, keyed by its ids — an icon per
// existing category, not a second taxonomy.
const CATEGORY_ICONS: Record<string, IconName> = {
  repair: "handyman",
  tutoring: "school",
  delivery: "local-shipping",
  design: "palette",
  photo: "photo-camera",
  admin: "description",
  cleaning: "cleaning-services",
  moving: "inventory",
  electrician: "electrical-services",
  plumbing: "plumbing",
  carpentry: "carpenter",
  painting: "format-paint",
  gardening: "yard",
  cooking: "restaurant",
  babysitting: "child-care",
  elderlyCare: "elderly",
  petCare: "pets",
  eventHelp: "celebration",
  driving: "directions-car",
  errands: "shopping-bag",
  laundry: "local-laundry-service",
  tailoring: "content-cut",
  beautyGrooming: "face",
  fitnessTraining: "fitness-center",
  computerRepair: "computer",
  mobileRepair: "phone-android",
  pestControl: "pest-control",
  catering: "room-service",
  other: "more-horiz",
};

export function categoryIconFor(label: string): IconName {
  const category = categories.find((candidate) => candidate.label === label);
  return (category && CATEGORY_ICONS[category.id]) ?? "work-outline";
}
