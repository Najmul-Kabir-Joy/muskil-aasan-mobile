import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ActionButton, AppText, ScrollScreen } from "@/shared/components/ui";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

type Mode = "poster" | "jobSeeker";

export default function WelcomeScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("poster");

  return (
    <ScrollScreen>
      <View style={styles.topRow}>
        <View style={styles.logoRow}>
          <Image
            source={require("../assets/branding/logo-mark.png")}
            style={styles.logoMark}
            resizeMode="contain"
          />
          <Text style={styles.brand}>Muskill Asaan</Text>
        </View>
        <View style={styles.langBadge}>
          <MaterialIcons name="translate" size={14} color={colors.primary} />
          <Text style={styles.langLabel}>EN</Text>
        </View>
      </View>

      <LinearGradient
        // One-off gradient stops matching the Stitch source exactly
        // (surface-container-low/-container/-container-high), not general
        // design tokens — this is the only place these three shades appear.
        colors={["#F2F3FF", "#EAEDFF", "#E2E7FF"]}
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

      <View style={styles.modeGrid}>
        <ModeOption
          icon="assignment"
          title="Need Help"
          description="Post a task and get fast help from neighbors."
          selected={mode === "poster"}
          onPress={() => setMode("poster")}
        />
        <ModeOption
          icon="account-balance-wallet"
          title="Want to Earn"
          description="Find small jobs and earn extra income."
          selected={mode === "jobSeeker"}
          onPress={() => setMode("jobSeeker")}
        />
      </View>

      <View style={styles.actions}>
        <ActionButton
          label="Get Started →"
          onPress={() => router.push(mode === "poster" ? "/(poster)" : "/(worker)/jobs")}
        />
        {/* Matches the design exactly, but there is no login/auth flow to
            send this to yet (see AGENTS.md's "Do not invent product
            behavior") — it's intentionally not a Pressable/PrimaryButton. */}
        <View style={styles.loginRow}>
          <Text style={styles.loginPrefix}>Already have an account? </Text>
          <Text style={styles.loginAction}>Log In</Text>
        </View>
      </View>
    </ScrollScreen>
  );
}

function ModeOption({
  icon,
  title,
  description,
  selected,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.modeCard, selected && styles.modeCardActive]}
    >
      <View style={[styles.modeIcon, selected && styles.modeIconActive]}>
        <MaterialIcons name={icon} size={20} color={selected ? colors.primary : colors.muted} />
      </View>
      <Text style={styles.modeTitle}>{title}</Text>
      <AppText style={styles.modeBody}>{description}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
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
  langBadge: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  langLabel: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 12,
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
    paddingVertical: 2,
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
    gap: 2,
    padding: spacing.md,
  },
  modeCardActive: {
    borderColor: colors.primary,
  },
  modeIcon: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    height: 36,
    justifyContent: "center",
    marginBottom: spacing.xs,
    width: 36,
  },
  modeIconActive: {
    backgroundColor: colors.primarySoft,
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
