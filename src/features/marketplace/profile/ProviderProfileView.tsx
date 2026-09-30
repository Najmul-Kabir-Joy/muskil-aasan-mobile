import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  formatRating,
  isShownTo,
  ratingsReceivedLabel,
  responsesLabel,
  type ProfileViewer,
} from "@/features/marketplace/profile/profileHelpers";
import { ProfileSection, SectionEmptyCard } from "@/features/marketplace/profile/ProfileSection";
import { ReputationCard } from "@/features/marketplace/profile/ReputationCard";
import {
  HiddenNote,
  ItemVisibilityControls,
  SectionVisibilityPill,
} from "@/features/marketplace/profile/VisibilityControls";
import { colors, fonts, radius, shadows, spacing } from "@/theme/tokens";
import type {
  CompletedJob,
  CurrentJobPost,
  ProfileSection as ProfileSectionKey,
  ProfileVisibility,
  RatingSummary,
} from "@/types/domain";

// Brings the header's text links ("Manage >", "Add Skill") to about 44pt tall.
const HIT_SLOP = { top: 14, bottom: 14, left: 8, right: 8 };

/**
 * The Provider side of a profile: Provider Reputation (stars only), Current
 * Job Posts, and Previous Job Posts. Previous jobs show only the star rating
 * the Provider received — never written feedback, which Provider ratings
 * don't have in the MVP.
 *
 * Owners see every item, with hidden ones marked and their controls; public
 * viewers get only what's Public and no controls.
 */
