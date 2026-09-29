import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

export type JobFilterOption = {
  id: string;
  label: string;
  // How many responses this option shows — rendered as a small count badge.
  count: number;
};

// A very long Job title would otherwise make one chip wider than the screen;
// cap the label and ellipsize instead.
const CHIP_LABEL_MAX_WIDTH = 200;

/**
 * The Responses List's horizontal Job selector: "All Jobs" plus one chip per
 * Job that has responses, each with its response count, per the "Provider
 * Responses — List View" Stitch design. Prototype-local filtering only —
 * selection state lives in the caller.
 *
 * Bleeds to the screen edges (negative margin equal to the page gutter, then
 * re-padded inside) so chips scroll under the edge instead of clipping at the
 * gutter. The gutter value matches `ScrollScreen`'s own padding.
 */
export function JobFilterChips({
  options,
  selectedId,
  onSelect,
}: {
  options: JobFilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      {options.map((option) => {
        const selected = option.id === selectedId;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onSelect(option.id)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text
              numberOfLines={1}
              style={[styles.chipLabel, selected && styles.chipLabelSelected]}
            >
              {option.label}
            </Text>
            <View style={[styles.count, selected && styles.countSelected]}>
              <Text style={[styles.countText, selected && styles.countTextSelected]}>
                {option.count}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    marginHorizontal: -spacing.lg,
  },
  row: {
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chip: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 40,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipLabel: {
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 13,
    maxWidth: CHIP_LABEL_MAX_WIDTH,
  },
  chipLabelSelected: {
    color: colors.card,
  },
  count: {
    alignItems: "center",
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    justifyContent: "center",
    minWidth: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  countSelected: {
    backgroundColor: colors.primaryDark,
  },
  countText: {
    color: colors.muted,
    fontFamily: fonts.extraBold,
    fontSize: 10,
  },
  countTextSelected: {
    color: colors.card,
  },
});
