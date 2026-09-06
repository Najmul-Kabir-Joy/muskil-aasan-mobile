import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActionButton, AppText, ScrollScreen } from "@/shared/components/ui";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

// Placeholder profile shown for any returning dummy account — there is no
// backend or real user profile yet. See docs/engineering/domain-and-terminology.md
// (ratings, matching, and location-radius rules are all still undefined).
const DUMMY_RETURNING_USER = {
  name: "Tanvir",
  area: "Dhanmondi, Dhaka (2.5 km radius)",
  gigsToday: 14,
  rating: 4.9,
  ratingCount: 38,
};

type Mode = "seeker" | "provider";

export default function ExistingUserHomeScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("seeker");
  const [progress, setProgress] = useState(68);

  useEffect(() => {
    if (progress >= 100) return;
    const timer = setInterval(() => {
      setProgress((value) => Math.min(100, value + 8));
    }, 200);
    return () => clearInterval(timer);
  }, [progress]);

  function goHome() {
    router.replace(mode === "provider" ? "/(poster)" : "/(worker)/jobs");
  }

  return (
    <ScrollScreen>
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="check-circle" size={40} color={colors.card} />
        </View>
        <View style={styles.verifiedChip}>
          <View style={styles.verifiedDot} />
          <Text style={styles.verifiedChipText}>Login Verified</Text>
        </View>
        <Text style={styles.headline}>Welcome back, {DUMMY_RETURNING_USER.name}!</Text>
        <AppText style={styles.subtitle}>Taking you to your neighborhood feed...</AppText>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Syncing nearby gigs</Text>
          <Text style={styles.progressPercent}>{progress}%</Text>
        </View>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Text style={styles.profileLabel}>Active Profile & Location</Text>
          <View style={styles.readyPill}>
            <View style={styles.readyDot} />
            <Text style={styles.readyPillText}>Ready to Work</Text>
          </View>
        </View>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={22} color={colors.muted} />
          </View>
          <View style={styles.profileText}>
            <View style={styles.profileNameRow}>
              <Text style={styles.profileName}>
                {mode === "provider" ? "Job Provider Mode" : "Job Seeker Mode"}
              </Text>
              <MaterialIcons name="verified" size={16} color={colors.primary} />
            </View>
            <View style={styles.profileLocationRow}>
              <MaterialIcons name="location-on" size={14} color={colors.secondaryDark} />
              <Text style={styles.profileLocation}>{DUMMY_RETURNING_USER.area}</Text>
            </View>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Available Gigs Today</Text>
            <Text style={styles.statValue}>{DUMMY_RETURNING_USER.gigsToday} new tasks</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Community Rating</Text>
            <View style={styles.ratingRow}>
              <MaterialIcons name="star" size={14} color={colors.secondaryDark} />
              <Text style={styles.statValue}>{DUMMY_RETURNING_USER.rating}</Text>
              <Text style={styles.ratingCount}>({DUMMY_RETURNING_USER.ratingCount})</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <ActionButton label="Go to Home Feed →" onPress={goHome} />
        <ActionButton
          label={mode === "provider" ? "Switch to Job Seeker" : "Switch to Job Provider"}
          tone="secondary"
          onPress={() => setMode((current) => (current === "provider" ? "seeker" : "provider"))}
        />
      </View>

      <View style={styles.footer}>
        <MaterialIcons name="shield" size={14} color={colors.primary} />
        <Text style={styles.footerText}>NID Verified • Muskil Aasan Guaranteed</Text>
      </View>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    gap: spacing.xs,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 72,
    justifyContent: "center",
    marginBottom: spacing.xs,
    width: 72,
  },
  verifiedChip: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xxs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
  },
  verifiedDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 6,
    width: 6,
  },
  verifiedChipText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  headline: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 22,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
  },
  progressTrack: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 6,
    marginTop: spacing.md,
    overflow: "hidden",
    width: "100%",
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 6,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  progressLabel: {
    color: colors.muted,
    fontSize: 12,
  },
  progressPercent: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  profileHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  profileLabel: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  readyPill: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  readyDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 6,
    width: 6,
  },
  readyPillText: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  profileRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  profileNameRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
  },
  profileName: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  profileLocationRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
  },
  profileLocation: {
    color: colors.muted,
    fontSize: 12,
  },
  statsRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.sm,
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 11,
  },
  statValue: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  ratingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
  },
  ratingCount: {
    color: colors.muted,
    fontSize: 12,
  },
  actions: {
    gap: spacing.sm,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
    justifyContent: "center",
  },
  footerText: {
    color: colors.muted,
    fontSize: 11,
  },
});
