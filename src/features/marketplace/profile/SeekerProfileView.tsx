import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  categoryIconFor,
  completedJobsLabel,
  formatRating,
  isShownTo,
  type ProfileViewer,
} from "@/features/marketplace/profile/profileHelpers";
import { ProfileSection, SectionEmptyCard } from "@/features/marketplace/profile/ProfileSection";
import { ReputationCard } from "@/features/marketplace/profile/ReputationCard";
import {
  HiddenNote,
  ItemVisibilityControls,
  SectionVisibilityPill,
} from "@/features/marketplace/profile/VisibilityControls";
import { BRAND_NAME } from "@/shared/constants/brand";
import { colors, fonts, radius, shadows, spacing } from "@/theme/tokens";
import type {
  CompletedJob,
  MarketplaceProfile,
  ProfileSection as ProfileSectionKey,
  ProfileVisibility,
} from "@/types/domain";

const MAX_STARS = 5;
const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

/**
 * The Seeker side of a profile: Seeker Reputation (its own rating, never
 * mixed with the Provider Rating), Can Help With (app-wide categories), and
 * Previous Work & Feedback — stars plus written feedback, attributed only as
 * "Completed through MuSkill Aasan", never to the person who wrote it.
 *
 * Owners see every item, with hidden ones marked and their controls; public
 * viewers get only what's Public and no controls.
 */
export function SeekerProfileView({
  viewer,
  rating,
  canHelpWith,
  previousWork,
  sectionVisibility,
  onOpenSectionVisibility,
  onManageJob,
  onMakeJobPublic,
  onAddSkill,
}: {
  viewer: ProfileViewer;
  rating: MarketplaceProfile["seekerRating"];
  canHelpWith: string[];
  previousWork: CompletedJob[];
  sectionVisibility: {
    seekerReputation: ProfileVisibility;
    previousWork: ProfileVisibility;
  };
  onOpenSectionVisibility: (section: ProfileSectionKey, title: string) => void;
  onManageJob: (job: CompletedJob) => void;
  onMakeJobPublic: (job: CompletedJob) => void;
  onAddSkill: () => void;
}) {
  const isOwner = viewer === "owner";
  const shownWork = previousWork.filter((job) => isShownTo(viewer, job.seekerVisibility));

  return (
    <>
      {isShownTo(viewer, sectionVisibility.seekerReputation) ? (
        <ProfileSection
          icon="stars"
          title="Seeker Reputation"
          hiddenFromPublic={sectionVisibility.seekerReputation === "hidden"}
          action={
            isOwner ? (
              <SectionVisibilityPill
                sectionTitle="Seeker Reputation"
                visibility={sectionVisibility.seekerReputation}
                onPress={() => onOpenSectionVisibility("seekerReputation", "Seeker Reputation")}
              />
            ) : null
          }
        >
          <ReputationCard
            label="Seeker Rating"
            rating={rating.rating}
            ratingCount={rating.ratingCount}
            countLabel={completedJobsLabel(rating.completedJobs)}
            emptyTitle="No Seeker ratings yet"
            note={
              isOwner
                ? "Seeker reviews combine star ratings with written neighbor feedback."
                : "Reviews combine star ratings and written feedback from local Job Providers."
            }
          />
        </ProfileSection>
      ) : null}

      <ProfileSection
        icon="handyman"
        title="Can Help With"
        action={
          isOwner ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add Skill"
              hitSlop={HIT_SLOP}
              onPress={onAddSkill}
              style={styles.addSkill}
            >
              <MaterialIcons name="add" size={16} color={colors.primary} />
              <Text style={styles.addSkillText}>Add Skill</Text>
            </Pressable>
          ) : null
        }
      >
        {canHelpWith.length > 0 ? (
          <View style={styles.chips}>
            {canHelpWith.map((label) =>
              isOwner ? (
                <View key={label} style={styles.ownerChip}>
                  <MaterialIcons name={categoryIconFor(label)} size={16} color={colors.primary} />
                  <Text style={styles.chipText}>{label}</Text>
                </View>
              ) : (
                <View key={label} style={styles.publicChip}>
                  <Text style={styles.chipText}>{label}</Text>
                </View>
              ),
            )}
          </View>
        ) : (
          <SectionEmptyCard
            message={
              isOwner ? "Add the kinds of jobs you can help with." : "No categories added yet."
            }
          />
        )}
      </ProfileSection>

      {isShownTo(viewer, sectionVisibility.previousWork) ? (
        <ProfileSection
          icon="history"
          title="Previous Work & Feedback"
          hiddenFromPublic={sectionVisibility.previousWork === "hidden"}
          action={
            isOwner ? (
              <SectionVisibilityPill
                sectionTitle="Previous Work & Feedback"
                visibility={sectionVisibility.previousWork}
                onPress={() => onOpenSectionVisibility("previousWork", "Previous Work & Feedback")}
              />
            ) : null
          }
        >
          {shownWork.length > 0 ? (
            shownWork.map((job) => (
              <PreviousWorkCard
                key={job.id}
                job={job}
                viewer={viewer}
                averageLabel={`${formatRating(rating.rating)} Seeker average`}
                onManage={() => onManageJob(job)}
                onMakePublic={() => onMakeJobPublic(job)}
              />
            ))
          ) : (
            <SectionEmptyCard message="No completed work to show yet." />
          )}
        </ProfileSection>
      ) : null}
    </>
  );
}

