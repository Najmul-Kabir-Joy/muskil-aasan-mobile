import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PhoneOtpStep } from "@/features/auth/PhoneOtpStep";
import { BasicInfoStep } from "@/features/onboarding/BasicInfoStep";
import { IdDocs, IdVerificationStep } from "@/features/onboarding/IdVerificationStep";
import { ActionButton, AppHeader, Badge, ScrollScreen } from "@/shared/components/ui";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

const EMPTY_DOCS: IdDocs = { nidFront: null, nidBack: null, selfie: null };

export default function OnboardingScreen() {
  const router = useRouter();
  const { phone: verifiedPhone } = useLocalSearchParams<{ phone?: string }>();
  // Arriving from the login screen means the phone/OTP step already
  // happened there — don't ask for it again.
  const skipPhoneStep = typeof verifiedPhone === "string" && verifiedPhone.length > 0;

  const steps = skipPhoneStep
    ? ["Basic info", "ID verification"]
    : ["Basic info", "ID verification", "Phone verification"];

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [docs, setDocs] = useState<IdDocs>(EMPTY_DOCS);

  const isLastStep = step === steps.length - 1;
  const isPhoneStep = !skipPhoneStep && step === 2;
  const canContinueBasicInfo = name.trim().length >= 2;

  function finish() {
    // No backend yet — name/area/docs collected above are just discarded.
    // See docs/engineering/domain-and-terminology.md.
    router.replace("/(poster)");
  }

  function advance() {
    if (isLastStep) {
      finish();
    } else {
      setStep((value) => value + 1);
    }
  }

  return (
    <ScrollScreen>
      <AppHeader
        title="Create trust before the first job."
        subtitle="A few quick steps to set up your account."
      />

      <View style={styles.progress}>
        {steps.map((label, index) => (
          <View key={label} style={styles.stepRow}>
            <Badge label={`Step ${index + 1}`} tone={index <= step ? "success" : "neutral"} />
            <Text style={[styles.stepText, index === step && styles.activeStepText]}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.formCard}>
        {step === 0 ? (
          <BasicInfoStep name={name} onChangeName={setName} area={area} onChangeArea={setArea} />
        ) : null}

        {step === 1 ? (
          <>
            <View style={styles.skipRow}>
              <Pressable accessibilityRole="button" onPress={advance}>
                <Text style={styles.skipLabel}>Skip for now</Text>
              </Pressable>
            </View>
            <IdVerificationStep
              docs={docs}
              onCapture={(key, uri) => setDocs((current) => ({ ...current, [key]: uri }))}
            />
          </>
        ) : null}

        {isPhoneStep ? <PhoneOtpStep onVerified={finish} /> : null}

        <View style={styles.actions}>
          {step > 0 ? (
            <ActionButton label="Back" tone="secondary" onPress={() => setStep((v) => v - 1)} />
          ) : null}
          {!isPhoneStep ? (
            <ActionButton
              label={isLastStep ? "Finish" : "Continue"}
              onPress={advance}
              disabled={step === 0 && !canContinueBasicInfo}
            />
          ) : null}
        </View>
      </View>
    </ScrollScreen>
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
    fontFamily: fonts.bold,
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
  skipRow: {
    alignItems: "flex-end",
  },
  skipLabel: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
  },
});
