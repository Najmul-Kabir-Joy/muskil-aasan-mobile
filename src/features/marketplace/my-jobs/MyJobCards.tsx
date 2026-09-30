import { MaterialIcons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SeekerAvatar } from "@/features/marketplace/responses/SeekerAvatar";
import { ratingCountLabel } from "@/features/marketplace/responses/ratingCountLabel";
import { colors, fonts, radius, shadows, spacing } from "@/theme/tokens";
import type { CompletedJob, CurrentJobPost, Task, WorkerProfile } from "@/types/domain";

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

/**
 * An open job — still collecting Responses. Responses themselves are
 * private and live on the Responses tab; the card shows only how many.
 */
export function OpenJobCard({
  post,
  onViewResponses,
}: {
  post: CurrentJobPost;
  onViewResponses: () => void;
}) {
  const { task, responseCount } = post;

  return (
    <View style={styles.card}>
      <CardTopRow
        pill={<StatusPill icon="campaign" label="Open for responses" tone="open" />}
        trailing={<BudgetChip budget={task.budget} />}
      />
      <Text numberOfLines={2} style={styles.title}>
        {task.title}
      </Text>
      <JobMeta task={task} />
      <Text numberOfLines={2} style={styles.description}>
        {task.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <MaterialIcons name="forum" size={15} color={colors.primary} />
          <Text style={styles.footerText}>
            {responseCount === 0
              ? "No responses yet"
              : `${responseCount} ${responseCount === 1 ? "response" : "responses"}`}
          </Text>
        </View>
        {responseCount > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View responses to ${task.title}`}
            hitSlop={HIT_SLOP}
            onPress={onViewResponses}
            style={styles.primaryAction}
          >
            <Text style={styles.primaryActionText}>View Responses</Text>
            <MaterialIcons name="arrow-forward" size={14} color={colors.card} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/**
 * A job a Job Seeker has accepted. Deliberately read-only: how a job is
 * marked complete, changed or cancelled isn't defined yet, so there's no
 * such action here — only who is doing it.
 */
export function InProgressJobCard({
  task,
  seekers,
  onViewSeeker,
}: {
  task: Task;
  seekers: WorkerProfile[];
  onViewSeeker: (seeker: WorkerProfile) => void;
}) {
  return (
    <View style={styles.card}>
      <CardTopRow
        pill={<StatusPill icon="autorenew" label="In progress" tone="active" />}
        trailing={<BudgetChip budget={task.budget} />}
      />
      <Text numberOfLines={2} style={styles.title}>
        {task.title}
      </Text>
      <JobMeta task={task} />
      {seekers.map((seeker) => (
        <PersonRow
          key={seeker.id}
          label="Working with"
          seeker={seeker}
          detail={
            <View style={styles.ratingRow}>
              <MaterialIcons name="star" size={13} color={colors.secondary} />
              <Text style={styles.personDetail}>
                {seeker.rating} Seeker Rating ({ratingCountLabel(seeker.ratingCount)})
              </Text>
            </View>
          }
          onViewProfile={() => onViewSeeker(seeker)}
        />
      ))}
      <View style={styles.footerInfo}>
        <MaterialIcons name="check-circle" size={15} color={colors.primary} />
        <Text style={styles.footerText}>
          {seekers.length === 1
            ? `${firstName(seekers[0]?.name ?? "")} accepted your job request.`
            : "Your job request was accepted."}
        </Text>
      </View>
    </View>
  );
}

/**
 * A completed job: who did it and the star rating you received as the
 * Provider (stars only). My Jobs is private to you, so this shows every
 * job, noting any you've hidden from your public profile.
 */
export function CompletedJobCard({
  job,
  seeker,
  onViewSeeker,
}: {
  job: CompletedJob;
  seeker: WorkerProfile;
  onViewSeeker: () => void;
}) {
  return (
    <View style={styles.card}>
      <CardTopRow
        pill={<StatusPill icon="task-alt" label={`Completed ${job.completedOn}`} tone="done" />}
        trailing={
          job.providerVisibility === "hidden" ? (
            <View style={styles.hiddenTag}>
              <MaterialIcons name="visibility-off" size={13} color={colors.muted} />
              <Text style={styles.hiddenTagText}>Hidden on your profile</Text>
            </View>
          ) : null
        }
      />
      <Text numberOfLines={2} style={styles.title}>
        {job.title}
      </Text>
      <View style={styles.metaRow}>
        <MaterialIcons name="location-on" size={15} color={colors.primary} />
        <Text style={styles.metaText}>{job.area}</Text>
      </View>
      <PersonRow label="Done by" seeker={seeker} onViewProfile={onViewSeeker} />
      <View
        accessible
        accessibilityLabel={`Rating you received: ${job.providerRating.toFixed(1)} out of 5`}
        style={styles.receivedRow}
      >
        <Text style={styles.footerText}>Rating you received</Text>
        <View style={styles.ratingRow}>
          {Array.from({ length: 5 }, (_, index) => (
            <MaterialIcons
              key={index}
              name={index < job.providerRating ? "star" : "star-border"}
              size={15}
              color={colors.secondary}
            />
          ))}
          <Text style={styles.ratingValue}>{job.providerRating.toFixed(1)}</Text>
        </View>
      </View>
    </View>
  );
}

function firstName(name: string) {
  return name.split(" ")[0] ?? name;
}

function CardTopRow({ pill, trailing }: { pill: ReactNode; trailing?: ReactNode }) {
  return (
    <View style={styles.topRow}>
      {pill}
      {trailing}
    </View>
  );
}

const PILL_TONES = {
  open: { background: colors.secondarySoft, text: colors.secondaryDark },
  active: { background: colors.tertiarySoft, text: colors.tertiaryDark },
  done: { background: colors.primarySoft, text: colors.primaryDark },
};

// Status text is always spelled out; the colour only reinforces it.
function StatusPill({
  icon,
  label,
  tone,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  tone: keyof typeof PILL_TONES;
}) {
  const { background, text } = PILL_TONES[tone];
  return (
    <View style={[styles.statusPill, { backgroundColor: background }]}>
      <MaterialIcons name={icon} size={13} color={text} />
      <Text numberOfLines={1} style={[styles.statusText, { color: text }]}>
        {label}
      </Text>
    </View>
  );
}

function BudgetChip({ budget }: { budget: string }) {
  return (
    <View style={styles.budgetChip}>
      <Text style={styles.budgetText}>{budget}</Text>
    </View>
  );
}

// Area, when it was posted, and its timing — urgent timing in amber with a
// clock, otherwise teal with a calendar, as on the Responses list.
function JobMeta({ task }: { task: Task }) {
  return (
    <View style={styles.metaRow}>
      <View style={styles.metaItem}>
        <MaterialIcons name="location-on" size={15} color={colors.primary} />
        <Text style={styles.metaText}>{task.area}</Text>
      </View>
      {task.postedAgo ? (
        <View style={styles.metaItem}>
          <MaterialIcons name="schedule" size={15} color={colors.muted} />
          <Text style={styles.metaText}>Posted {task.postedAgo}</Text>
        </View>
      ) : null}
      <View style={[styles.timingChip, task.urgent ? styles.timingUrgent : styles.timingScheduled]}>
        <MaterialIcons
          name={task.urgent ? "bolt" : "calendar-today"}
          size={12}
          color={task.urgent ? colors.secondaryDark : colors.tertiaryDark}
        />
        <Text
          style={[
            styles.timingText,
            { color: task.urgent ? colors.secondaryDark : colors.tertiaryDark },
          ]}
        >
          {task.timing}
        </Text>
      </View>
    </View>
  );
}

function PersonRow({
  label,
  seeker,
  detail,
  onViewProfile,
}: {
  label: string;
  seeker: WorkerProfile;
  detail?: ReactNode;
  onViewProfile: () => void;
}) {
  return (
    <View style={styles.personRow}>
      <SeekerAvatar name={seeker.name} size={40} />
      <View style={styles.personText}>
        <Text style={styles.personLabel}>{label}</Text>
        <Text numberOfLines={1} style={styles.personName}>
          {seeker.name}
        </Text>
        {detail}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${seeker.name}'s profile`}
        hitSlop={HIT_SLOP}
        onPress={onViewProfile}
        style={styles.linkButton}
      >
        <Text style={styles.linkText}>Profile</Text>
        <MaterialIcons name="north-east" size={14} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    gap: spacing.sm + spacing.xxs,
    padding: spacing.lg,
    ...shadows.subtle,
  },
  // Wraps on narrow screens rather than squeezing the status text.
  topRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  statusPill: {
    alignItems: "center",
    borderRadius: radius.pill,
    flexDirection: "row",
    flexShrink: 1,
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + spacing.xxs,
    paddingVertical: spacing.xs,
  },
  statusText: {
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 11,
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
    fontSize: 18,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  description: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
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
  timingChip: {
    alignItems: "center",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  timingUrgent: {
    backgroundColor: colors.secondarySoft,
  },
  timingScheduled: {
    backgroundColor: colors.tertiarySoft,
  },
  timingText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  footer: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
    paddingTop: spacing.md,
  },
  footerInfo: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: spacing.xs + spacing.xxs,
  },
  footerText: {
    color: colors.muted,
    flexShrink: 1,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  primaryAction: {
    alignItems: "center",
    backgroundColor: colors.primaryDark,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs,
    height: 36,
    paddingHorizontal: spacing.md,
  },
  primaryActionText: {
    color: colors.card,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  personRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  personText: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  personLabel: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  personName: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  personDetail: {
    color: colors.muted,
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  ratingRow: {
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
  receivedRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  linkButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
  },
  linkText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  hiddenTag: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: "row",
    flexShrink: 0,
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  hiddenTagText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
});
