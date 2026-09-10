import { useRouter } from "expo-router";
import { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextProps, View } from "react-native";
import { Edges, SafeAreaView } from "react-native-safe-area-context";
import { BRAND_NAME } from "@/shared/constants/brand";
import { colors, fonts, radius, shadows, spacing, typography } from "@/theme/tokens";

type ButtonTone = "primary" | "secondary" | "inverted" | "outlined";

/**
 * Non-scrolling page shell: safe area + a plain View. Use this when the
 * screen's content is (or will be) a virtualized list — put the FlatList
 * directly inside it. Do not nest a FlatList inside ScrollScreen.
 */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>{children}</View>
    </SafeAreaView>
  );
}

/**
 * Page shell for ordinary scrolling content (forms, stacked cards). This is
 * what every current prototype screen uses.
 *
 * `edges` defaults to every edge (react-native-safe-area-context's own
 * default). Screens rendered inside a persistent shell that already handles
 * an edge itself (e.g. a Provider tab screen, whose top/bottom insets are
 * owned by the shared header and bottom navigation) should pass a narrower
 * list — see `src/features/marketplace/provider-shell/`.
 */
export function ScrollScreen({ children, edges }: { children: ReactNode; edges?: Edges }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Drop-in replacement for React Native's `Text` that defaults to the app's
 * font. Use this (or `Heading`/`BodyText`/`CaptionText`) instead of a bare
 * `Text` so user-facing copy consistently renders in Plus Jakarta Sans
 * without relying on a global `Text.defaultProps` mutation.
 */
export function AppText({ style, ...props }: TextProps) {
  return <Text style={[styles.appText, style]} {...props} />;
}

export function Heading({ style, ...props }: TextProps) {
  return <Text style={[styles.headingText, style]} {...props} />;
}

export function BodyText({ style, ...props }: TextProps) {
  return <Text style={[styles.bodyText, style]} {...props} />;
}

export function CaptionText({ style, ...props }: TextProps) {
  return <Text style={[styles.captionText, style]} {...props} />;
}

export function AppHeader({
  title,
  subtitle,
  trailing,
}: {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text style={styles.kicker}>{BRAND_NAME}</Text>
        <Heading style={styles.title}>{title}</Heading>
        {subtitle ? <BodyText style={styles.subtitle}>{subtitle}</BodyText> : null}
      </View>
      {trailing}
    </View>
  );
}

const buttonToneStyles = StyleSheet.create({
  primary: {},
  secondary: { backgroundColor: colors.surface },
  inverted: { backgroundColor: colors.inverted },
  outlined: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
});

const buttonToneTextStyles = StyleSheet.create({
  primary: { color: colors.card },
  secondary: { color: colors.text },
  inverted: { color: colors.card },
  outlined: { color: colors.text },
});

export function PrimaryButton({
  label,
  href,
  tone = "primary",
}: {
  label: string;
  href: string;
  tone?: ButtonTone;
}) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(href)}
      style={[styles.button, buttonToneStyles[tone]]}
    >
      <Text style={[styles.buttonText, buttonToneTextStyles[tone]]}>{label}</Text>
    </Pressable>
  );
}

export function ActionButton({
  label,
  onPress,
  tone = "primary",
  disabled = false,
  icon,
}: {
  label: string;
  onPress: () => void;
  tone?: ButtonTone;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, buttonToneStyles[tone], disabled && styles.disabledButton]}
    >
      {icon}
      <Text
        style={[
          styles.buttonText,
          buttonToneTextStyles[tone],
          disabled && styles.disabledButtonText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function SelectableChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.selectableChip, selected && styles.selectableChipActive]}
    >
      <Text style={[styles.selectableChipText, selected && styles.selectableChipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <Heading>{title}</Heading>
      {action}
    </View>
  );
}

export function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  return (
    <View style={[styles.badge, toneStyles[tone]]}>
      <Text style={[styles.badgeText, toneTextStyles[tone]]}>{label}</Text>
    </View>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.emptyState}>
      <Heading>{title}</Heading>
      <BodyText style={styles.subtitle}>{body}</BodyText>
      {action ? <View style={{ marginTop: spacing.lg }}>{action}</View> : null}
    </View>
  );
}

export function Timeline({
  events,
}: {
  events: { label: string; detail: string; completed: boolean }[];
}) {
  return (
    <View style={styles.card}>
      {events.map((event, index) => (
        <View key={event.label} style={styles.timelineRow}>
          <View style={[styles.timelineDot, event.completed && styles.timelineDotDone]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.timelineTitle}>{event.label}</Text>
            <CaptionText>{event.detail}</CaptionText>
          </View>
          {index < events.length - 1 ? <View style={styles.timelineLine} /> : null}
        </View>
      ))}
    </View>
  );
}

const toneStyles = StyleSheet.create({
  neutral: { backgroundColor: colors.surface },
  success: { backgroundColor: colors.primarySoft },
  warning: { backgroundColor: colors.secondarySoft },
  danger: { backgroundColor: colors.dangerSoft },
  info: { backgroundColor: colors.tertiarySoft },
});

const toneTextStyles = StyleSheet.create({
  neutral: { color: colors.muted },
  success: { color: colors.primaryDark },
  warning: { color: colors.secondaryDark },
  danger: { color: colors.dangerDark },
  info: { color: colors.tertiaryDark },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  screen: {
    flex: 1,
    padding: spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
    gap: spacing.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  kicker: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  appText: {
    fontFamily: fonts.medium,
  },
  headingText: {
    ...typography.heading,
    color: colors.text,
  },
  bodyText: {
    ...typography.body,
    color: colors.muted,
  },
  captionText: {
    ...typography.caption,
    color: colors.muted,
  },
  title: {
    ...typography.display,
    color: colors.text,
    marginTop: spacing.xs,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  buttonText: {
    ...typography.button,
    color: colors.card,
  },
  disabledButtonText: {
    color: colors.muted,
  },
  selectableChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: 36,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectableChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectableChipText: {
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  selectableChipTextActive: {
    color: colors.card,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    textTransform: "capitalize",
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.card,
  },
  emptyState: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  timelineRow: {
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 56,
    position: "relative",
  },
  timelineDot: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 14,
    marginTop: 3,
    width: 14,
  },
  timelineDotDone: {
    backgroundColor: colors.primary,
  },
  timelineLine: {
    backgroundColor: colors.border,
    bottom: -4,
    left: 6,
    position: "absolute",
    top: 22,
    width: 2,
  },
  timelineTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 15,
  },
});
