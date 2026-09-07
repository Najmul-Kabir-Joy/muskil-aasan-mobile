import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PhoneOtpStep } from "@/features/auth/PhoneOtpStep";
import { BasicInfo, BasicInfoStep, EMPTY_BASIC_INFO } from "@/features/onboarding/BasicInfoStep";
import { IdDocs, IdVerificationStep } from "@/features/onboarding/IdVerificationStep";
import {
  MAX_PREFERRED_CATEGORIES,
  PrimaryUseCase,
  UseCaseStep,
} from "@/features/onboarding/UseCaseStep";
import { ActionButton, AppHeader, ScrollScreen } from "@/shared/components/ui";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

const EMPTY_DOCS: IdDocs = { nidFront: null, nidBack: null, selfie: null };

type ScreenKey = "basicInfo" | "useCase" | "identity" | "phone";

// The primary-use-case screen is a real screen in the flow (own Back/
// Continue), but it's "silent": it doesn't get counted or labeled in the
// visible step progress, which only tracks Basic info / Identity
// verification / Phone verification.
function displayIndexFor(screen: ScreenKey): number {
  switch (screen) {
    case "identity":
      return 1;
    case "phone":
      return 2;
    default:
      return 0;
  }
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { phone: verifiedPhone } = useLocalSearchParams<{ phone?: string }>();
  // Arriving from the login screen means the phone/OTP step already
  // happened there — don't ask for it again.
  const skipPhoneStep = typeof verifiedPhone === "string" && verifiedPhone.length > 0;

  const screens: ScreenKey[] = skipPhoneStep
    ? ["basicInfo", "useCase", "identity"]
    : ["basicInfo", "useCase", "identity", "phone"];
  const displaySteps = skipPhoneStep
    ? ["Basic info", "Identity verification"]
    : ["Basic info", "Identity verification", "Phone verification"];

  const [step, setStep] = useState(0);
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(EMPTY_BASIC_INFO);
  const [useCase, setUseCase] = useState<PrimaryUseCase>("");
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [docs, setDocs] = useState<IdDocs>(EMPTY_DOCS);

  const currentScreen = screens[step];
  const isLastStep = step === screens.length - 1;
  const isPhoneStep = currentScreen === "phone";
  const showProgress = currentScreen !== "useCase";
  const displayIndex = displayIndexFor(currentScreen);
  const canContinueBasicInfo = basicInfo.name.trim().length >= 2 && basicInfo.area.length > 0;

  function finish() {
    // No backend yet — basicInfo/useCase/preferredCategories/docs collected
    // above are just discarded. See docs/engineering/domain-and-terminology.md.
    router.replace(useCase === "jobSeeker" ? "/(worker)/jobs" : "/(poster)");
  }

  function advance() {
    if (isLastStep) {
      finish();
    } else {
      setStep((value) => value + 1);
    }
  }

  function handleChangeUseCase(value: PrimaryUseCase) {
    setUseCase(value);
    if (value !== "jobSeeker") {
      setPreferredCategories([]);
    }
  }

  function toggleCategory(categoryId: string) {
    setPreferredCategories((current) => {
      if (current.includes(categoryId)) {
        return current.filter((id) => id !== categoryId);
      }
      if (current.length >= MAX_PREFERRED_CATEGORIES) {
        return current;
      }
      return [...current, categoryId];
    });
  }

  return (
    <ScrollScreen>
      <AppHeader
        title="Create trust before the first job."
        subtitle="A few quick steps to set up your account."
      />

      {showProgress ? (
        <View style={styles.progress}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>
              Step {displayIndex + 1} of {displaySteps.length}
            </Text>
            <Text style={styles.progressStepName}>{displaySteps[displayIndex]}</Text>
          </View>
          <View style={styles.progressBar}>
            {displaySteps.map((label, index) => (
              <View
                key={label}
                style={[
                  styles.progressSegment,
                  index <= displayIndex && styles.progressSegmentActive,
                ]}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.formCard}>
        {currentScreen === "basicInfo" ? (
          <BasicInfoStep
            value={basicInfo}
            onChange={(patch) => setBasicInfo((current) => ({ ...current, ...patch }))}
            phoneVerified={skipPhoneStep ? verifiedPhone : undefined}
          />
        ) : null}

        {currentScreen === "useCase" ? (
          <>
            <View style={styles.skipRow}>
              <Pressable accessibilityRole="button" onPress={advance}>
                <Text style={styles.skipLabel}>I&apos;m not sure yet</Text>
              </Pressable>
            </View>
            <UseCaseStep
              useCase={useCase}
              onChangeUseCase={handleChangeUseCase}
              selectedCategories={preferredCategories}
              onToggleCategory={toggleCategory}
            />
          </>
        ) : null}

        {currentScreen === "identity" ? (
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
              disabled={currentScreen === "basicInfo" && !canContinueBasicInfo}
            />
          ) : null}
        </View>
      </View>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  progress: {
    gap: spacing.xs,
  },
  progressLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  progressStepName: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  progressBar: {
    flexDirection: "row",
    gap: spacing.xxs,
  },
  progressSegment: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    flex: 1,
    height: 6,
  },
  progressSegmentActive: {
    backgroundColor: colors.primary,
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
