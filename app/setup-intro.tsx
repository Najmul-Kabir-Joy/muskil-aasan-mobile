import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ActionButton, AppText, ScrollScreen } from "@/shared/components/ui";
import { BRAND_NAME } from "@/shared/constants/brand";
import { colors, fonts, gradients, radius, spacing } from "@/theme/tokens";

type ProgressRow = {
  key: string;
  title: string;
  detail: string;
  status: "done" | "next" | "optional";
};

const ROWS: ProgressRow[] = [
  {
    key: "phone",
    title: "Phone Number Verified",
    detail: "Verified via OTP",
    status: "done",
  },
  {
    key: "basic",
    title: "Basic Information",
    detail: "Your name, area (e.g. Mirpur or Dhanmondi), & photo",
    status: "next",
  },
  {
    key: "identity",
    title: "Identity Verification",
    detail: "NID / Student ID to earn a trusted green verification tick",
    status: "optional",
  },
];

export default function SetupIntroScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone?: string }>();

  function handleGetStarted() {
    router.replace({ pathname: "/onboarding", params: { phone } });
  }

  function handleLater() {
    router.replace("/(poster)");
  }

  return (
    <ScrollScreen>
      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.welcomeChip}>
          <MaterialIcons name="celebration" size={14} color={colors.primary} />
          <Text style={styles.welcomeChipText}>Welcome to {BRAND_NAME}</Text>
        </View>
        <Text style={styles.headline}>Let&apos;s finish setting up your profile</Text>
        <AppText style={styles.subtitle}>
          Your phone number +880 {phone} is verified. Just 2 quick steps left to connect with
          trusted local micro-jobs.
        </AppText>
      </LinearGradient>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Setup Progress</Text>
          <Text style={styles.progressStep}>Step 1 of 3</Text>
        </View>
        {ROWS.map((row) => (
          <View key={row.key} style={styles.row}>
            <View
              style={[
                styles.rowIcon,
                row.status === "done" && styles.rowIconDone,
                row.status === "next" && styles.rowIconNext,
              ]}
            >
              <MaterialIcons
                name={row.status === "done" ? "check" : row.status === "next" ? "edit" : "badge"}
                size={18}
                color={row.status === "optional" ? colors.muted : colors.card}
              />
            </View>
            <View style={styles.rowText}>
              <View style={styles.rowTitleLine}>
                <Text style={styles.rowTitle}>{row.title}</Text>
                <Text
                  style={[
                    styles.rowStatus,
                    row.status === "done" && styles.rowStatusDone,
                    row.status === "next" && styles.rowStatusNext,
                  ]}
                >
                  {row.status === "done" ? "Done" : row.status === "next" ? "Next" : "Optional"}
                </Text>
              </View>
              <AppText style={styles.rowDetail}>{row.detail}</AppText>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.tip}>
        <MaterialIcons name="lightbulb" size={20} color={colors.secondaryDark} />
        <AppText style={styles.tipText}>
          Profiles with an area get <Text style={styles.tipBold}>3x more replies</Text> within the
          first 2 hours!
        </AppText>
      </View>

      <View style={styles.actions}>
        <ActionButton label="Get Started →" onPress={handleGetStarted} />
        <ActionButton label="I'll complete this later" tone="secondary" onPress={handleLater} />
      </View>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  welcomeChip: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xxs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  welcomeChipText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  headline: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 22,
    textAlign: "center",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
  },
  progressCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  progressHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  progressStep: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 11,
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  rowIcon: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  rowIconDone: {
    backgroundColor: colors.primary,
  },
  rowIconNext: {
    backgroundColor: colors.primary,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitleLine: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowTitle: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  rowStatus: {
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  rowStatusDone: {
    color: colors.primary,
  },
  rowStatusNext: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    color: colors.card,
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
  },
  rowDetail: {
    color: colors.muted,
    fontSize: 12,
  },
  tip: {
    alignItems: "center",
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  tipText: { color: colors.text, flex: 1, fontSize: 12 },
  tipBold: {
    fontFamily: fonts.bold,
  },
  actions: {
    gap: spacing.sm,
  },
});
