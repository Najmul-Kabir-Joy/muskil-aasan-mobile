import { MaterialIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { firstNameOf } from "@/features/marketplace/profile/profileHelpers";
import { APPLICATION_STAGES } from "@/features/marketplace/seeker/applicationStage";
import {
  BudgetTag,
  CategoryTag,
  JobPlaceAndTime,
  PostedBy,
} from "@/features/marketplace/seeker/SeekerJobCard";
import { ActionButton, CaptionText } from "@/shared/components/ui";
import { colors, fonts, radius, shadows, spacing } from "@/theme/tokens";
import type { SeekerApplication, Task } from "@/types/domain";

// Enough for a few sentences; long enough for Bangla, which runs longer.
export const RESPONSE_MAX_LENGTH = 500;

/**
 * A Job's full details, and the Job Seeker's private Response to it.
 *
 * The Response is a single message — the smallest shape the prototype
 * already has (`JobResponse.message`). The final application fields are
 * undefined, so there's deliberately no price, bid, availability, phone or
 * attachment field. Only the Job's Provider sees it.
 *
 * With an existing `application`, the sheet shows what was sent instead of
 * a form (editing or withdrawing a Response isn't defined). After sending,
 * it confirms in place and points to Applications.
 *
 * The caller mounts this per job (keyed by id), so the draft and "sent"
 * state never leak from one job to the next — and outside its screen's
 * ScrollView: a Modal nested in a ScrollView still receives touches through
 * it, so that ScrollView would spend the first tap on Send dismissing the
 * keyboard instead.
 */
export function JobResponseSheet({
  job,
  application,
  onSend,
  onViewApplications,
  onClose,
}: {
  job: Task;
  application?: SeekerApplication;
  onSend: (message: string) => void;
  onViewApplications: () => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [justSent, setJustSent] = useState(false);
  const providerFirstName = job.postedBy ? firstNameOf(job.postedBy.name) : "the Job Provider";
  const canSend = message.trim().length > 0;
  const scrollRef = useRef<ScrollView>(null);

  function handleSend() {
    if (!canSend) return;
    onSend(message);
    setJustSent(true);
  }

  return (
    <Modal transparent visible animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.root}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close job details overlay"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <Text style={styles.kicker}>{justSent ? "" : "Job details"}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close job details"
              onPress={onClose}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={20} color={colors.muted} />
            </Pressable>
          </View>

          {justSent ? (
            <SentConfirmation
              providerFirstName={providerFirstName}
              onViewApplications={onViewApplications}
              onClose={onClose}
            />
          ) : (
            <>
              <ScrollView
                ref={scrollRef}
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.topRow}>
                  <CategoryTag category={job.category} />
                  <BudgetTag budget={job.budget} />
                </View>
                <Text style={styles.title}>{job.title}</Text>
                <JobPlaceAndTime job={job} />
                <Text style={styles.description}>{job.description}</Text>
                <View style={styles.postedByRow}>
                  <PostedBy job={job} />
                </View>

                {application ? (
                  <SentResponse application={application} providerFirstName={providerFirstName} />
                ) : (
                  <View style={styles.form}>
                    <Text style={styles.fieldLabel}>Your response</Text>
                    <TextInput
                      accessibilityLabel="Your response"
                      value={message}
                      onChangeText={(text) => setMessage(text.slice(0, RESPONSE_MAX_LENGTH))}
                      // Keeps the field and its privacy note in view above the
                      // keyboard, which shrinks the scroll area.
                      onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd(), 250)}
                      maxLength={RESPONSE_MAX_LENGTH}
                      multiline
                      placeholder="Say how you can help and when you're free."
                      placeholderTextColor={colors.muted}
                      style={styles.input}
                      textAlignVertical="top"
                    />
                    <View style={styles.formFooter}>
                      <View style={styles.privateNote}>
                        <MaterialIcons name="lock-outline" size={14} color={colors.muted} />
                        <CaptionText style={styles.privateNoteText}>
                          Only {providerFirstName} will see your response.
                        </CaptionText>
                      </View>
                      <CaptionText>
                        {message.length}/{RESPONSE_MAX_LENGTH}
                      </CaptionText>
                    </View>
                  </View>
                )}
              </ScrollView>

              {application ? (
                <ActionButton label="View in Applications" onPress={onViewApplications} />
              ) : (
                <ActionButton label="Send response" onPress={handleSend} disabled={!canSend} />
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function SentResponse({
  application,
  providerFirstName,
}: {
  application: SeekerApplication;
  providerFirstName: string;
}) {
  const { label, icon, background, text } = APPLICATION_STAGES[application.stage];
  return (
    <View style={styles.form}>
      <View style={styles.sentHeader}>
        <Text style={styles.fieldLabel}>Your response</Text>
        <View style={[styles.stagePill, { backgroundColor: background }]}>
          <MaterialIcons name={icon} size={13} color={text} />
          <Text style={[styles.stagePillText, { color: text }]}>{label}</Text>
        </View>
      </View>
      <View style={styles.quote}>
        <Text style={styles.quoteText}>{application.message}</Text>
      </View>
      <View style={styles.privateNote}>
        <MaterialIcons name="lock-outline" size={14} color={colors.muted} />
        <CaptionText style={styles.privateNoteText}>
          Only {providerFirstName} can see this · Sent {application.sentAgo.toLowerCase()}
        </CaptionText>
      </View>
    </View>
  );
}

function SentConfirmation({
  providerFirstName,
  onViewApplications,
  onClose,
}: {
  providerFirstName: string;
  onViewApplications: () => void;
  onClose: () => void;
}) {
  return (
    <View style={styles.confirmation}>
      <View style={styles.confirmationIcon}>
        <MaterialIcons name="check" size={30} color={colors.card} />
      </View>
      <Text style={styles.confirmationTitle}>Your response was sent</Text>
      <CaptionText style={styles.confirmationBody}>
        Only {providerFirstName} can see it. You can follow it in Applications.
      </CaptionText>
      <View style={styles.confirmationActions}>
        <ActionButton label="View Applications" onPress={onViewApplications} />
        <ActionButton label="Keep browsing" onPress={onClose} tone="secondary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.scrim,
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    gap: spacing.md,
    maxHeight: "90%",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    ...shadows.card,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 4,
    width: 40,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  kicker: {
    color: colors.muted,
    fontFamily: fonts.extraBold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  closeButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    marginRight: -spacing.sm,
    width: 44,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  title: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 19,
    lineHeight: 25,
  },
  description: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  postedByRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    flexDirection: "row",
    padding: spacing.md,
  },
  form: {
    gap: spacing.sm,
  },
  fieldLabel: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.appBg,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 21,
    minHeight: 112,
    padding: spacing.md,
  },
  formFooter: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  privateNote: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: spacing.xs,
  },
  privateNoteText: {
    flexShrink: 1,
  },
  sentHeader: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  stagePill: {
    alignItems: "center",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  stagePillText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  quote: {
    backgroundColor: colors.surface,
    borderLeftColor: colors.primary,
    borderLeftWidth: 3,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  quoteText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  confirmation: {
    alignItems: "center",
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  confirmationIcon: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: colors.primarySoft,
    borderRadius: radius.pill,
    borderWidth: 6,
    height: 68,
    justifyContent: "center",
    width: 68,
  },
  confirmationTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 18,
    marginTop: spacing.xs,
  },
  confirmationBody: {
    maxWidth: 300,
    textAlign: "center",
  },
  confirmationActions: {
    alignSelf: "stretch",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
