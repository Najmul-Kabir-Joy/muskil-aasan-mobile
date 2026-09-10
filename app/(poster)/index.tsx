import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CommunityPostCard, TaskCard } from "@/features/marketplace/components";
import { AppText, Badge, PrimaryButton, ScrollScreen } from "@/shared/components/ui";
import { communityTasks, tasks } from "@/data/mock";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

export default function PosterHomeScreen() {
  const router = useRouter();
  const activeTasks = tasks.filter((task) => task.status !== "completed");
  const latestTask = activeTasks[0];

  return (
    <ScrollScreen edges={["left", "right"]}>
      <View style={styles.postBanner}>
        <View style={styles.postBannerText}>
          <MaterialIcons name="add-task" size={20} color={colors.card} />
          <AppText style={styles.postBannerCopy}>
            <Text style={styles.postBannerBold}>Need help with something? </Text>
            Post a task and find someone nearby.
          </AppText>
        </View>
        <PrimaryButton label="+ Post a Job" href="/(poster)/post-task" tone="secondary" />
      </View>

      {latestTask ? (
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Your Latest Job</Text>
            <Badge label="Active" tone="success" />
          </View>
          <TaskCard task={latestTask} cta="View Job" href="/(poster)/tasks" />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/(poster)/tasks")}
            style={styles.viewAllLink}
          >
            <Text style={styles.viewAllText}>View All My Listings</Text>
            <MaterialIcons name="arrow-right-alt" size={16} color={colors.primary} />
          </Pressable>
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.communityHeaderRow}>
          <View style={styles.communityHeaderText}>
            <Text style={styles.sectionTitle}>Community Jobs</Text>
            <AppText style={styles.communitySubtitle}>
              Tasks and gigs posted by neighbors near you
            </AppText>
          </View>
          <View style={styles.nearbyChip}>
            <MaterialIcons name="near-me" size={14} color={colors.primary} />
            <Text style={styles.nearbyChipText}>Nearby</Text>
          </View>
        </View>
        <View style={styles.communityList}>
          {communityTasks.map((task) => (
            <CommunityPostCard key={task.id} task={task} />
          ))}
        </View>
      </View>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  postBanner: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    padding: spacing.md,
  },
  postBannerText: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
  },
  postBannerCopy: {
    color: colors.card,
    flexShrink: 1,
    fontSize: 12,
  },
  postBannerBold: {
    fontFamily: fonts.bold,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 16,
  },
  viewAllLink: {
    alignItems: "center",
    alignSelf: "flex-end",
    flexDirection: "row",
    gap: spacing.xxs,
  },
  viewAllText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  communityHeaderRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  communityHeaderText: {
    flex: 1,
    gap: 2,
  },
  communitySubtitle: {
    fontSize: 13,
  },
  nearbyChip: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  nearbyChipText: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  communityList: {
    gap: spacing.md,
  },
});
