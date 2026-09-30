import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { Edges } from "react-native-safe-area-context";
import { categoryIconFor, firstNameOf } from "@/features/marketplace/profile/profileHelpers";
import {
  ALL_JOBS,
  categoriesWithJobs,
  filterJobs,
  groupApplications,
  type JobFilter,
} from "@/features/marketplace/seeker/seekerActivity";
import { useSeekerActivity } from "@/features/marketplace/seeker/SeekerActivityContext";
import { SeekerEmptyState } from "@/features/marketplace/seeker/SeekerScreenParts";
import { SeekerJobList, SeekerJobSheet } from "@/features/marketplace/seeker/SeekerJobList";
import { SEEKER_APPLICATIONS_ROUTE } from "@/features/marketplace/seeker/seekerRoutes";
import { ActionButton, ScrollScreen } from "@/shared/components/ui";
import { categories, getCurrentUserProfile, seekerFeedJobs } from "@/data/mock";
import { colors, fonts, radius, spacing } from "@/theme/tokens";
import type { SeekerApplication, Task } from "@/types/domain";

type IconName = keyof typeof MaterialIcons.glyphMap;

const CATEGORY_ORDER = categories.map((category) => category.label);

/**
 * The Job Seeker Home — "what work can I find and respond to?". A feed, not
 * a dashboard: a greeting, search, a job request waiting for an answer (only
 * when there is one), one row of quick filters, then the latest Jobs.
 *
 * The feed is newest first and never ranked or matched to the viewer —
 * recommendation rules are undefined — and there's no "Nearby" filter,
 * since precise location rules are undefined too. Remote vs in person is
 * shown on every card and is the one non-category filter.
 *
 * Renders only page content; the header, drawer and bottom navigation
 * belong to the Seeker shell (`app/(worker)/_layout.tsx`).
 */
export function SeekerHomeScreen({
  edges,
  jobs = seekerFeedJobs,
  userName = getCurrentUserProfile().name,
}: {
  edges?: Edges;
  jobs?: Task[];
  userName?: string;
} = {}) {
  const router = useRouter();
  const { applications } = useSeekerActivity();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<JobFilter>(ALL_JOBS);
  const [openJob, setOpenJob] = useState<Task | null>(null);
  const visibleJobs = filterJobs(jobs, query, filter);
  const isFiltered = query.trim().length > 0 || filter.kind !== "all";
  const { jobRequests } = groupApplications(applications);

  function clearFilters() {
    setQuery("");
    setFilter(ALL_JOBS);
  }

  return (
    <>
      <ScrollScreen edges={edges}>
        <View style={styles.page}>
          <View style={styles.greetingBlock}>
            <Text style={styles.greeting}>Hi, {firstNameOf(userName)}</Text>
            <Text accessibilityRole="header" style={styles.headline}>
              Find jobs you can help with
            </Text>
          </View>

          <View style={styles.search}>
            <MaterialIcons name="search" size={20} color={colors.muted} />
            <TextInput
              accessibilityLabel="Search jobs"
              value={query}
              onChangeText={setQuery}
              placeholder="Search jobs, categories or areas"
              placeholderTextColor={colors.muted}
              returnKeyType="search"
              style={styles.searchInput}
            />
            {query ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                onPress={() => setQuery("")}
                style={styles.clearButton}
              >
                <MaterialIcons name="cancel" size={18} color={colors.muted} />
              </Pressable>
            ) : null}
          </View>

          {jobRequests.length > 0 ? (
            <JobRequestBanner
              jobRequests={jobRequests}
              onReview={() => router.push(SEEKER_APPLICATIONS_ROUTE)}
            />
          ) : null}

          <FilterRail jobs={jobs} filter={filter} onChange={setFilter} />

          <View style={styles.feed}>
            <View style={styles.feedHeader}>
              <Text style={styles.sectionTitle}>
                {isFiltered ? "Matching jobs" : "Latest jobs"}
              </Text>
              <View style={styles.countPill}>
                <Text style={styles.countText}>
                  {visibleJobs.length} {visibleJobs.length === 1 ? "job" : "jobs"}
                </Text>
              </View>
            </View>

            {visibleJobs.length > 0 ? (
              <SeekerJobList jobs={visibleJobs} onOpenJob={setOpenJob} />
            ) : (
              <SeekerEmptyState
                icon="search-off"
                title={isFiltered ? "No jobs match" : "No jobs right now"}
                body={
                  isFiltered
                    ? "Try another search or category."
                    : "New jobs from Job Providers will show here."
                }
                action={
                  isFiltered ? (
                    <ActionButton label="Show all jobs" onPress={clearFilters} tone="secondary" />
                  ) : undefined
                }
              />
            )}
          </View>
        </View>
      </ScrollScreen>
      <SeekerJobSheet job={openJob} onClose={() => setOpenJob(null)} />
    </>
  );
}

