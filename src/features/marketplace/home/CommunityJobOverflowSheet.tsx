import { MaterialIcons } from "@expo/vector-icons";
import { Alert, Modal, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionButton, CaptionText } from "@/shared/components/ui";
import { colors, fonts, radius, shadows, spacing } from "@/theme/tokens";
import type { Task } from "@/types/domain";

/**
 * The Community Job card's single "more options" sheet (top-right `...` on
 * `CommunityPostCard`). Exactly three actions on purpose — Share Job, Report
 * Job, Cancel — per the Stitch "Community Job — Three-Dot Overflow Action
 * Sheet" design. Do not add Save/bidding/messaging actions here; Refer
 * already has its own visible card action.
 *
 * Share uses React Native's built-in `Share` API directly — the smallest
 * safe platform abstraction available, and there's no existing project-level
 * share helper to reuse instead. Report is a lightweight, local-only
 * acknowledgement (no moderation backend exists in this prototype).
 */
export function CommunityJobOverflowSheet({
  visible,
  onClose,
  job,
}: {
  visible: boolean;
  onClose: () => void;
  job: Task | null;
}) {
  const insets = useSafeAreaInsets();

  async function handleShare() {
    if (!job) return;
    onClose();
    try {
      await Share.share({
        message: `${job.title} — ${job.budget} · ${job.area}\nPosted on MuSkill Aasan.`,
      });
    } catch {
      // Share sheet dismissed/cancelled by the user — nothing else to do.
    }
  }

  function handleReport() {
    onClose();
    Alert.alert("Job reported", "Report recorded for this prototype.");
  }

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close job options overlay"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextColumn}>
              <Text style={styles.kicker}>Job Options</Text>
              {job ? (
                <>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <CaptionText>
                    Posted by {job.postedBy?.name} · {job.postedBy?.area}
                  </CaptionText>
                </>
              ) : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close job options"
              onPress={onClose}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={20} color={colors.muted} />
            </Pressable>
          </View>

          <View style={styles.optionsCard}>
            <Pressable accessibilityRole="button" onPress={handleShare} style={styles.optionRow}>
              <View style={styles.optionIcon}>
                <MaterialIcons name="share" size={20} color={colors.primary} />
              </View>
              <View style={styles.optionTextColumn}>
                <Text style={styles.optionLabel}>Share Job</Text>
                <CaptionText>Share this job&apos;s details as text</CaptionText>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={handleReport}
              style={[styles.optionRow, styles.optionRowDivider]}
            >
              <View style={[styles.optionIcon, styles.optionIconDanger]}>
                <MaterialIcons name="flag" size={20} color={colors.danger} />
              </View>
              <View style={styles.optionTextColumn}>
                <Text style={[styles.optionLabel, styles.optionLabelDanger]}>Report Job</Text>
                <CaptionText>Report inappropriate, spam, or misleading post</CaptionText>
              </View>
            </Pressable>
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
  headerTextColumn: {
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
  jobTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 16,
  },
  closeButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  optionsCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  optionRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  optionRowDivider: {
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
  optionIconDanger: {
    backgroundColor: colors.dangerSoft,
  },
  optionTextColumn: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  optionLabelDanger: {
    color: colors.danger,
  },
});
