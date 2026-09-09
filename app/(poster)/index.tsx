import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { CommunityPostCard, TaskCard } from "@/features/marketplace/components";
import { AppText, Badge, PrimaryButton, ScrollScreen } from "@/shared/components/ui";
import { BRAND_NAME } from "@/shared/constants/brand";
import { communityTasks, tasks } from "@/data/mock";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

export default function PosterHomeScreen() {
  const router = useRouter();
  const activeTasks = tasks.filter((task) => task.status !== "completed");
  const latestTask = activeTasks[0];

  return (
    <ScrollScreen>
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Image
            source={require("../../assets/branding/logo-mark.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.brandName}>{BRAND_NAME}</Text>
            <View style={styles.locationRow}>
              <MaterialIcons name="location-on" size={14} color={colors.primary} />
              <Text style={styles.locationText}>Mirpur, Dhaka</Text>
            </View>
          </View>
        </View>
        <View style={styles.topBarActions}>
          <View style={styles.notificationButton}>
            <MaterialIcons name="notifications" size={22} color={colors.muted} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            onPress={() => router.push("/profile")}
            style={styles.profileButton}
          >
            <MaterialIcons name="account-circle" size={20} color={colors.primary} />
          </Pressable>
        </View>
      </View>

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
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  logo: {
    height: 32,
    width: 32,
  },
  brandName: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  locationRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
  },
  locationText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  topBarActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  notificationButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  profileButton: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
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
