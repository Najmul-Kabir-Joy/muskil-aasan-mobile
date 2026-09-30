import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  GestureResponderEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  COVER_HEIGHT,
  MAX_ZOOM,
  MIN_ZOOM,
  constrainFraming,
} from "@/features/marketplace/profile/photoFraming";
import { pickProfilePhoto } from "@/features/marketplace/profile/pickProfilePhoto";
import { ProfilePhotoView } from "@/features/marketplace/profile/ProfilePhotoView";
import { colors, fonts, radius, spacing } from "@/theme/tokens";
import type { ProfilePhoto } from "@/types/domain";

export type PhotoSlot = "profile" | "cover";

const ZOOM_STEP = 0.25;
const PROFILE_FRAME_MAX = 300;
const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

function touchDistance(event: GestureResponderEvent) {
  const [first, second] = event.nativeEvent.touches;
  if (!first || !second) return 0;
  return Math.hypot(first.pageX - second.pageX, first.pageY - second.pageY);
}

/**
 * Full-screen crop editor for the profile photo (circle) or the cover
 * (full-width banner, same height as on the profile, so what you frame is
 * what shows). Drag to reposition, pinch or use −/+ to zoom; the photo
 * always fills the frame. "Choose another photo" swaps the photo in place;
 * "Remove photo" appears only when there's a saved photo to remove.
 *
 * The parent mounts this only while editing, so each open starts from the
 * photo it's given.
 */
