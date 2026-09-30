import { Image, StyleSheet, View } from "react-native";
import { photoLayout } from "@/features/marketplace/profile/photoFraming";
import type { ProfilePhoto } from "@/types/domain";

/**
 * Draws a `ProfilePhoto` with its saved framing inside a fixed-size box that
 * clips everything outside it. `round` makes the box a circle (profile
 * photo). Decorative: the person's name is always shown as text nearby.
 */
export function ProfilePhotoView({
  photo,
  width,
  height,
  round = false,
}: {
  photo: ProfilePhoto;
  width: number;
  height: number;
  round?: boolean;
}) {
  const layout = photoLayout(photo, width, height);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.frame, { width, height }, round && { borderRadius: width / 2 }]}
    >
      <Image source={{ uri: photo.uri }} style={[styles.image, layout]} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: "hidden",
  },
  image: {
    position: "absolute",
  },
});
