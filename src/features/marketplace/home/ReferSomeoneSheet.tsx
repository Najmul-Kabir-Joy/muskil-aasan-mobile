import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionButton, Badge, CaptionText } from "@/shared/components/ui";
import { colors, fonts, radius, shadows, spacing } from "@/theme/tokens";
import type { EligibleReferral, Task, WorkerProfile } from "@/types/domain";

const TOAST_DURATION_MS = 2500;

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/**
 * "Refer Someone" bottom sheet, opened from a Community Job's Refer action.
 * Referral is immediate — there is deliberately NO confirmation step here.
 * Tapping "Refer" on an eligible Job Seeker instantly shares their public
 * profile, shows a lightweight "Profile referred" toast, and flips that
 * row's own button to a disabled "Referred" state (guarding against a
 * duplicate referral from a repeated tap). See
 * docs/engineering/domain-and-terminology.md — referring someone does not
 * apply them to the job, share contact details, or affect job status.
 *
 * `eligibleReferrals` is a prop (derived by the caller via
 * `getEligibleReferrals()` in src/data/mock.ts) rather than computed inside
 * this component, so eligibility stays driven by data and this sheet stays
 * easy to test with either state directly.
 *
 * `job` is kept as the last-opened job even after `visible` turns false, so
 * its content doesn't flash empty while the Modal's own slide-down closing
 * animation plays.
 */
export function ReferSomeoneSheet({
  visible,
  onClose,
  job,
  eligibleReferrals,
}: {
  visible: boolean;
  onClose: () => void;
  job: Task | null;
  eligibleReferrals: EligibleReferral[];
}) {
  const insets = useSafeAreaInsets();
  const [referredWorkerIds, setReferredWorkerIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // A fresh job should never inherit a previous job's "Referred" state —
  // referring someone for one Community Job doesn't mean they're referred
  // for a different one.
  useEffect(() => {
    setReferredWorkerIds(new Set());
    setToastMessage(null);
  }, [job?.id]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  function handleRefer(worker: WorkerProfile) {
    if (referredWorkerIds.has(worker.id)) return;
    setReferredWorkerIds((current) => new Set(current).add(worker.id));
    const posterName = job?.postedBy?.name ?? "The job provider";
    setToastMessage(`${posterName} received ${worker.name}'s profile.`);
  }

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close Refer Someone overlay"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          {toastMessage ? (
            <View style={styles.toast}>
              <MaterialIcons name="check-circle" size={18} color={colors.primarySoft} />
              <View style={styles.toastTextColumn}>
                <Text style={styles.toastTitle}>Profile referred</Text>
                <Text style={styles.toastSubtitle}>{toastMessage}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.headerRow}>
            <View style={styles.headerTextColumn}>
              <Text style={styles.title}>Refer Someone</Text>
              <CaptionText>
                Recommend someone you&apos;ve previously worked with on Muskill Asaan.
              </CaptionText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close Refer Someone"
              onPress={onClose}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={20} color={colors.muted} />
            </Pressable>
          </View>

          {job ? (
            <View style={styles.jobContext}>
              <Text style={styles.jobContextLabel}>Referral for Community Job</Text>
              <Text style={styles.jobContextTitle}>{job.title}</Text>
              <CaptionText>
                {job.postedBy?.name} · {job.postedBy?.area}
              </CaptionText>
            </View>
          ) : null}

          {eligibleReferrals.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <MaterialIcons name="group-off" size={28} color={colors.muted} />
              </View>
              <Text style={styles.emptyTitle}>No one to refer yet</Text>
              <CaptionText style={styles.emptyBody}>
                Once you&apos;ve completed a job with someone through Muskill Asaan, you&apos;ll be
                able to recommend their profile here.
              </CaptionText>
              <ActionButton label="Got it, close" onPress={onClose} tone="secondary" />
            </View>
          ) : (
            <>
              <View style={styles.eligibleHeaderRow}>
                <Text style={styles.eligibleHeading}>
                  People you&apos;ve worked with ({eligibleReferrals.length})
                </Text>
                <View style={styles.privacyPill}>
                  <MaterialIcons name="lock" size={12} color={colors.muted} />
                  <Text style={styles.privacyPillText}>Public profile only</Text>
                </View>
              </View>

              <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {eligibleReferrals.map(({ worker, jobTitle }) => {
                  const isReferred = referredWorkerIds.has(worker.id);
                  return (
                    <View key={worker.id} style={styles.candidateCard}>
                      <View style={styles.candidateTopRow}>
                        <View style={styles.candidateAvatar}>
                          <Text style={styles.candidateAvatarText}>{initialsFor(worker.name)}</Text>
                        </View>
                        <View style={styles.candidateInfo}>
                          <Text style={styles.candidateName}>{worker.name}</Text>
                          <View style={styles.ratingRow}>
                            <MaterialIcons name="star" size={13} color={colors.secondaryDark} />
                            <Text style={styles.ratingText}>{worker.rating} Seeker Rating</Text>
                          </View>
                          <View style={styles.categoryRow}>
                            {worker.categories.map((category) => (
                              <Badge key={category} label={category} />
                            ))}
                          </View>
                        </View>
                        <ActionButton
                          label={isReferred ? "Referred" : "Refer"}
                          accessibilityLabel={
                            isReferred ? `${worker.name} referred` : `Refer ${worker.name}`
                          }
                          onPress={() => handleRefer(worker)}
                          disabled={isReferred}
                          icon={
                            <MaterialIcons
                              name={isReferred ? "check" : "send"}
                              size={14}
                              color={isReferred ? colors.muted : colors.card}
                            />
                          }
                        />
                      </View>
                      <View style={styles.previouslyHelpedRow}>
                        <MaterialIcons name="check" size={13} color={colors.primary} />
                        <CaptionText style={styles.previouslyHelpedText}>
                          Previously helped you with: {jobTitle}
                        </CaptionText>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              <CaptionText style={styles.footnote}>
                Only the Job Seeker&apos;s public profile will be shared. Referring someone does not
                apply them to the job.
              </CaptionText>
            </>
          )}
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
  toast: {
    alignItems: "center",
    backgroundColor: colors.inverted,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  toastTextColumn: {
    flex: 1,
    gap: 2,
  },
  toastTitle: {
    color: colors.card,
    fontFamily: fonts.extraBold,
    fontSize: 14,
  },
  toastSubtitle: {
    color: colors.border,
    fontFamily: fonts.medium,
    fontSize: 12,
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
  title: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 19,
  },
  closeButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  jobContext: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: 2,
    padding: spacing.md,
  },
  jobContextLabel: {
    color: colors.primary,
    fontFamily: fonts.extraBold,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  jobContextTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  emptyState: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  emptyIconCircle: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 16,
  },
  emptyBody: {
    textAlign: "center",
  },
  eligibleHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eligibleHeading: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 14,
  },
  privacyPill: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  privacyPillText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  list: {
    gap: spacing.sm,
  },
  candidateCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  candidateTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
  },
  candidateAvatar: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  candidateAvatarText: {
    color: colors.primaryDark,
    fontFamily: fonts.extraBold,
    fontSize: 14,
  },
  candidateInfo: {
    flex: 1,
    gap: spacing.xxs,
  },
  candidateName: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  ratingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
  },
  ratingText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xxs,
  },
  previouslyHelpedRow: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.xxs,
    paddingTop: spacing.sm,
  },
  previouslyHelpedText: {
    flexShrink: 1,
  },
  footnote: {
    textAlign: "center",
  },
});
