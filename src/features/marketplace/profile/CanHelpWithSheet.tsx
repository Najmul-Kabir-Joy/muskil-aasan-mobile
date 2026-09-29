import { MaterialIcons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionButton, CaptionText, SelectableChip } from "@/shared/components/ui";
import { categories } from "@/data/mock";
import { colors, fonts, radius, shadows, spacing } from "@/theme/tokens";

/**
 * Owner-only picker behind "+ Add Skill": toggles categories from the
 * app-wide `categories` list on the Seeker Profile's "Can Help With". Local
 * prototype state only — nothing is saved, and no rule (such as a maximum)
 * is applied, because none is defined.
 */
export function CanHelpWithSheet({
  visible,
  selected,
  onToggle,
  onClose,
}: {
  visible: boolean;
  selected: string[];
  onToggle: (categoryLabel: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close Can Help With overlay"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.kicker}>Can Help With</Text>
              <Text style={styles.title}>Choose the kinds of jobs you can help with</Text>
              <CaptionText>{selected.length} selected</CaptionText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close Can Help With"
              onPress={onClose}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={20} color={colors.muted} />
            </Pressable>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.chips}>
            {categories.map((category) => (
              <SelectableChip
                key={category.id}
                label={category.label}
                selected={selected.includes(category.label)}
                onPress={() => onToggle(category.label)}
              />
            ))}
          </ScrollView>

          <ActionButton label="Done" onPress={onClose} />
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
    maxHeight: "85%",
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
  title: {
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
  scroll: {
    flexGrow: 0,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
