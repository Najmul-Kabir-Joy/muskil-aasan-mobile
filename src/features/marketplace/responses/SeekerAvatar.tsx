import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius } from "@/theme/tokens";

const AVATAR_TONES = [
  { background: colors.primarySoft, text: colors.primaryDark },
  { background: colors.secondarySoft, text: colors.secondaryDark },
  { background: colors.tertiarySoft, text: colors.tertiaryDark },
];

// Deterministic per name, so a Job Seeker keeps the same avatar colour on
// the Responses List and on their Response Detail.
function toneFor(name: string) {
  return AVATAR_TONES[name.length % AVATAR_TONES.length];
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/**
 * An initials avatar for a Job Seeker. The prototype has no profile photos,
 * so this stands in for the photo the Stitch designs show. Decorative only —
 * the Seeker's name is always rendered as text next to it — so it's hidden
 * from screen readers rather than announcing two letters.
 */
export function SeekerAvatar({ name, size }: { name: string; size: number }) {
  const tone = toneFor(name);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.avatar, { backgroundColor: tone.background, height: size, width: size }]}
    >
      <Text style={[styles.initials, { color: tone.text, fontSize: Math.round(size * 0.32) }]}>
        {initialsFor(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    borderRadius: radius.pill,
    justifyContent: "center",
  },
  initials: {
    fontFamily: fonts.extraBold,
  },
});