function PreviousWorkCard({
  job,
  viewer,
  averageLabel,
  onManage,
  onMakePublic,
}: {
  job: CompletedJob;
  viewer: ProfileViewer;
  averageLabel: string;
  onManage: () => void;
  onMakePublic: () => void;
}) {
  const hidden = job.seekerVisibility === "hidden";
  const { rating, comment } = job.seekerFeedback;

  return (
    <View style={[styles.card, hidden && styles.cardHidden]}>
      <View style={styles.topRow}>
        <View
          accessible
          accessibilityLabel={`${formatRating(rating)} out of ${MAX_STARS} stars`}
          style={styles.starsGroup}
        >
          <View style={styles.stars}>
            {Array.from({ length: MAX_STARS }, (_, index) => (
              <MaterialIcons
                key={index}
                name={index < rating ? "star" : "star-border"}
                size={16}
                color={hidden ? colors.muted : colors.secondary}
              />
            ))}
          </View>
          <Text style={[styles.ratingValue, hidden && styles.ratingValueHidden]}>
            {formatRating(rating)}
          </Text>
        </View>
        {viewer === "owner" ? (
          <ItemVisibilityControls
            itemTitle={job.title}
            visibility={job.seekerVisibility}
            onManage={onManage}
            onMakePublic={onMakePublic}
          />
        ) : null}
      </View>

      <View style={styles.titleBlock}>
        <Text style={[styles.jobTitle, hidden && styles.titleHidden]}>{job.title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialIcons
              name="pin-drop"
              size={14}
              color={hidden ? colors.muted : colors.primary}
            />
            <Text style={styles.metaText}>{job.area}</Text>
          </View>
          <Text style={styles.metaText}>•</Text>
          <Text style={styles.dateText}>Completed {job.completedOn}</Text>
        </View>
      </View>

      <View style={[styles.feedbackBox, hidden && styles.feedbackBoxHidden]}>
        <Text style={styles.feedbackText}>&ldquo;{comment}&rdquo;</Text>
      </View>

      <View style={styles.completedRow}>
        <MaterialIcons name="check-circle" size={14} color={colors.primary} />
        <Text style={styles.completedText}>Completed through {BRAND_NAME}</Text>
      </View>

      {viewer === "owner" && hidden ? (
        <HiddenNote>
          Hidden from public view. Its rating still counts toward your overall{" "}
          <Text style={styles.noteStrong}>{averageLabel}</Text>.
        </HiddenNote>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  addSkill: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
  },
  addSkillText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingTop: spacing.xxs,
  },
  ownerChip: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - spacing.xxs,
  },
  publicChip: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - spacing.xxs,
  },
  chipText: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    gap: spacing.sm + spacing.xxs,
    padding: spacing.lg,
    ...shadows.subtle,
  },
  cardHidden: {
    backgroundColor: colors.surface,
    elevation: 0,
    shadowOpacity: 0,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  starsGroup: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    gap: spacing.xs + spacing.xxs,
  },
  stars: {
    flexDirection: "row",
  },
  ratingValue: {
    color: colors.secondaryDark,
    fontFamily: fonts.extraBold,
    fontSize: 14,
  },
  ratingValueHidden: {
    color: colors.muted,
  },
  titleBlock: {
    gap: spacing.xxs,
  },
  jobTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  titleHidden: {
    color: colors.muted,
    textDecorationLine: "line-through",
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  metaItem: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: spacing.xs,
  },
  metaText: {
    color: colors.muted,
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  dateText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  feedbackBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  feedbackBoxHidden: {
    backgroundColor: colors.card,
  },
  feedbackText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
  },
  completedRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  completedText: {
    color: colors.muted,
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  noteStrong: {
    color: colors.text,
    fontFamily: fonts.bold,
  },
});
