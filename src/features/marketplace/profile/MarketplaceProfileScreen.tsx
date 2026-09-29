import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Share, StyleSheet, View } from "react-native";
import type { Edges } from "react-native-safe-area-context";
import { CanHelpWithSheet } from "@/features/marketplace/profile/CanHelpWithSheet";
import { ProfileHero } from "@/features/marketplace/profile/ProfileHero";
import {
  jobVisibilityOn,
  withJobVisibility,
  type ProfileSide,
  type ProfileViewer,
} from "@/features/marketplace/profile/profileHelpers";
import { ProviderProfileView } from "@/features/marketplace/profile/ProviderProfileView";
import { SeekerProfileView } from "@/features/marketplace/profile/SeekerProfileView";
import { VisibilitySheet } from "@/features/marketplace/profile/VisibilitySheet";
import { Screen } from "@/shared/components/ui";
import { BRAND_NAME } from "@/shared/constants/brand";
import { colors, spacing } from "@/theme/tokens";
import type {
  CompletedJob,
  MarketplaceProfile,
  ProfileSection,
  ProfileVisibility,
} from "@/types/domain";

// What the visibility sheet is currently editing.
type VisibilityTarget =
  | { kind: "section"; section: ProfileSection; title: string }
  | { kind: "job"; side: ProfileSide; job: CompletedJob };

/**
 * The finalized MuSkill Aasan Profile — one screen for all four Stitch
 * designs ("My Profile" / "Public Profile" × Provider / Seeker). `viewer`
 * decides Owner vs Public; the in-page switch decides which side of this one
 * account is shown and never changes the app's Job Provider / Job Seeker
 * mode.
 *
 * Owner-only: Edit Profile, the "Owner View" marker, section and item
 * Public/Hidden controls, "Add Skill", and hidden content (marked as
 * hidden). Public viewers see public content only. Visibility and skill
 * edits are local prototype state — nothing is persisted.
 *
 * Renders only page content: inside the Provider shell the global header,
 * drawer and bottom navigation belong to `app/(poster)/_layout.tsx`.
 */