export function PhotoEditorModal({
  slot,
  photo,
  canRemove,
  onSave,
  onRemove,
  onCancel,
}: {
  slot: PhotoSlot;
  photo: ProfilePhoto;
  canRemove: boolean;
  onSave: (photo: ProfilePhoto) => void;
  onRemove: () => void;
  onCancel: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isProfile = slot === "profile";
  const frameWidth = isProfile
    ? Math.min(windowWidth - spacing.xxl * 2, PROFILE_FRAME_MAX)
    : windowWidth;
  const frameHeight = isProfile ? frameWidth : COVER_HEIGHT;

  const [draft, setDraft] = useState(() => constrainFraming(photo, frameWidth, frameHeight));
  // Touch events arrive faster than re-renders, so the gesture reads the
  // latest framing (and where it started) from refs, only inside handlers.
  const draftRef = useRef(draft);
  const gestureRef = useRef<{
    start: ProfilePhoto;
    startX: number;
    startY: number;
    startDistance: number;
    touches: number;
  } | null>(null);

  function updateDraft(next: ProfilePhoto) {
    const framed = constrainFraming(next, frameWidth, frameHeight);
    draftRef.current = framed;
    setDraft(framed);
  }

  function beginGesture(event: GestureResponderEvent) {
    const { touches } = event.nativeEvent;
    gestureRef.current = {
      start: draftRef.current,
      startX: touches[0]?.pageX ?? 0,
      startY: touches[0]?.pageY ?? 0,
      startDistance: touchDistance(event),
      touches: touches.length,
    };
  }

  function moveGesture(event: GestureResponderEvent) {
    const gesture = gestureRef.current;
    const { touches } = event.nativeEvent;
    // A finger added or lifted mid-gesture starts a fresh baseline, so
    // switching between drag and pinch never makes the photo jump.
    if (!gesture || touches.length !== gesture.touches) {
      beginGesture(event);
      return;
    }
    const { start } = gesture;
    if (touches.length >= 2 && gesture.startDistance > 0) {
      updateDraft({ ...start, zoom: start.zoom * (touchDistance(event) / gesture.startDistance) });
      return;
    }
    const [finger] = touches;
    if (!finger) return;
    updateDraft({
      ...start,
      offsetX: start.offsetX + (finger.pageX - gesture.startX) / frameWidth,
      offsetY: start.offsetY + (finger.pageY - gesture.startY) / frameHeight,
    });
  }

  async function chooseAnother() {
    const picked = await pickProfilePhoto();
    if (picked) updateDraft(picked);
  }

  const title = isProfile ? "Profile photo" : "Cover photo";

  return (
    <Modal visible animationType="slide" onRequestClose={onCancel}>
      {/* Light status-bar text on the dark editor; the app's own style comes
          back when the editor unmounts. */}
      <StatusBar style="light" />
      <View
        style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.lg }]}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            hitSlop={HIT_SLOP}
            onPress={onCancel}
            style={styles.headerButton}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          <Pressable
            accessibilityRole="button"
            hitSlop={HIT_SLOP}
            onPress={() => onSave(draftRef.current)}
            style={[styles.headerButton, styles.headerButtonEnd]}
          >
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>

        <View style={styles.stage}>
          <View
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={beginGesture}
            onResponderMove={moveGesture}
            onResponderRelease={() => {
              gestureRef.current = null;
            }}
            onResponderTerminationRequest={() => false}
            accessible
            accessibilityLabel={`${title} preview. Drag to reposition, pinch to zoom.`}
            style={[
              styles.frame,
              isProfile && { borderRadius: frameWidth / 2 },
              { width: frameWidth, height: frameHeight },
            ]}
          >
            <ProfilePhotoView
              photo={draft}
              width={frameWidth}
              height={frameHeight}
              round={isProfile}
            />
          </View>
          <Text style={styles.hint}>Drag to reposition · Pinch to zoom</Text>

          <View style={styles.zoomRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Zoom out"
              accessibilityState={{ disabled: draft.zoom <= MIN_ZOOM }}
              disabled={draft.zoom <= MIN_ZOOM}
              onPress={() => updateDraft({ ...draft, zoom: draft.zoom - ZOOM_STEP })}
              style={[styles.zoomButton, draft.zoom <= MIN_ZOOM && styles.zoomButtonDisabled]}
            >
              <MaterialIcons name="remove" size={22} color={colors.card} />
            </Pressable>
            <Text style={styles.zoomValue}>{Math.round(draft.zoom * 100)}%</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Zoom in"
              accessibilityState={{ disabled: draft.zoom >= MAX_ZOOM }}
              disabled={draft.zoom >= MAX_ZOOM}
              onPress={() => updateDraft({ ...draft, zoom: draft.zoom + ZOOM_STEP })}
              style={[styles.zoomButton, draft.zoom >= MAX_ZOOM && styles.zoomButtonDisabled]}
            >
              <MaterialIcons name="add" size={22} color={colors.card} />
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose another photo"
            onPress={chooseAnother}
            style={styles.footerAction}
          >
            <MaterialIcons name="photo-library" size={20} color={colors.card} />
            <Text style={styles.footerText}>Choose another photo</Text>
          </Pressable>
          {canRemove ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
              onPress={onRemove}
              style={styles.footerAction}
            >
              <MaterialIcons name="delete-outline" size={20} color={colors.dangerSoft} />
              <Text style={[styles.footerText, styles.removeText]}>Remove photo</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.inverted,
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerButton: {
    justifyContent: "center",
    minHeight: 44,
    minWidth: 64,
  },
  headerButtonEnd: {
    alignItems: "flex-end",
  },
  title: {
    color: colors.card,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  cancelText: {
    color: colors.card,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  saveText: {
    color: colors.primaryLight,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  stage: {
    alignItems: "center",
    flex: 1,
    gap: spacing.lg,
    justifyContent: "center",
  },
  frame: {
    borderColor: colors.card,
    borderWidth: 2,
    overflow: "hidden",
  },
  hint: {
    color: colors.border,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  zoomRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.lg,
  },
  zoomButton: {
    alignItems: "center",
    borderColor: colors.muted,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  zoomButtonDisabled: {
    opacity: 0.4,
  },
  zoomValue: {
    color: colors.card,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    minWidth: 48,
    textAlign: "center",
  },
  footer: {
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  footerAction: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 48,
  },
  footerText: {
    color: colors.card,
    fontFamily: fonts.semiBold,
    fontSize: 15,
  },
  removeText: {
    color: colors.dangerSoft,
  },
});