export function ProviderProfileView({
  viewer,
  firstName,
  rating,
  currentJobPosts,
  previousJobs,
  sectionVisibility,
  onOpenSectionVisibility,
  onManageJob,
  onMakeJobPublic,
}: {
  viewer: ProfileViewer;
  firstName: string;
  rating: RatingSummary;
  currentJobPosts: CurrentJobPost[];
  previousJobs: CompletedJob[];
  sectionVisibility: {
    providerReputation: ProfileVisibility;
    previousJobPosts: ProfileVisibility;
  };
  onOpenSectionVisibility: (section: ProfileSectionKey, title: string) => void;
  onManageJob: (job: CompletedJob) => void;
  onMakeJobPublic: (job: CompletedJob) => void;
}) {
  const router = useRouter();
  const isOwner = viewer === "owner";
  const shownPreviousJobs = previousJobs.filter((job) => isShownTo(viewer, job.providerVisibility));

  function viewAllJobPosts() {
    if (isOwner) {
      router.push("/(poster)/tasks");
    } else {
      router.push({
        pathname: "/(poster)/coming-soon",
        params: { title: `${firstName}'s Job Posts` },
      });
    }
  }

  return (
    <>
      {isShownTo(viewer, sectionVisibility.providerReputation) ? (
        <ProfileSection
          icon="stars"
          title="Provider Reputation"
          hiddenFromPublic={sectionVisibility.providerReputation === "hidden"}
          action={
            isOwner ? (
              <SectionVisibilityPill
                sectionTitle="Provider Reputation"
                visibility={sectionVisibility.providerReputation}
                onPress={() => onOpenSectionVisibility("providerReputation", "Provider Reputation")}
              />
            ) : null
          }
        >
          <ReputationCard
            label="Provider Rating"
            rating={rating.rating}
            ratingCount={rating.ratingCount}
            countLabel={ratingsReceivedLabel(rating.ratingCount)}
            emptyTitle="No Provider ratings yet"
            note={
              isOwner
                ? `Calculated from all ${rating.ratingCount} rated jobs • Star-only rating`
                : "Star-only rating calculated across all completed jobs."
            }
          />
        </ProfileSection>
      ) : null}

      <ProfileSection
        icon="campaign"
        title="Current Job Posts"
        badge={currentJobPosts.length > 0 ? `${currentJobPosts.length} active` : undefined}
        action={
          isOwner ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Manage job posts"
              hitSlop={HIT_SLOP}
              onPress={() => router.push("/(poster)/tasks")}
            >
              <Text style={styles.headerLink}>Manage &gt;</Text>
            </Pressable>
          ) : null
        }
      >
        {currentJobPosts.length > 0 ? (
          <>
            {currentJobPosts.map((post) => (
              <CurrentJobPostCard
                key={post.task.id}
                post={post}
                viewer={viewer}
                onViewResponses={() => router.push("/(poster)/responses")}
              />
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View all job posts"
              hitSlop={HIT_SLOP}
              onPress={viewAllJobPosts}
              style={styles.viewAll}
            >
              <Text style={styles.viewAllText}>View all job posts</Text>
              <MaterialIcons name="arrow-forward" size={16} color={colors.primary} />
            </Pressable>
          </>
        ) : (
          <SectionEmptyCard
            message={
              isOwner
                ? "Jobs you post show here while they're open for responses."
                : "No current job posts."
            }
          />
        )}
      </ProfileSection>

      {isShownTo(viewer, sectionVisibility.previousJobPosts) ? (
        <ProfileSection
          icon="history"
          title="Previous Job Posts"
          titleSuffix={
            shownPreviousJobs.length === 0
              ? undefined
              : isOwner
                ? `(${shownPreviousJobs.length} total)`
                : `(${shownPreviousJobs.length} public ${shownPreviousJobs.length === 1 ? "job" : "jobs"})`
          }
          hiddenFromPublic={sectionVisibility.previousJobPosts === "hidden"}
          action={
            isOwner ? (
              <SectionVisibilityPill
                sectionTitle="Previous Job Posts"
                visibility={sectionVisibility.previousJobPosts}
                onPress={() => onOpenSectionVisibility("previousJobPosts", "Previous Job Posts")}
              />
            ) : null
          }
        >
          {shownPreviousJobs.length > 0 ? (
            shownPreviousJobs.map((job) => (
              <PreviousJobPostCard
                key={job.id}
                job={job}
                viewer={viewer}
                averageLabel={`${formatRating(rating.rating)} Provider average`}
                onManage={() => onManageJob(job)}
                onMakePublic={() => onMakeJobPublic(job)}
              />
            ))
          ) : (
            <SectionEmptyCard message="No previous job posts yet." />
          )}
        </ProfileSection>
      ) : null}
    </>
  );
}

function CurrentJobPostCard({
  post,
  viewer,
  onViewResponses,
}: {
  post: CurrentJobPost;
  viewer: ProfileViewer;
  onViewResponses: () => void;
}) {
  const { task, responseCount } = post;

  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <View style={styles.cardTitleColumn}>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Active • {responsesLabel(responseCount)}</Text>
          </View>
          <Text numberOfLines={2} style={styles.jobTitle}>
            {task.title}
          </Text>
        </View>
        <View style={styles.budgetChip}>
          <Text style={styles.budgetText}>{task.budget}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MaterialIcons name="pin-drop" size={15} color={colors.primary} />
          <Text style={styles.metaText}>{task.area}</Text>
        </View>
        {task.postedAgo ? (
          <>
            <Text style={styles.metaText}>•</Text>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={15} color={colors.muted} />
              <Text style={styles.metaText}>Posted {task.postedAgo}</Text>
            </View>
          </>
        ) : null}
      </View>

      {viewer === "owner" ? (
        <View style={styles.cardFooter}>
          <Text style={styles.metaText}>Responses received: {responseCount}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View responses to ${task.title}`}
            hitSlop={HIT_SLOP}
            onPress={onViewResponses}
            style={styles.viewResponsesButton}
          >
            <Text style={styles.viewResponsesText}>View Responses</Text>
            <MaterialIcons name="arrow-forward" size={14} color={colors.card} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.cardFooter}>
          <View style={styles.metaItem}>
            <MaterialIcons name="local-offer" size={15} color={colors.primary} />
            <Text style={styles.metaText}>{responsesLabel(responseCount)} received</Text>
          </View>
          <Text style={styles.openText}>Open for responses</Text>
        </View>
      )}
    </View>
  );
}

function PreviousJobPostCard({
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
  const hidden = job.providerVisibility === "hidden";

  return (
    <View style={[styles.card, hidden && styles.cardHidden]}>
      <View style={styles.previousTopRow}>
        <View
          accessible
          accessibilityLabel={`${formatRating(job.providerRating)} out of 5 stars received`}
          style={styles.ratingGroup}
        >
          <MaterialIcons name="star" size={18} color={hidden ? colors.muted : colors.secondary} />
          <Text style={[styles.ratingValue, hidden && styles.ratingValueHidden]}>
            {formatRating(job.providerRating)}
          </Text>
          <Text style={styles.ratingLabel}>Star Rating received</Text>
        </View>
        {viewer === "owner" ? (
          <ItemVisibilityControls
            itemTitle={job.title}
            visibility={job.providerVisibility}
            onManage={onManage}
            onMakePublic={onMakePublic}
          />
        ) : null}
      </View>
      <Text style={[styles.jobTitle, hidden && styles.titleHidden]}>{job.title}</Text>
      <View style={styles.previousMetaRow}>
        <View style={styles.metaItem}>
          <MaterialIcons name="pin-drop" size={14} color={hidden ? colors.muted : colors.primary} />
          <Text style={styles.metaText}>{job.area}</Text>
        </View>
        <Text style={styles.dateText}>Completed {job.completedOn}</Text>
      </View>
      {viewer === "owner" && hidden ? (
        <HiddenNote>
          Hidden items are masked from other users, but their ratings still contribute to your{" "}
          <Text style={styles.noteStrong}>{averageLabel}</Text>.
        </HiddenNote>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerLink: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    gap: spacing.sm,
    padding: spacing.lg,
    ...shadows.subtle,
  },
  cardHidden: {
    backgroundColor: colors.surface,
    elevation: 0,
    shadowOpacity: 0,
  },
  cardTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  cardTitleColumn: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  statusPill: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  statusDot: {
    backgroundColor: colors.secondary,
    borderRadius: radius.pill,
    height: 6,
    width: 6,
  },
  statusText: {
    color: colors.secondaryDark,
    fontFamily: fonts.semiBold,
    fontSize: 11,
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
  budgetChip: {
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.sm,
    flexShrink: 0,
    paddingHorizontal: spacing.sm + spacing.xxs,
    paddingVertical: spacing.xs,
  },
  budgetText: {
    color: colors.secondaryDark,
    fontFamily: fonts.extraBold,
    fontSize: 20,
    lineHeight: 26,
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
  cardFooter: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
    paddingTop: spacing.xs,
  },
  viewResponsesButton: {
    alignItems: "center",
    backgroundColor: colors.primaryDark,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs,
    height: 36,
    paddingHorizontal: spacing.md,
  },
  viewResponsesText: {
    color: colors.card,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  openText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  viewAll: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 32,
  },
  viewAllText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  previousTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  ratingGroup: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    flexWrap: "wrap",
    gap: spacing.xs + spacing.xxs,
  },
  ratingValue: {
    color: colors.secondaryDark,
    fontFamily: fonts.extraBold,
    fontSize: 14,
  },
  ratingValueHidden: {
    color: colors.muted,
  },
  ratingLabel: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  previousMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  dateText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  noteStrong: {
    color: colors.text,
    fontFamily: fonts.bold,
  },
});
