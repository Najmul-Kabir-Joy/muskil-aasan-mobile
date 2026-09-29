import { MaterialIcons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionButton, CaptionText } from "@/shared/components/ui";
import { BRAND_NAME } from "@/shared/constants/brand";
import { colors, fonts, radius, shadows, spacing } from "@/theme/tokens";
import type { ProfileVisibility } from "@/types/domain";

const OPTIONS: {
  value: ProfileVisibility;
  label: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  {
    value: "public",
    label: "Public",
    description: `Anyone on ${BRAND_NAME} can see this.`,
    icon: "visibility",
  },
  {
    value: "hidden",
    label: "Hidden",
    description: "Only you can see this. Its ratings still count toward your average.",
    icon: "visibility-off",
  },
];

/**
 * Owner-only Public / Hidden chooser for a profile section or one job. The
 * MVP has exactly these two states — no audiences beyond "everyone" and
 * "only me". Local prototype state only; nothing is persisted.
 *
 * `subject` stays set while the sheet slides closed, so the caller keeps it
 * separate from `visible` (same pattern as `CommunityJobOverflowSheet`).
 */
export function VisibilitySheet({
  visible,
  subject,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  subject: string;
  value: ProfileVisibility;
  onSelect: (value: ProfileVisibility) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close visibility options overlay"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.kicker}>Who can see this</Text>
              <Text style={styles.subject}>{subject}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close visibility options"
              onPress={onClose}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={20} color={colors.muted} />
            </Pressable>
          </View>

          <View style={styles.optionsCard}>
            {OPTIONS.map((option, index) => {
              const selected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityLabel={`${option.label}. ${option.description}`}
                  accessibilityState={{ selected }}
                  onPress={() => onSelect(option.value)}
                  style={[styles.optionRow, index > 0 && styles.optionDivider]}
                >
                  <View style={styles.optionIcon}>
                    <MaterialIcons name={option.icon} size={20} color={colors.primary} />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    <CaptionText>{option.description}</CaptionText>
                  </View>
                  {selected ? (
                    <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <ActionButton label="Cancel" onPress={onClose} tone="secondary" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.card,
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerText: {
    flex: 1,
    gap: spacing.xxs,
  },
  kicker: {
    color: colors.muted,
    fontFamily: fonts.extraBold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  subject: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 16,
  },
  closeButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  optionsCard: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  optionRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 56,
    padding: spacing.md,
  },
  optionDivider: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  optionIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  optionText: {
    flex: 1,
    gap: spacing.xxs,
  },
  optionLabel: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
});
