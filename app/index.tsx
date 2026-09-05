import { StyleSheet, Text, View } from "react-native";
import { AppText, Badge, PrimaryButton, ScrollScreen } from "@/shared/components/ui";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

export default function WelcomeScreen() {
  return (
    <ScrollScreen>
      <View style={styles.hero}>
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>MA</Text>
        </View>
        <Badge label="Dhaka pilot" tone="success" />
        <Text style={styles.brand}>Muskill Asaan</Text>
        <Text style={styles.headline}>Post work. Find work. Keep every step clear.</Text>
        <AppText style={styles.body}>
          One account gives every user two simple modes: Poster mode for getting help and Job seeker
          mode for finding paid tasks.
        </AppText>
      </View>

      <View style={styles.modeGrid}>
        <View style={styles.modeCard}>
          <Text style={styles.modeTitle}>Poster mode</Text>
          <AppText style={styles.modeBody}>
            Post a task, compare offers, hire safely, and track completion.
          </AppText>
        </View>
        <View style={styles.modeCard}>
          <Text style={styles.modeTitle}>Job seeker mode</Text>
          <AppText style={styles.modeBody}>
            Browse nearby jobs, send offers, and track manual pilot earnings.
          </AppText>
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <PrimaryButton label="Continue in Poster mode" href="/(poster)" />
        <PrimaryButton label="Switch to Job seeker mode" href="/(worker)/jobs" tone="secondary" />
        <PrimaryButton label="Start onboarding demo" href="/onboarding" tone="secondary" />
      </View>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: 40,
  },
  logoMark: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 28,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  logoText: {
    color: colors.primary,
    fontSize: 24,
    fontFamily: fonts.extraBold,
  },
  brand: {
    color: colors.card,
    fontSize: 18,
    fontFamily: fonts.extraBold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  headline: {
    color: colors.card,
    fontSize: 32,
    fontFamily: fonts.extraBold,
    lineHeight: 38,
    textAlign: "center",
  },
  body: {
    color: colors.primarySoft,
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
  },
  modeGrid: {
    gap: spacing.md,
  },
  modeCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  modeTitle: {
    color: colors.text,
    fontSize: 18,
    fontFamily: fonts.extraBold,
  },
  modeBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
});
