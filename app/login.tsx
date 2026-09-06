import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { ActionButton, AppText, ScrollScreen } from "@/shared/components/ui";
import { BRAND_NAME } from "@/shared/constants/brand";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

const OTP_LENGTH = 4;
const RESEND_SECONDS = 45;

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const otpInputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (!otpSent || resendIn <= 0) return;
    const timer = setInterval(() => setResendIn((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [otpSent, resendIn]);

  const canContinue = phone.length >= 10;
  const resendLabel = `0:${resendIn.toString().padStart(2, "0")}`;

  function handleContinue() {
    setOtpSent(true);
    setResendIn(RESEND_SECONDS);
  }

  function handleEditNumber() {
    setOtpSent(false);
    setOtp(Array(OTP_LENGTH).fill(""));
  }

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    setOtp((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });
    if (digit && index < OTP_LENGTH - 1) {
      otpInputs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyPress(index: number, key: string) {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
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
        <Text style={styles.bengaliLabel}>মুশকিল আসান</Text>
        <AppText style={styles.subtitle}>
          Enter your mobile number to sign in or create an account.
        </AppText>
      </View>

      <View style={styles.form}>
        <Text style={styles.fieldLabel}>Mobile Number</Text>
        <View style={styles.phoneRow}>
          <View style={styles.countryPill}>
            <Text style={styles.flag}>🇧🇩</Text>
            <Text style={styles.countryCode}>+880</Text>
          </View>
          <TextInput
            value={phone}
            onChangeText={(value) => setPhone(value.replace(/[^0-9]/g, "").slice(0, 11))}
            placeholder="017XX-XXXXXX"
            placeholderTextColor={colors.muted}
            keyboardType="number-pad"
            maxLength={11}
            style={styles.phoneInput}
          />
        </View>
        <AppText style={styles.helpText}>We&apos;ll text you a 6-digit verification code.</AppText>
        <ActionButton label="Continue →" onPress={handleContinue} disabled={!canContinue} />
      </View>

      {otpSent ? (
        <View style={styles.otpBox}>
          <View style={styles.otpNotice}>
            <MaterialIcons name="mark-chat-unread" size={16} color={colors.primary} />
            <Text style={styles.otpNoticeText}>Code sent to +880 {phone}</Text>
          </View>
          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(node) => {
                  otpInputs.current[index] = node;
                }}
                accessibilityLabel={`Verification code digit ${index + 1} of ${OTP_LENGTH}`}
                value={digit}
                onChangeText={(value) => handleOtpChange(index, value)}
                onKeyPress={({ nativeEvent }) => handleOtpKeyPress(index, nativeEvent.key)}
                keyboardType="number-pad"
                maxLength={1}
                style={styles.otpDigit}
              />
            ))}
          </View>
          <View style={styles.otpFooter}>
            <Text style={styles.otpFooterText}>
              {resendIn > 0 ? `Resend in ${resendLabel}` : "You can resend the code now"}
            </Text>
            <Pressable accessibilityRole="button" onPress={handleEditNumber}>
              <Text style={styles.editNumber}>Edit Number</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerLabel}>or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* No OAuth wired up yet — matches the Welcome screen's static "Log In"
          precedent for design elements without a real destination yet. */}
      <ActionButton
        label="Continue with Google"
        tone="outlined"
        onPress={() => {}}
        icon={<GoogleIcon />}
      />

      <AppText style={styles.terms}>
        By continuing, you agree to our <Text style={styles.termsLink}>Terms of Service</Text> &{" "}
        <Text style={styles.termsLink}>Privacy Policy</Text>.
      </AppText>
    </ScrollScreen>
  );
}

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </Svg>
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
  bengaliLabel: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    maxWidth: 280,
    textAlign: "center",
  },
  form: {
    gap: spacing.md,
  },
  fieldLabel: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    paddingLeft: spacing.xs,
  },
  phoneRow: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.sm,
  },
  countryPill: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  flag: {
    fontSize: 16,
  },
  countryCode: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  phoneInput: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  helpText: {
    color: colors.muted,
    fontSize: 13,
    paddingHorizontal: spacing.xs,
  },
  otpBox: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  otpNotice: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  otpNoticeText: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  otpRow: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
  },
  otpDigit: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 20,
    height: 48,
    textAlign: "center",
    width: 40,
  },
  otpFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xxs,
    width: "100%",
  },
  otpFooterText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  editNumber: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  divider: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  dividerLine: {
    backgroundColor: colors.border,
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 11,
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