export function MarketplaceProfileScreen({
  profile,
  viewer,
  initialSide = "provider",
  edges,
}: {
  profile: MarketplaceProfile;
  viewer: ProfileViewer;
  initialSide?: ProfileSide;
  edges?: Edges;
}) {
  const router = useRouter();
  const isOwner = viewer === "owner";
  const [side, setSide] = useState<ProfileSide>(initialSide);
  const [sectionVisibility, setSectionVisibility] = useState(profile.sectionVisibility);
  const [jobsAsProvider, setJobsAsProvider] = useState(profile.jobsAsProvider);
  const [jobsAsSeeker, setJobsAsSeeker] = useState(profile.jobsAsSeeker);
  const [canHelpWith, setCanHelpWith] = useState(profile.canHelpWith);
  const [visibilityTarget, setVisibilityTarget] = useState<VisibilityTarget | null>(null);
  const [isVisibilitySheetOpen, setVisibilitySheetOpen] = useState(false);
  const [isSkillsSheetOpen, setSkillsSheetOpen] = useState(false);

  function setJobVisibility(jobSide: ProfileSide, jobId: string, visibility: ProfileVisibility) {
    if (jobSide === "provider") {
      setJobsAsProvider((jobs) => withJobVisibility(jobs, jobId, jobSide, visibility));
    } else {
      setJobsAsSeeker((jobs) => withJobVisibility(jobs, jobId, jobSide, visibility));
    }
  }

  function openVisibilitySheet(target: VisibilityTarget) {
    setVisibilityTarget(target);
    setVisibilitySheetOpen(true);
  }

  function handleSelectVisibility(visibility: ProfileVisibility) {
    if (visibilityTarget?.kind === "section") {
      const { section } = visibilityTarget;
      setSectionVisibility((current) => ({ ...current, [section]: visibility }));
    } else if (visibilityTarget?.kind === "job") {
      setJobVisibility(visibilityTarget.side, visibilityTarget.job.id, visibility);
    }
    setVisibilitySheetOpen(false);
  }

  function toggleSkill(label: string) {
    setCanHelpWith((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
    );
  }

  async function handleShare() {
    const sideLabel = side === "provider" ? "Provider Profile" : "Seeker Profile";
    try {
      await Share.share({
        message: `${profile.name} — ${sideLabel} on ${BRAND_NAME}\n${profile.area}, Dhaka`,
      });
    } catch {
      Alert.alert("Couldn't open sharing", "Please try again.");
    }
  }

  // The sheet shows the target's current value, read from live state rather
  // than the snapshot taken when it opened.
  const visibilitySubject =
    visibilityTarget?.kind === "section"
      ? visibilityTarget.title
      : (visibilityTarget?.job.title ?? "");
  let visibilityValue: ProfileVisibility = "public";
  if (visibilityTarget?.kind === "section") {
    visibilityValue = sectionVisibility[visibilityTarget.section];
  } else if (visibilityTarget?.kind === "job") {
    const jobs = visibilityTarget.side === "provider" ? jobsAsProvider : jobsAsSeeker;
    const job = jobs.find((candidate) => candidate.id === visibilityTarget.job.id);
    if (job) visibilityValue = jobVisibilityOn(job, visibilityTarget.side);
  }

  return (
    <Screen edges={edges} padded={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHero
          name={profile.name}
          area={profile.area}
          bio={side === "provider" ? profile.providerBio : profile.seekerBio}
          viewer={viewer}
          side={side}
          onChangeSide={setSide}
          onShare={handleShare}
          onEditProfile={
            isOwner
              ? () =>
                  router.push({
                    pathname: "/(poster)/coming-soon",
                    params: { title: "Edit Profile" },
                  })
              : undefined
          }
          onBack={isOwner ? undefined : () => router.back()}
        />

        <View style={styles.content}>
          {side === "provider" ? (
            <ProviderProfileView
              viewer={viewer}
              firstName={profile.name.split(" ")[0] ?? profile.name}
              rating={profile.providerRating}
              currentJobPosts={profile.currentJobPosts}
              previousJobs={jobsAsProvider}
              sectionVisibility={sectionVisibility}
              onOpenSectionVisibility={(section, title) =>
                openVisibilitySheet({ kind: "section", section, title })
              }
              onManageJob={(job) => openVisibilitySheet({ kind: "job", side: "provider", job })}
              onMakeJobPublic={(job) => setJobVisibility("provider", job.id, "public")}
            />
          ) : (
            <SeekerProfileView
              viewer={viewer}
              rating={profile.seekerRating}
              canHelpWith={canHelpWith}
              previousWork={jobsAsSeeker}
              sectionVisibility={sectionVisibility}
              onOpenSectionVisibility={(section, title) =>
                openVisibilitySheet({ kind: "section", section, title })
              }
              onManageJob={(job) => openVisibilitySheet({ kind: "job", side: "seeker", job })}
              onMakeJobPublic={(job) => setJobVisibility("seeker", job.id, "public")}
              onAddSkill={() => setSkillsSheetOpen(true)}
            />
          )}
        </View>
      </ScrollView>

      {isOwner ? (
        <>
          <VisibilitySheet
            visible={isVisibilitySheetOpen}
            subject={visibilitySubject}
            value={visibilityValue}
            onSelect={handleSelectVisibility}
            onClose={() => setVisibilitySheetOpen(false)}
          />
          <CanHelpWithSheet
            visible={isSkillsSheetOpen}
            selected={canHelpWith}
            onToggle={toggleSkill}
            onClose={() => setSkillsSheetOpen(false)}
          />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    backgroundColor: colors.appBg,
    flexGrow: 1,
    // Clears the Provider bottom navigation's raised Post Job button.
    paddingBottom: spacing.xxl + spacing.sm,
  },
  content: {
    gap: spacing.lg + spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
});