// The one thing on Home that needs the Seeker to act: a Provider chose them
// and is waiting for them to accept. Answering happens in Applications.
function JobRequestBanner({
  jobRequests,
  onReview,
}: {
  jobRequests: SeekerApplication[];
  onReview: () => void;
}) {
  const [first] = jobRequests;
  const providerName = first?.job.postedBy?.name;
  const body =
    jobRequests.length === 1 && first
      ? `${providerName ?? "A Job Provider"} chose you for “${first.job.title}”.`
      : `${jobRequests.length} Job Providers chose you. Answer them in Applications.`;

  return (
    <View style={styles.banner}>
      <View style={styles.bannerIcon}>
        <MaterialIcons name="mark-email-unread" size={22} color={colors.primary} />
      </View>
      <View style={styles.bannerText}>
        <Text style={styles.bannerTitle}>
          {jobRequests.length === 1 ? "You have a job request" : "You have job requests"}
        </Text>
        <Text numberOfLines={3} style={styles.bannerBody}>
          {body}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Review job request"
          onPress={onReview}
          style={styles.bannerButton}
        >
          <Text style={styles.bannerButtonText}>Review</Text>
          <MaterialIcons name="arrow-forward" size={16} color={colors.primaryDark} />
        </Pressable>
      </View>
    </View>
  );
}

// One row of single-select quick filters: all jobs, Remote, then only the
// categories that currently have jobs (from the app-wide category list).
function FilterRail({
  jobs,
  filter,
  onChange,
}: {
  jobs: Task[];
  filter: JobFilter;
  onChange: (filter: JobFilter) => void;
}) {
  const options: { key: string; label: string; icon: IconName; value: JobFilter }[] = [
    { key: "all", label: "All jobs", icon: "apps", value: ALL_JOBS },
    { key: "remote", label: "Remote", icon: "language", value: { kind: "remote" } },
    ...categoriesWithJobs(jobs, CATEGORY_ORDER).map((label) => ({
      key: `category-${label}`,
      label,
      icon: categoryIconFor(label),
      value: { kind: "category", label } as const,
    })),
  ];

  function isSelected(value: JobFilter) {
    if (value.kind === "category") {
      return filter.kind === "category" && filter.label === value.label;
    }
    return filter.kind === value.kind;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.rail}
      contentContainerStyle={styles.railContent}
    >
      {options.map((option) => {
        const selected = isSelected(option.value);
        return (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(selected ? ALL_JOBS : option.value)}
            style={[styles.filterChip, selected && styles.filterChipSelected]}
          >
            <MaterialIcons
              name={option.icon}
              size={16}
              color={selected ? colors.card : colors.primary}
            />
            <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: spacing.lg,
  },
  greetingBlock: {
    gap: spacing.xxs,
  },
  greeting: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  headline: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 22,
    lineHeight: 28,
  },
  search: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 48,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    minHeight: 46,
    paddingVertical: 0,
  },
  clearButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  banner: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md + spacing.xs,
  },
  bannerIcon: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  bannerText: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  bannerTitle: {
    color: colors.card,
    fontFamily: fonts.extraBold,
    fontSize: 15,
  },
  bannerBody: {
    color: colors.primarySoft,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
  },
  bannerButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.lg,
  },
  bannerButtonText: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  // Bleeds to the screen edges so chips scroll under the gutter instead of
  // being clipped at it.
  rail: {
    flexGrow: 0,
    marginHorizontal: -spacing.lg,
  },
  railContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  filterChip: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  filterTextSelected: {
    color: colors.card,
    fontFamily: fonts.bold,
  },
  feed: {
    gap: spacing.md,
  },
  feedHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.text,
    flexShrink: 1,
    fontFamily: fonts.extraBold,
    fontSize: 16,
  },
  countPill: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  countText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
});
