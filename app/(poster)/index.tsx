import { StyleSheet, Text, View } from "react-native";
import {
  AppHeader,
  Badge,
  CategoryTile,
  EmptyState,
  PrimaryButton,
  RoleSwitch,
  Screen,
  SectionHeader,
  TaskCard,
} from "@/shared/components/ui";
import { categories, tasks } from "@/data/mock";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

export default function PosterHomeScreen() {
  const activeTasks = tasks.filter((task) => task.status !== "completed");
  const totalOffers = activeTasks.reduce((sum, task) => sum + task.offerCount, 0);

  return (
    <Screen>
      <AppHeader
        title="Hi, Nadia"
        subtitle="Mirpur · ready to post or track a task"
        trailing={<RoleSwitch active="poster" />}
      />

      <View style={styles.actionCard}>
        <Badge label="Poster mode" tone="success" />
        <Text style={styles.actionTitle}>What do you need help with today?</Text>
        <Text style={styles.actionBody}>
          Create one clear task. Add budget, timing, and area so job seekers can send better offers.
        </Text>
        <PrimaryButton label="Post a new task" href="/(poster)/post-task" />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{activeTasks.length}</Text>
          <Text style={styles.statLabel}>Active tasks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalOffers}</Text>
          <Text style={styles.statLabel}>Offers to review</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Reports open</Text>
        </View>
      </View>

      <SectionHeader title="Choose a common task" action={<Badge label="Tap Post to continue" />} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {categories.map((category) => (
          <CategoryTile key={category.id} category={category} />
        ))}
      </View>

      <SectionHeader
        title="Needs your attention"
        action={<PrimaryButton label="All tasks" href="/(poster)/tasks" tone="secondary" />}
      />
      {activeTasks.slice(0, 2).map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}

      <EmptyState
        title="How Poster mode works"
        body="1. Post task · 2. Compare verified offers · 3. Hire · 4. Track completion and payment manually during the pilot."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    gap: spacing.md,
    padding: spacing.xl,
  },
  actionTitle: {
    color: colors.card,
    fontSize: 28,
    fontFamily: fonts.extraBold,
    lineHeight: 34,
  },
  actionBody: {
    color: colors.primarySoft,
    fontSize: 15,
    lineHeight: 23,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md,
  },
  statValue: {
    color: colors.primary,
    fontSize: 24,
    fontFamily: fonts.extraBold,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
    fontFamily: fonts.semiBold,
    lineHeight: 16,
  },
});
