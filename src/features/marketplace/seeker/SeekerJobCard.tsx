import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { categoryIconFor } from "@/features/marketplace/profile/profileHelpers";
import { SeekerAvatar } from "@/features/marketplace/responses/SeekerAvatar";
import { APPLICATION_STAGES } from "@/features/marketplace/seeker/applicationStage";
import { colors, fonts, radius, shadows, spacing } from "@/theme/tokens";
import type { SeekerApplicationStage, Task } from "@/types/domain";

const HIT_SLOP = { top: 4, bottom: 4, left: 4, right: 4 };

/**
 * A Job as a Job Seeker sees it on Home and Saved — ordered by what decides
 * "do I want this?": what kind of job and what it pays, what it is, where
 * and when, then who posted it.
 *
 * The Provider shows only as public basics (name, when they posted) — never
 * contact details or trust claims. There's no price field, bid or "offer":
 * the one action is a private Response. Once the Seeker has responded, the
 * Respond button becomes the application's stage, which opens Applications.
 *
 * The card body opens the full Job (`onOpen`); the footer's actions are
 * separate buttons rather than nested inside it, so each has its own label.
 */
export function SeekerJobCard({
  job,
  saved,
  stage,
  onOpen,
  onToggleSave,
  onRespond,
  onViewApplication,
}: {
  job: Task;
  saved: boolean;
  stage?: SeekerApplicationStage;
  onOpen: () => void;
  onToggleSave: () => void;
  onRespond: () => void;
  onViewApplication: () => void;
}) {
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${job.title}. View job details`}
        onPress={onOpen}
        style={styles.body}
      >
        <View style={styles.topRow}>
          <CategoryTag category={job.category} />
          <BudgetTag budget={job.budget} />
        </View>
        <Text numberOfLines={3} style={styles.title}>
          {job.title}
        </Text>
        <Text numberOfLines={2} style={styles.description}>
          {job.description}
        </Text>
        <JobPlaceAndTime job={job} />
      </Pressable>

      <View style={styles.footer}>
        <PostedBy job={job} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saved ? `Remove ${job.title} from Saved` : `Save ${job.title}`}
          accessibilityState={{ selected: saved }}
          hitSlop={HIT_SLOP}
          onPress={onToggleSave}
          style={[styles.saveButton, saved && styles.saveButtonActive]}
        >
          <MaterialIcons
            name={saved ? "bookmark" : "bookmark-border"}
            size={20}
            color={saved ? colors.primary : colors.muted}
          />
        </Pressable>
        {stage ? (
          <StageButton stage={stage} onPress={onViewApplication} />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Respond to ${job.title}`}
            hitSlop={HIT_SLOP}
            onPress={onRespond}
            style={({ pressed }) => [styles.respondButton, pressed && styles.pressed]}
          >
            <Text style={styles.respondText}>Respond</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function StageButton({ stage, onPress }: { stage: SeekerApplicationStage; onPress: () => void }) {
  const { label, shortLabel, icon, background, text } = APPLICATION_STAGES[stage];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}. View in Applications`}
      hitSlop={HIT_SLOP}
      onPress={onPress}
      style={[styles.stageButton, { backgroundColor: background }]}
    >
      <MaterialIcons name={icon} size={15} color={text} />
      <Text numberOfLines={1} style={[styles.stageText, { color: text }]}>
        {shortLabel}
      </Text>
    </Pressable>
  );
}

export function CategoryTag({ category }: { category: string }) {
  return (
    <View style={styles.categoryTag}>
      <MaterialIcons name={categoryIconFor(category)} size={14} color={colors.primaryDark} />
      <Text numberOfLines={1} style={styles.categoryText}>
        {category}
      </Text>
    </View>
  );
}

export function BudgetTag({ budget }: { budget: string }) {
  return (
    <View style={styles.budgetTag}>
      <Text style={styles.budgetText}>{budget}</Text>
    </View>
  );
}

// Where (a pin for a place, an arrow for a from → to route, a globe for
// Remote) and when — urgent timing in amber, otherwise teal, as on the
// Provider's My Jobs.
export function JobPlaceAndTime({ job }: { job: Task }) {
  const isRoute = job.area.includes("→");
  const placeIcon = job.remote ? "language" : isRoute ? "near-me" : "location-on";
  // Remote is always spelled out, not left to the icon.
  const place = job.remote && !/remote/i.test(job.area) ? `Remote · ${job.area}` : job.area;
  return (
    <View style={styles.metaRow}>
      <View style={styles.metaItem}>
        <MaterialIcons name={placeIcon} size={15} color={colors.primary} />
        <Text style={styles.metaText}>{place}</Text>
      </View>
      <View style={[styles.timingChip, job.urgent ? styles.timingUrgent : styles.timingScheduled]}>
        <MaterialIcons
          name={job.urgent ? "bolt" : "calendar-today"}
          size={12}
          color={job.urgent ? colors.secondaryDark : colors.tertiaryDark}
        />
        <Text
          style={[
            styles.timingText,
            { color: job.urgent ? colors.secondaryDark : colors.tertiaryDark },
          ]}
        >
          {job.timing}
        </Text>
      </View>
    </View>
  );
}

// The Job Provider's public basics only: name and when they posted.
export function PostedBy({ job }: { job: Task }) {
  if (!job.postedBy) return <View style={styles.postedBy} />;
  return (
    <View style={styles.postedBy}>
      <SeekerAvatar name={job.postedBy.name} size={32} />
      <View style={styles.postedByText}>
        <Text numberOfLines={1} style={styles.postedByName}>
          {job.postedBy.name}
        </Text>
        {job.postedAgo ? (
          <Text numberOfLines={1} style={styles.postedByMeta}>
            Posted {job.postedAgo}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    ...shadows.subtle,
  },
  body: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  // Wraps on narrow screens rather than squeezing the budget.
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  categoryTag: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    flexDirection: "row",
    flexShrink: 1,
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + spacing.xxs,
    paddingVertical: spacing.xs,
  },
  categoryText: {
    color: colors.primaryDark,
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  budgetTag: {
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.sm,
    flexShrink: 0,
    paddingHorizontal: spacing.sm + spacing.xxs,
    paddingVertical: spacing.xxs,
  },
  budgetText: {
    color: colors.secondaryDark,
    fontFamily: fonts.extraBold,
    fontSize: 17,
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
    marginTop: spacing.xxs,
  },
  metaItem: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: spacing.xs,
  },
  metaText: {
    color: colors.text,
    flexShrink: 1,
    fontFamily: fonts.semiBold,
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
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  postedBy: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minWidth: 0,
  },
  postedByText: {
    flex: 1,
    minWidth: 0,
  },
  postedByName: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  postedByMeta: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  saveButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  saveButtonActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primarySoft,
  },
  respondButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  respondText: {
    color: colors.card,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.85,
  },
  stageButton: {
    alignItems: "center",
    borderRadius: radius.pill,
    flexDirection: "row",
    flexShrink: 1,
    gap: spacing.xs,
    height: 40,
    paddingHorizontal: spacing.md,
  },
  stageText: {
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
});
