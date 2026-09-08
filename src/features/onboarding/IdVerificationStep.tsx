import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { AppText } from "@/shared/components/ui";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

export type IdDocs = {
  nidFront: string | null;
  nidBack: string | null;
  selfie: string | null;
};

type NidSlotKey = "nidFront" | "nidBack";

const NID_SLOTS: {
  key: NidSlotKey;
  title: string;
  hint: string;
  icon: "badge" | "contact-mail";
}[] = [
  {
    key: "nidFront",
    title: "Upload front of NID",
    hint: "Make sure name and photo are clear",
    icon: "badge",
  },
  {
    key: "nidBack",
    title: "Upload back of NID",
    hint: "Check that address and barcode are visible",
    icon: "contact-mail",
  },
];

/**
 * Real camera/gallery capture (no mock/placeholder photos) via
 * expo-image-picker. There is no backend to send these to yet, and no OCR or
 * face-match runs on the captured photos — captured URIs just live in this
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
  const [whyExpanded, setWhyExpanded] = useState(false);

  async function captureFrom(key: keyof IdDocs, source: "camera" | "gallery") {
    try {
      const permission =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission needed",
          source === "camera"
            ? "Enable camera permission in your device settings to take this photo."
            : "Enable photo library permission in your device settings to choose this photo.",
        );
        return;
      }
      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true })
          : await ImagePicker.launchImageLibraryAsync({ quality: 0.6, allowsEditing: true });
      const uri = result.assets?.[0]?.uri;
      if (!result.canceled && uri) {
        onCapture(key, uri);
      }
    } catch {
      // No physical camera (e.g. iOS Simulator) or another capture failure —
      // fail soft rather than crash, since this step is skippable.
      Alert.alert("Something went wrong", "Try again in a moment.");
    }
  }

  async function captureSelfie() {
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
        cameraType: ImagePicker.CameraType.front,
        quality: 0.6,
        allowsEditing: true,
      });
      const uri = result.assets?.[0]?.uri;
      if (!result.canceled && uri) {
        onCapture("selfie", uri);
      }
    } catch {
      Alert.alert("Camera unavailable", "Try again on a device with a working camera.");
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>Optional step</Text>
        <Text style={styles.title}>Verify your identity</Text>
        <AppText style={styles.subtitle}>You can add this now or skip and do it later.</AppText>
        <Pressable
          accessibilityRole="button"
          onPress={() => setWhyExpanded((current) => !current)}
          style={styles.whyLink}
        >
          <MaterialIcons name="info" size={16} color={colors.primary} />
          <Text style={styles.whyLinkText}>Why do we ask for this?</Text>
        </Pressable>
        {whyExpanded ? (
          <AppText style={styles.whyBody}>
            This information may be used for identity-related features later.
          </AppText>
        ) : null}
      </View>

      {NID_SLOTS.map((slot) => {
        const uri = docs[slot.key];
        return (
          <View key={slot.key} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <MaterialIcons name={slot.icon} size={22} color={colors.primary} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>{slot.title}</Text>
                <AppText style={styles.cardHint}>{slot.hint}</AppText>
              </View>
              {uri ? (
                <View style={styles.uploadedPill}>
                  <MaterialIcons name="check-circle" size={14} color={colors.card} />
                  <Text style={styles.uploadedPillText}>Uploaded</Text>
                </View>
              ) : null}
            </View>

            {uri ? (
              <Image source={{ uri }} style={styles.docPreview} />
            ) : (
              <View style={styles.emptyPreview}>
                <MaterialIcons name="image" size={22} color={colors.muted} />
                <Text style={styles.emptyPreviewText}>No photo yet</Text>
              </View>
            )}

            <View style={styles.actionRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => captureFrom(slot.key, "camera")}
                style={styles.actionButton}
              >
                <MaterialIcons name="photo-camera" size={16} color={colors.text} />
                <Text style={styles.actionButtonText}>{uri ? "Retake Photo" : "Take Photo"}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => captureFrom(slot.key, "gallery")}
                style={styles.actionButton}
              >
                <MaterialIcons name="image" size={16} color={colors.text} />
                <Text style={styles.actionButtonText}>Gallery</Text>
              </Pressable>
            </View>
          </View>
        );
      })}

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <MaterialIcons name="account-circle" size={22} color={colors.primary} />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle}>Take a photo of yourself</Text>
            <AppText style={styles.cardHint}>
              Use your camera to take a clear photo of your face.
            </AppText>
          </View>
          {docs.selfie ? (
            <View style={styles.uploadedPill}>
              <MaterialIcons name="check-circle" size={14} color={colors.card} />
              <Text style={styles.uploadedPillText}>Photo captured</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.selfiePreviewRow}>
          {docs.selfie ? (
            <Image source={{ uri: docs.selfie }} style={styles.selfiePreview} />
          ) : (
            <View style={styles.selfiePlaceholder}>
              <MaterialIcons name="person" size={32} color={colors.muted} />
            </View>
          )}
        </View>

        <Pressable accessibilityRole="button" onPress={captureSelfie} style={styles.cameraButton}>
          <MaterialIcons name="photo-camera" size={18} color={colors.card} />
          <Text style={styles.cameraButtonText}>
            {docs.selfie ? "Retake photo" : "Open Camera"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.tip}>
        <MaterialIcons name="lightbulb" size={20} color={colors.secondaryDark} />
        <AppText style={styles.tipText}>
          Tip: Good natural lighting helps avoid blurry photos.
        </AppText>
      </View>

      <View style={styles.privacyNote}>
        <MaterialIcons name="lock" size={18} color={colors.muted} />
        <AppText style={styles.privacyText}>
          Photos stay on this device for this prototype and are not uploaded anywhere.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 11,
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
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
  whyLink: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
  },
  whyLinkText: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  whyBody: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
  },
  cardIcon: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  cardHeaderText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  cardHint: {
    color: colors.muted,
    fontSize: 12,
  },
  uploadedPill: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  uploadedPillText: {
    color: colors.card,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  emptyPreview: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    gap: spacing.xxs,
    justifyContent: "center",
    paddingVertical: spacing.md,
  },
  emptyPreviewText: {
    color: colors.muted,
    fontSize: 12,
  },
  docPreview: {
    borderRadius: radius.sm,
    height: 100,
    width: "100%",
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flex: 1,
    flexDirection: "row",
    gap: spacing.xxs,
    height: 40,
    justifyContent: "center",
  },
  actionButtonText: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  selfiePreviewRow: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  selfiePlaceholder: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  selfiePreview: {
    borderRadius: radius.pill,
    height: 72,
    width: 72,
  },
  cameraButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs,
    height: 44,
    justifyContent: "center",
  },
  cameraButtonText: {
    color: colors.card,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  tip: {
    alignItems: "center",
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  tipText: {
    color: colors.muted,
    flex: 1,
    fontSize: 12,
  },
  privacyNote: {
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  privacyText: {
    color: colors.muted,
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
