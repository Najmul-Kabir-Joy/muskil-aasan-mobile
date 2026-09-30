import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { firstNameOf, formatRating } from "@/features/marketplace/profile/profileHelpers";
import { APPLICATION_STAGES } from "@/features/marketplace/seeker/applicationStage";
import { BudgetTag, JobPlaceAndTime, PostedBy } from "@/features/marketplace/seeker/SeekerJobCard";
import { ActionButton } from "@/shared/components/ui";
import { colors, fonts, radius, shadows, spacing } from "@/theme/tokens";
import type { CompletedJob, SeekerApplication, SeekerApplicationStage } from "@/types/domain";

/**
 * One Job the Job Seeker responded to, shaped by where it stands:
 * - a job request waiting for their answer: the one action, Accept (the
 *   confirmed step — there's no decline, since declining isn't defined);
 * - an accepted job request: just that fact — nothing is implied about
 *   contact, payment or completion after accepting;
 * - a Response sent: their own private message.
 */
export function ApplicationCard({
  application,
  onAccept,
}: {
  application: SeekerApplication;
  onAccept: () => void;
}) {
  const { job, stage } = application;
  const providerFirstName = job.postedBy ? firstNameOf(job.postedBy.name) : "The Job Provider";

  return (
    <View style={[styles.card, stage === "jobRequest" && styles.cardHighlighted]}>
      <View style={styles.topRow}>
        <StagePill stage={stage} />
        <BudgetTag budget={job.budget} />
      </View>
      <Text numberOfLines={3} style={styles.title}>
        {job.title}
      </Text>
      <JobPlaceAndTime job={job} />
      <PostedBy job={job} />

      {stage === "jobRequest" ? (
        <View style={styles.requestBlock}>
          <Text style={styles.requestText}>
            {providerFirstName} chose you from the responses and sent you a job request. Accept it
            to take the job.
          </Text>
          <ActionButton
            label="Accept job request"
            accessibilityLabel={`Accept job request for ${job.title}`}
            onPress={onAccept}
          />
        </View>
      ) : null}

      {stage === "accepted" ? (
        <View style={styles.callout}>
          <MaterialIcons name="check-circle" size={16} color={colors.tertiaryDark} />
          <Text style={styles.calloutText}>
            You accepted {providerFirstName}&apos;s job request.
          </Text>
        </View>
      ) : null}

      {stage === "responseSent" ? (
        <View style={styles.responseBlock}>
          <Text style={styles.responseLabel}>Your response</Text>
          <Text numberOfLines={4} style={styles.responseText}>
            {application.message}
          </Text>
          <View style={styles.privateRow}>
            <MaterialIcons name="lock-outline" size={13} color={colors.muted} />
            <Text style={styles.privateText}>
              Only {providerFirstName} can see this · Sent {application.sentAgo.toLowerCase()}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

/**
 * Work the Job Seeker completed, with the Seeker Rating they received
 * (stars plus written feedback, shown without naming who wrote it — the
 * same rule as their profile). Applications is private to them, so this
 * shows every job, noting any hidden from their public profile.
 */
export function CompletedWorkCard({ job }: { job: CompletedJob }) {
  const { rating, comment } = job.seekerFeedback;
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.stagePill, { backgroundColor: colors.primarySoft }]}>
          <MaterialIcons name="task-alt" size={13} color={colors.primaryDark} />
          <Text style={[styles.stageText, { color: colors.primaryDark }]}>
            Completed {job.completedOn}
          </Text>
        </View>
        {job.seekerVisibility === "hidden" ? (
          <View style={styles.hiddenTag}>
            <MaterialIcons name="visibility-off" size={13} color={colors.muted} />
            <Text style={styles.hiddenText}>Hidden on your profile</Text>
          </View>
        ) : null}
      </View>
      <Text numberOfLines={3} style={styles.title}>
        {job.title}
      </Text>
      <View style={styles.placeRow}>
        <MaterialIcons name="location-on" size={15} color={colors.primary} />
        <Text style={styles.placeText}>{job.area}</Text>
      </View>
      <View style={styles.feedbackBlock}>
        <View
          accessible
          accessibilityLabel={`Rating you received: ${formatRating(rating)} out of 5`}
          style={styles.ratingRow}
        >
          <Text style={styles.responseLabel}>Rating you received</Text>
          <View style={styles.stars}>
            {Array.from({ length: 5 }, (_, index) => (
              <MaterialIcons
                key={index}
                name={index < rating ? "star" : "star-border"}
                size={15}
                color={colors.secondary}
              />
            ))}
            <Text style={styles.ratingValue}>{formatRating(rating)}</Text>
          </View>
        </View>
        <Text style={styles.feedbackText}>“{comment}”</Text>
      </View>
    </View>
  );
}

function StagePill({ stage }: { stage: SeekerApplicationStage }) {
  const { label, icon, background, text } = APPLICATION_STAGES[stage];
  return (
    <View style={[styles.stagePill, { backgroundColor: background }]}>
      <MaterialIcons name={icon} size={13} color={text} />
      <Text numberOfLines={1} style={[styles.stageText, { color: text }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm + spacing.xxs,
    padding: spacing.lg,
    ...shadows.subtle,
  },
  cardHighlighted: {
    borderColor: colors.secondaryLight,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  stagePill: {
    alignItems: "center",
    borderRadius: radius.pill,
    flexDirection: "row",
    flexShrink: 1,
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + spacing.xxs,
    paddingVertical: spacing.xs,
  },
  stageText: {
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  requestBlock: {
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.sm,
    gap: spacing.md,
    padding: spacing.md,
  },
  requestText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
  },
  callout: {
    alignItems: "center",
    backgroundColor: colors.tertiarySoft,
    borderRadius: radius.sm,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  calloutText: {
    color: colors.tertiaryDark,
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  responseBlock: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    gap: spacing.xs,
    padding: spacing.md,
  },
  responseLabel: {
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  responseText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
  },
  privateRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  privateText: {
    color: colors.muted,
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  placeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  placeText: {
    color: colors.text,
    flexShrink: 1,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  feedbackBlock: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    gap: spacing.xs,
    padding: spacing.md,
  },
  ratingRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  stars: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
  },
  ratingValue: {
    color: colors.secondaryDark,
    fontFamily: fonts.extraBold,
    fontSize: 13,
    marginLeft: spacing.xs,
  },
  feedbackText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 19,
  },
  hiddenTag: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  hiddenText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
});
