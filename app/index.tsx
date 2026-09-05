import { StyleSheet, Text, View } from "react-native";
import { Badge, PrimaryButton, Screen } from "@/components/ui";
import { colors, radius, spacing } from "@/theme/tokens";

export default function WelcomeScreen() {
  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>MA</Text>
        </View>
        <Badge label="Dhaka pilot" tone="success" />
        <Text style={styles.brand}>Mushkil Asan</Text>
        <Text style={styles.headline}>Post work. Find work. Keep every step clear.</Text>
        <Text style={styles.body}>
          One account gives every user two simple modes: Poster mode for getting help and Job seeker mode for finding paid tasks.
        </Text>
      </View>

      <View style={styles.modeGrid}>
        <View style={styles.modeCard}>
          <Text style={styles.modeTitle}>Poster mode</Text>
          <Text style={styles.modeBody}>Post a task, compare offers, hire safely, and track completion.</Text>
        </View>
        <View style={styles.modeCard}>
          <Text style={styles.modeTitle}>Job seeker mode</Text>
          <Text style={styles.modeBody}>Browse nearby jobs, send offers, and track manual pilot earnings.</Text>
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <PrimaryButton label="Continue in Poster mode" href="/(poster)" />
        <PrimaryButton label="Switch to Job seeker mode" href="/(worker)/jobs" tone="secondary" />
        <PrimaryButton label="Start onboarding demo" href="/onboarding" tone="secondary" />
      </View>
    </Screen>
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
    fontWeight: "900",
  },
  brand: {
    color: colors.card,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  headline: {
    color: colors.card,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38,
    textAlign: "center",
  },
  body: {
    color: "#E3F5EE",
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
    fontWeight: "900",
  },
  modeBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
});
