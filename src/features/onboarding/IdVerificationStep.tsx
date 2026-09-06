import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { AppText } from "@/shared/components/ui";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

export type IdDocs = {
  nidFront: string | null;
  nidBack: string | null;
  selfie: string | null;
};

const SLOTS: {
  key: keyof IdDocs;
  label: string;
  icon: "badge" | "face";
  cameraType?: ImagePicker.CameraType;
}[] = [
  { key: "nidFront", label: "NID — front side", icon: "badge" },
  { key: "nidBack", label: "NID — back side", icon: "badge" },
  {
    key: "selfie",
    label: "Selfie for verification",
    icon: "face",
    cameraType: ImagePicker.CameraType.front,
  },
];

/**
 * Real camera capture (no mock/placeholder photos) via expo-image-picker.
 * There is no backend to send these to yet — captured URIs just live in this
 * screen's local state and are discarded on navigation. The whole step is
 * skippable; see app/onboarding.tsx.
 */
export function IdVerificationStep({
  docs,
  onCapture,
}: {
  docs: IdDocs;
  onCapture: (key: keyof IdDocs, uri: string) => void;
}) {
  async function capture(key: keyof IdDocs, cameraType?: ImagePicker.CameraType) {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Camera access needed",
          "Enable camera permission in your device settings to take this photo.",
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        cameraType,
        quality: 0.6,
        allowsEditing: true,
      });
      const uri = result.assets?.[0]?.uri;
      if (!result.canceled && uri) {
        onCapture(key, uri);
      }
    } catch {
      // No physical camera (e.g. iOS Simulator) or another camera-launch
      // failure — fail soft rather than crash, since this step is skippable.
      Alert.alert("Camera unavailable", "Try again on a device with a working camera.");
    }
  }

  return (
    <View style={styles.container}>
      <AppText style={styles.intro}>
        Verifying your NID helps other users trust you. You can add this later from your profile if
        you&apos;d rather skip it now.
      </AppText>
      {SLOTS.map((slot) => {
        const uri = docs[slot.key];
        return (
          <Pressable
            key={slot.key}
            accessibilityRole="button"
            onPress={() => capture(slot.key, slot.cameraType)}
            style={styles.slot}
          >
            {uri ? (
              <Image source={{ uri }} style={styles.preview} />
            ) : (
              <View style={styles.placeholder}>
                <MaterialIcons name="photo-camera" size={22} color={colors.muted} />
              </View>
            )}
            <View style={styles.slotText}>
              <Text style={styles.slotLabel}>{slot.label}</Text>
              <Text style={styles.slotHint}>{uri ? "Retake photo" : "Tap to take a photo"}</Text>
            </View>
            {uri ? (
              <MaterialIcons name="check-circle" size={20} color={colors.primary} />
            ) : (
              <MaterialIcons name="camera-alt" size={20} color={colors.muted} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  intro: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  slot: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.sm,
  },
  placeholder: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  preview: {
    borderRadius: radius.sm,
    height: 48,
    width: 48,
  },
  slotText: {
    flex: 1,
    gap: 2,
  },
  slotLabel: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  slotHint: {
    color: colors.muted,
    fontSize: 12,
  },
});
