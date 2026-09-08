import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppText } from "@/shared/components/ui";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

export type BasicInfo = {
  name: string;
  area: string;
  email: string;
  gender: "" | "Male" | "Female" | "Other";
  dob: string;
  avatarUri: string | null;
};

export const EMPTY_BASIC_INFO: BasicInfo = {
  name: "",
  area: "",
  email: "",
  gender: "",
  dob: "",
  avatarUri: null,
};

const DHAKA_AREAS = [
  "Dhanmondi",
  "Mirpur 1",
  "Mirpur 10",
  "Gulshan 1",
  "Gulshan 2",
  "Banani",
  "Uttara",
  "Mohammadpur",
  "Badda",
  "Old Dhaka (Puran Dhaka)",
  "Bashundhara R/A",
  "Khilgaon",
];

const GENDERS: { value: "Male" | "Female" | "Other"; icon: "male" | "female" | "transgender" }[] = [
  { value: "Male", icon: "male" },
  { value: "Female", icon: "female" },
  { value: "Other", icon: "transgender" },
];

function formatDob(rawValue: string) {
  const digits = rawValue.replace(/\D/g, "").slice(0, 8);
  let formatted = digits.slice(0, 2);
  if (digits.length > 2) formatted += " / " + digits.slice(2, 4);
  if (digits.length > 4) formatted += " / " + digits.slice(4, 8);
  return formatted;
}

export function BasicInfoStep({
  value,
  onChange,
  phoneVerified,
}: {
  value: BasicInfo;
  onChange: (patch: Partial<BasicInfo>) => void;
  phoneVerified?: string;
}) {
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);

  async function pickAvatar(source: "camera" | "gallery") {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Enable access in your device settings to add a profile picture.",
      );
      return;
    }
    try {
      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true })
          : await ImagePicker.launchImageLibraryAsync({ quality: 0.6, allowsEditing: true });
      const uri = result.assets?.[0]?.uri;
      if (!result.canceled && uri) {
        onChange({ avatarUri: uri });
      }
    } catch {
      Alert.alert("Something went wrong", "Try again in a moment.");
    }
  }

  function handleAddPhoto() {
    Alert.alert("Add a profile picture", undefined, [
      { text: "Take Photo", onPress: () => pickAvatar("camera") },
      { text: "Choose from Gallery", onPress: () => pickAvatar("gallery") },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function toggleGender(gender: "Male" | "Female" | "Other") {
    onChange({ gender: value.gender === gender ? "" : gender });
  }

  return (
    <View style={styles.container}>
      {phoneVerified ? (
        <View style={styles.verifiedPill}>
          <MaterialIcons name="verified" size={14} color={colors.primary} />
          <Text style={styles.verifiedPillText}>Phone verified (+880 {phoneVerified})</Text>
        </View>
      ) : null}

      <Pressable accessibilityRole="button" onPress={handleAddPhoto} style={styles.avatarPod}>
        <View style={styles.avatarWrap}>
          {value.avatarUri ? (
            <Image source={{ uri: value.avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialIcons name="person" size={28} color={colors.muted} />
            </View>
          )}
          <View style={styles.avatarBadge}>
            <MaterialIcons name="add-a-photo" size={14} color={colors.card} />
          </View>
        </View>
        <View style={styles.avatarText}>
          <Text style={styles.avatarTitle}>Add a profile picture</Text>
          <AppText style={styles.avatarSubtitle}>Optional</AppText>
        </View>
      </Pressable>

      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            Full name <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.hint}>As on NID</Text>
        </View>
        <TextInput
          value={value.name}
          onChangeText={(text) => onChange({ name: text })}
          placeholder="e.g. Tanvir Hossain"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            Current area in Dhaka <Text style={styles.required}>*</Text>
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => setAreaPickerOpen(true)}
          style={styles.areaSelect}
        >
          <MaterialIcons name="location-on" size={18} color={colors.primary} />
          <Text style={[styles.areaSelectText, !value.area && styles.placeholderText]}>
            {value.area || "Select your area (e.g. Dhanmondi, Mirpur)"}
          </Text>
          <MaterialIcons name="expand-more" size={20} color={colors.muted} />
        </Pressable>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email address (Optional)</Text>
        <TextInput
          value={value.email}
          onChangeText={(text) => onChange({ email: text })}
          placeholder="name@example.com"
          placeholderTextColor={colors.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Gender (Optional)</Text>
        <View style={styles.genderRow}>
          {GENDERS.map((gender) => {
            const selected = value.gender === gender.value;
            return (
              <Pressable
                key={gender.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => toggleGender(gender.value)}
                style={[styles.genderChip, selected && styles.genderChipActive]}
              >
                <MaterialIcons
                  name={gender.icon}
                  size={16}
                  color={selected ? colors.card : colors.muted}
                />
                <Text style={[styles.genderChipText, selected && styles.genderChipTextActive]}>
                  {gender.value}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Date of birth (Optional)</Text>
        <View style={styles.dobRow}>
          <TextInput
            value={value.dob}
            onChangeText={(text) => onChange({ dob: formatDob(text) })}
            placeholder="DD / MM / YYYY"
            placeholderTextColor={colors.muted}
            keyboardType="number-pad"
            maxLength={14}
            style={[styles.input, styles.dobInput]}
          />
          <MaterialIcons name="calendar-today" size={18} color={colors.muted} />
        </View>
      </View>

      <Modal
        visible={areaPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setAreaPickerOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setAreaPickerOpen(false)} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select your area</Text>
          <FlatList
            data={DHAKA_AREAS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onChange({ area: item });
                  setAreaPickerOpen(false);
                }}
                style={styles.modalRow}
              >
                <Text style={styles.modalRowText}>{item}</Text>
                {value.area === item ? (
                  <MaterialIcons name="check" size={18} color={colors.primary} />
                ) : null}
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  verifiedPill: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  verifiedPillText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  avatarPod: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  avatarWrap: {
    position: "relative",
  },
  avatarImage: {
    borderRadius: radius.pill,
    height: 56,
    width: 56,
  },
  avatarPlaceholder: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  avatarBadge: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    bottom: -2,
    height: 22,
    justifyContent: "center",
    position: "absolute",
    right: -2,
    width: 22,
  },
  avatarText: {
    flex: 1,
    gap: 2,
  },
  avatarTitle: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  avatarSubtitle: {
    color: colors.muted,
    fontSize: 12,
  },
  field: {
    gap: spacing.xs,
  },
  labelRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    paddingLeft: spacing.xs,
  },
  required: {
    color: colors.danger,
  },
  hint: {
    color: colors.muted,
    fontSize: 11,
  },
  input: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  dobRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  dobInput: {
    flex: 1,
    paddingRight: spacing.xxl,
  },
  areaSelect: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  areaSelectText: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  placeholderText: {
    color: colors.muted,
    fontFamily: fonts.regular,
  },
  genderRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  genderChip: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flex: 1,
    flexDirection: "row",
    gap: spacing.xxs,
    justifyContent: "center",
    minHeight: 40,
  },
  genderChipActive: {
    backgroundColor: colors.primary,
  },
  genderChipText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  genderChipTextActive: {
    color: colors.card,
    fontFamily: fonts.bold,
  },
  modalBackdrop: {
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    flex: 1,
  },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: "70%",
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  modalTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  modalRow: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  modalRowText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
});
