import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ActionButton, AppText, ScrollScreen } from "@/shared/components/ui";
import { PROTOTYPE_HOME_ROUTE } from "@/shared/constants/routes";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

// Shown after OTP verification recognizes a dummy existing account. There is
// no real user profile, mode, or Home experience yet — this screen only
// confirms sign-in and hands off to a neutral placeholder route. See
// docs/engineering/domain-and-terminology.md for what is still undefined.
export default function ExistingUserHomeScreen() {
  const router = useRouter();

  function handleContinue() {
    router.replace(PROTOTYPE_HOME_ROUTE);
  }

  return (
    <ScrollScreen>
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="check-circle" size={40} color={colors.card} />
        </View>
        <Text style={styles.headline}>Welcome back!</Text>
        <AppText style={styles.subtitle}>You&apos;re signed in.</AppText>
      </View>

      <View style={styles.actions}>
        <ActionButton label="Continue →" onPress={handleContinue} />
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
  actions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
