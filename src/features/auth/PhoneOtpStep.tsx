import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { isDummyOtpCorrect } from "@/features/auth/dummyAuth";
import { ActionButton, AppText } from "@/shared/components/ui";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

function formatCountdown(seconds: number) {
  return `00:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Phone number entry + OTP verification, reused by the standalone Login
 * screen and as the final step of the Get Started signup wizard. There is no
 * real backend or SMS provider yet — one hardcoded 6-digit code is treated
 * as correct and everything else shows the error state. See
 * src/features/auth/dummyAuth.ts.
 */
export function PhoneOtpStep({ onVerified }: { onVerified: (phone: string) => void }) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [otpError, setOtpError] = useState(false);
  const otpInputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (!otpSent || resendIn <= 0) return;
    const timer = setInterval(() => setResendIn((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [otpSent, resendIn]);

  const canSendCode = phone.length >= 10;
  const otpFilled = otp.every(Boolean);

  function handleSendCode() {
    setOtpSent(true);
    setResendIn(RESEND_SECONDS);
    setOtp(Array(OTP_LENGTH).fill(""));
    setOtpError(false);
  }

  function handleResend() {
    if (resendIn > 0) return;
    setResendIn(RESEND_SECONDS);
    setOtp(Array(OTP_LENGTH).fill(""));
    setOtpError(false);
    otpInputs.current[0]?.focus();
  }

  function handleChangeNumber() {
    setOtpSent(false);
    setOtp(Array(OTP_LENGTH).fill(""));
    setOtpError(false);
  }

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    setOtpError(false);
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

  function handleVerify() {
    if (isDummyOtpCorrect(otp.join(""))) {
      onVerified(phone);
    } else {
      setOtpError(true);
    }
  }

  return (
    <>
      {!otpSent ? (
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
          <AppText style={styles.helpText}>We&apos;ll send a 6-digit verification code.</AppText>
          <ActionButton label="Send Code →" onPress={handleSendCode} disabled={!canSendCode} />
        </View>
      ) : (
        <View style={styles.otpBox}>
          <View style={styles.otpNotice}>
            <MaterialIcons name="mark-chat-unread" size={16} color={colors.primary} />
            <Text style={styles.otpNoticeText}>Code sent to +880 {phone}</Text>
            <Pressable accessibilityRole="button" onPress={handleChangeNumber}>
              <Text style={styles.changeNumber}>Change number</Text>
            </Pressable>
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
                style={[styles.otpDigit, otpError && styles.otpDigitError]}
              />
            ))}
          </View>
          {otpError ? (
            <View style={styles.errorBanner}>
              <MaterialIcons name="error" size={18} color={colors.dangerDark} />
              <Text style={styles.errorText}>That code doesn&apos;t look right. Try again.</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dismiss error"
                onPress={() => setOtpError(false)}
              >
                <MaterialIcons name="close" size={16} color={colors.dangerDark} />
              </Pressable>
            </View>
          ) : null}
          <View style={styles.otpFooter}>
            <Pressable
              accessibilityRole="button"
              onPress={handleResend}
              disabled={resendIn > 0}
              hitSlop={4}
            >
              <Text style={[styles.otpFooterText, resendIn <= 0 && styles.resendActive]}>
                {resendIn > 0 ? `Resend code in ${formatCountdown(resendIn)}` : "Resend SMS"}
              </Text>
            </Pressable>
          </View>
          <ActionButton label="Verify & Complete →" onPress={handleVerify} disabled={!otpFilled} />
        </View>
      )}
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
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  otpNotice: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  otpNoticeText: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    flexShrink: 1,
  },
  changeNumber: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 12,
    textDecorationLine: "underline",
  },
  otpRow: {
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
  },
  otpDigit: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 18,
    height: 48,
    textAlign: "center",
    width: 40,
  },
  otpDigitError: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
    color: colors.dangerDark,
  },
  errorBanner: {
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.sm,
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.sm,
  },
  errorText: {
    color: colors.dangerDark,
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  otpFooter: {
    alignItems: "center",
  },
  otpFooterText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  resendActive: {
    color: colors.primary,
    fontFamily: fonts.bold,
    textDecorationLine: "underline",
  },
});
