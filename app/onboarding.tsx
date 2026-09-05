import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { ActionButton, AppHeader, Badge, PrimaryButton, Screen, SectionHeader, SelectableChip } from "@/components/ui";
import { colors, radius, spacing } from "@/theme/tokens";

const steps = ["Phone number", "OTP verification", "Basic profile", "Choose mode"];
const roles = ["Poster mode", "Job seeker mode", "Both modes"];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("+880");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("I need help");

  const canContinue = useMemo(() => {
    if (step === 0) return phone.length >= 8;
    if (step === 1) return otp.length >= 4;
    if (step === 2) return name.trim().length >= 2;
    return Boolean(role);
  }, [name, otp, phone, role, step]);

  return (
    <Screen>
      <AppHeader
        title="Create trust before the first job."
        subtitle="Every user can use both modes. Start with the mode you need now and switch later from profile."
      />

      <View style={styles.progress}>
        {steps.map((stepLabel, index) => (
          <View key={stepLabel} style={styles.stepRow}>
            <Badge label={`Step ${index + 1}`} tone={index <= step ? "success" : "neutral"} />
            <Text style={[styles.stepText, index === step && styles.activeStepText]}>{stepLabel}</Text>
          </View>
        ))}
      </View>

      <View style={styles.formCard}>
        <SectionHeader title={steps[step]} />
        {step === 0 ? (
          <>
            <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />
            <Text style={styles.helpText}>We use your number to protect jobs and offers.</Text>
          </>
        ) : null}
        {step === 1 ? (
          <>
            <TextInput value={otp} onChangeText={setOtp} keyboardType="number-pad" placeholder="Enter 4 digit OTP" placeholderTextColor={colors.muted} style={styles.input} />
            <Text style={styles.helpText}>Mock OTP accepts any 4 digits. Resend and expired states can be checked in this step.</Text>
          </>
        ) : null}
        {step === 2 ? (
          <>
            <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.muted} style={styles.input} />
            <TextInput placeholder="Area in Dhaka" placeholderTextColor={colors.muted} style={styles.input} />
          </>
        ) : null}
        {step === 3 ? (
          <View style={styles.chips}>
            {roles.map((item) => (
              <SelectableChip key={item} label={item} selected={role === item} onPress={() => setRole(item)} />
            ))}
          </View>
        ) : null}
        <View style={styles.actions}>
          {step > 0 ? <ActionButton label="Back" onPress={() => setStep((value) => value - 1)} tone="secondary" /> : null}
          {step < steps.length - 1 ? (
            <ActionButton label="Continue" onPress={() => setStep((value) => value + 1)} disabled={!canContinue} />
          ) : (
            <PrimaryButton label="Enter prototype" href={role === "Job seeker mode" ? "/(worker)/jobs" : "/(poster)"} />
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: {
    gap: spacing.md,
  },
  stepRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  stepText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  activeStepText: {
    color: colors.primary,
  },
  formCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  input: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  helpText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
  },
});
