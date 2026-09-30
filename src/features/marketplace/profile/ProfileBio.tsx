import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ActionButton } from "@/shared/components/ui";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

// Prototype limit that keeps a bio to a short intro — not a confirmed
// product rule; revisit when bios are saved for real.
export const BIO_MAX_LENGTH = 160;

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

/**
 * The profile bio, edited in place (no separate Edit Profile screen): the
 * owner taps the pencil, edits in a text box, and saves or cancels. Other
 * people just see the text, or nothing when it's empty.
 */
export function ProfileBio({
  bio,
  editable,
  onSave,
}: {
  bio: string;
  editable: boolean;
  onSave: (bio: string) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  if (draft !== null) {
    return (
      <View style={styles.editor}>
        <TextInput
          accessibilityLabel="Bio"
          autoFocus
          maxLength={BIO_MAX_LENGTH}
          multiline
          onChangeText={setDraft}
          placeholder="Tell people a little about yourself"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={draft}
        />
        <Text style={styles.counter}>
          {draft.length}/{BIO_MAX_LENGTH}
        </Text>
        <View style={styles.editorActions}>
          <View style={styles.editorAction}>
            <ActionButton label="Cancel" tone="secondary" onPress={() => setDraft(null)} />
          </View>
          <View style={styles.editorAction}>
            <ActionButton
              label="Save"
              onPress={() => {
                onSave(draft.trim());
                setDraft(null);
              }}
            />
          </View>
        </View>
      </View>
    );
  }

  if (!editable) {
    return bio ? <Text style={styles.bio}>{bio}</Text> : null;
  }

  return (
    <View style={styles.row}>
      <Text style={[styles.bio, styles.bioFlexible, !bio && styles.placeholder]}>
        {bio || "Add a short bio so people know who you are."}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={bio ? "Edit bio" : "Add bio"}
        hitSlop={HIT_SLOP}
        onPress={() => setDraft(bio)}
        style={styles.pencil}
      >
        <MaterialIcons name="edit" size={16} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  bio: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  bioFlexible: {
    flex: 1,
    marginTop: 0,
  },
  placeholder: {
    fontStyle: "italic",
  },
  pencil: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  editor: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 88,
    padding: spacing.md,
    textAlignVertical: "top",
  },
  counter: {
    alignSelf: "flex-end",
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  editorActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  editorAction: {
    flex: 1,
  },
});
