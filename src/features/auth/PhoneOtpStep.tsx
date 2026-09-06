import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ActionButton, AppText } from "@/shared/components/ui";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

const OTP_LENGTH = 4;
const RESEND_SECONDS = 45;

/**
 * Phone number entry + OTP verification, reused by the standalone Login
 * screen and as the final step of the Get Started signup wizard. There is no
 * real backend or SMS provider yet — any 4-digit code is accepted, and
 * `onVerified` fires as soon as all digits are filled in. See
 * src/features/auth/dummyAuth.ts for the dummy existing-vs-new-user check.
 */
export function PhoneOtpStep({ onVerified }: { onVerified: (phone: string) => void }) {
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
      if (next.every(Boolean)) {
        onVerified(phone);
      }
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
    <>
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
    </>
  );
}

const styles = StyleSheet.create({
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
});
