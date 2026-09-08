import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ActionButton, AppText, ScrollScreen } from "@/shared/components/ui";
import { PROTOTYPE_PROVIDER_ROUTE, PROTOTYPE_SEEKER_ROUTE } from "@/shared/constants/routes";
import { colors, fonts, spacing } from "@/theme/tokens";

// Neutral landing spot for anyone who skipped the primary-interaction
// preference (or has none on record). We haven't approved a default Job
// Provider/Job Seeker home yet — see
// docs/engineering/domain-and-terminology.md — so instead of silently
// picking one, this screen lets the person choose explicitly. It reuses the
// two prototype areas that already exist; it does not add new marketplace
// behavior.
export default function PrototypeHomeScreen() {
  const router = useRouter();

  return (
    <ScrollScreen>
      <View style={styles.header}>
        <Text style={styles.title}>You&apos;re all set!</Text>
        <AppText style={styles.subtitle}>
          We haven&apos;t set a default view yet, so pick one to explore for now — you can switch
          any time.
        </AppText>
      </View>

      <View style={styles.actions}>
        <ActionButton
          label="Need Help →"
          onPress={() => router.replace(PROTOTYPE_PROVIDER_ROUTE)}
        />
        <ActionButton
          label="Help & Earn →"
          tone="secondary"
          onPress={() => router.replace(PROTOTYPE_SEEKER_ROUTE)}
        />
      </View>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 22,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
