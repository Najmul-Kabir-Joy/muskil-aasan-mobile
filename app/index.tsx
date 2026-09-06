import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ActionButton, AppText, ScrollScreen } from "@/shared/components/ui";
import { colors, fonts, gradients, radius, spacing } from "@/theme/tokens";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScrollScreen>
      <View style={styles.logoRow}>
        <Image
          source={require("../assets/branding/logo-mark.png")}
          style={styles.logoMark}
          resizeMode="contain"
        />
        <Text style={styles.brand}>Muskill Asaan</Text>
      </View>

      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.illustration}
      >
        <View style={styles.illustrationTiles}>
          <View style={styles.categoryTile}>
            <View style={[styles.categoryIcon, { backgroundColor: colors.primarySoft }]}>
              <MaterialIcons name="home-repair-service" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.categoryLabel, { color: colors.primary }]}>Home & Fixes</Text>
          </View>
          <View style={styles.connector}>
            <MaterialIcons name="handshake" size={14} color={colors.secondaryDark} />
          </View>
          <View style={styles.categoryTile}>
            <View style={[styles.categoryIcon, { backgroundColor: colors.secondarySoft }]}>
              <MaterialIcons name="local-shipping" size={20} color={colors.secondaryDark} />
            </View>
            <Text style={[styles.categoryLabel, { color: colors.secondaryDark }]}>
              Delivery & Tasks
            </Text>
          </View>
        </View>
        <View style={styles.launchingBadge}>
          <MaterialIcons name="location-on" size={12} color={colors.primary} />
          <Text style={styles.launchingLabel}>Launching in Dhaka</Text>
        </View>
      </LinearGradient>

      <View style={styles.headlineBlock}>
        <Text style={styles.headline}>
          Get help{"\n"}when you need it.{"\n"}
          <Text style={styles.headlineAccent}>Earn{"\n"}when you can help.</Text>
        </Text>
        <AppText style={styles.subtitle}>
          Post a small job when you need help, or find small jobs and earn extra income.
        </AppText>
      </View>

      {/* Informational only — not an onboarding-mode selector. We've
          confirmed one account can use both modes and switch between them,
          but not that the welcome screen is where that choice happens, or
          that either mode is preselected. See
          docs/engineering/domain-and-terminology.md. */}
      <View style={styles.modeGrid}>
        <View style={styles.modeCard}>
          <View style={[styles.modeIcon, { backgroundColor: colors.primarySoft }]}>
            <MaterialIcons name="assignment" size={20} color={colors.primary} />
          </View>
          <Text style={styles.modeTitle}>Need Help</Text>
          <AppText style={styles.modeBody}>Post a small job and find someone to help.</AppText>
        </View>
        <View style={styles.modeCard}>
          <View style={[styles.modeIcon, { backgroundColor: colors.secondarySoft }]}>
            <MaterialIcons name="account-balance-wallet" size={20} color={colors.secondaryDark} />
          </View>
          <Text style={styles.modeTitle}>Want to Earn</Text>
          <AppText style={styles.modeBody}>Find small jobs and earn extra income.</AppText>
        </View>
      </View>

      <View style={styles.actions}>
        {/* Routes into the existing onboarding flow, which already has its
            own mode-selection step — not a welcome-screen shortcut into
            Provider/Seeker areas (that specific flow isn't confirmed). */}
        <ActionButton label="Get Started →" onPress={() => router.push("/onboarding")} />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/login")}
          style={styles.loginRow}
        >
          <Text style={styles.loginPrefix}>Already have an account? </Text>
          <Text style={styles.loginAction}>Log In</Text>
        </Pressable>
      </View>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  logoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  logoMark: {
    height: 32,
    width: 43,
  },
  brand: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  illustration: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  illustrationTiles: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
  },
  categoryTile: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.sm,
    width: 96,
  },
  categoryIcon: {
    alignItems: "center",
    borderRadius: radius.pill,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  categoryLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    textAlign: "center",
  },
  connector: {
    alignItems: "center",
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.pill,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  launchingBadge: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  launchingLabel: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  headlineBlock: {
    alignItems: "center",
    gap: spacing.xs,
  },
  headline: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  headlineAccent: {
    color: colors.primary,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    maxWidth: 300,
    textAlign: "center",
  },
  modeGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  modeCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xxs,
    padding: spacing.md,
  },
  modeIcon: {
    alignItems: "center",
    borderRadius: radius.sm,
    height: 36,
    justifyContent: "center",
    marginBottom: spacing.xs,
    width: 36,
  },
  modeTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  modeBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  loginRow: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  loginPrefix: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  loginAction: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  actions: {
    gap: spacing.md,
    marginTop: "auto",
    paddingTop: spacing.xl,
  },
});
