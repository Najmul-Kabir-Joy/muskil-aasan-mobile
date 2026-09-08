import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { isDummyExistingUser } from "@/features/auth/dummyAuth";
import { PhoneOtpStep } from "@/features/auth/PhoneOtpStep";
import { AppText, ScrollScreen } from "@/shared/components/ui";
import { BRAND_NAME } from "@/shared/constants/brand";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

export default function LoginScreen() {
  const router = useRouter();

  function handleVerified(phone: string) {
    if (isDummyExistingUser(phone)) {
      router.replace("/existing-user-home");
    } else {
      router.replace({ pathname: "/setup-intro", params: { phone } });
    }
  }

  return (
    <ScrollScreen>
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={4}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={20} color={colors.muted} />
        </Pressable>
        <View style={styles.locationBadge}>
          <Text style={styles.locationLabel}>Dhaka</Text>
        </View>
      </View>

      <View style={styles.header}>
        <Image
          source={require("../assets/branding/logo-mark.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headline}>Welcome to {BRAND_NAME}</Text>
        <AppText style={styles.subtitle}>
          Enter your mobile number to sign in or create an account.
        </AppText>
      </View>

      <PhoneOtpStep onVerified={handleVerified} />

      <AppText style={styles.terms}>
        By continuing, you agree to our <Text style={styles.termsLink}>Terms of Service</Text> &{" "}
        <Text style={styles.termsLink}>Privacy Policy</Text>.
      </AppText>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backButton: {
    alignItems: "center",
    borderRadius: radius.pill,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  locationBadge: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  locationLabel: {
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  header: {
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  logo: {
    height: 48,
    width: 64,
  },
  headline: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 24,
    letterSpacing: -0.3,
    lineHeight: 32,
    textAlign: "center",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    maxWidth: 280,
    textAlign: "center",
  },
  terms: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  termsLink: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },
});
