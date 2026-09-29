import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import type { Edges } from "react-native-safe-area-context";
import { ActionButton, CaptionText, Screen } from "@/shared/components/ui";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

/**
 * Shown by the Public Profile route when its `id` param is missing or
 * doesn't match anyone — e.g. a stale link — instead of a blank screen.
 */
export function ProfileNotFoundState({ edges }: { edges?: Edges }) {
  const router = useRouter();

  return (
    <Screen edges={edges}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="person-search" size={28} color={colors.muted} />
        </View>
        <Text accessibilityRole="header" style={styles.title}>
          Profile not found
        </Text>
        <CaptionText style={styles.body}>
          We couldn&apos;t find that profile. It may no longer be available.
        </CaptionText>
        <View style={styles.action}>
          <ActionButton label="Back to Home" onPress={() => router.push("/(poster)")} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.xl,
  },
  iconCircle: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 18,
    marginTop: spacing.md,
  },
  body: {
    marginTop: spacing.xs,
    textAlign: "center",
  },
  action: {
    alignSelf: "stretch",
    marginTop: spacing.xl,
  },
});
