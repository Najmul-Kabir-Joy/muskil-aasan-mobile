import { useRouter } from "expo-router";
import { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, radius, shadows, spacing } from "@/theme/tokens";
import type { Category, Offer, Task, TaskStatus, VerificationStatus } from "@/types/domain";

type ButtonTone = "primary" | "secondary" | "inverted" | "outlined";

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
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
        <Text style={styles.kicker}>Mushkil Asan</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {trailing}
    </View>
  );
}

export function RoleSwitch({ active }: { active: "poster" | "jobSeeker" }) {
  const router = useRouter();
  return (
    <View style={styles.roleSwitch}>
      <Pressable
        onPress={() => router.push("/(poster)")}
        style={[styles.rolePill, active === "poster" && styles.rolePillActive]}
      >
        <Text style={[styles.roleText, active === "poster" && styles.roleTextActive]}>
          Poster mode
        </Text>
      </Pressable>
      <Pressable
        onPress={() => router.push("/(worker)/jobs")}
        style={[styles.rolePill, active === "jobSeeker" && styles.rolePillActive]}
      >
        <Text style={[styles.roleText, active === "jobSeeker" && styles.roleTextActive]}>
          Job seeker
        </Text>
      </Pressable>
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
    <Pressable onPress={() => router.push(href)} style={[styles.button, buttonToneStyles[tone]]}>
      <Text style={[styles.buttonText, buttonToneTextStyles[tone]]}>{label}</Text>
    </Pressable>
  );
}

export function ActionButton({
  label,
  onPress,
  tone = "primary",
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  tone?: ButtonTone;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, buttonToneStyles[tone], disabled && styles.disabledButton]}
    >
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
      <Text style={styles.sectionTitle}>{title}</Text>
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

export function CategoryTile({ category }: { category: Category }) {
  return (
    <View style={styles.categoryTile}>
      <Text style={styles.categoryIcon}>{category.icon}</Text>
      <Text style={styles.cardTitle}>{category.label}</Text>
      <Text style={styles.cardMeta}>{category.example}</Text>
    </View>
  );
}

export function InteractiveCategoryTile({
  category,
  selected,
  onPress,
}: {
  category: Category;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.categoryTile, selected && styles.categoryTileActive]}
    >
      <Text style={styles.categoryIcon}>{category.icon}</Text>
      <Text style={styles.cardTitle}>{category.label}</Text>
      <Text style={styles.cardMeta}>{category.example}</Text>
    </Pressable>
  );
}

export function TaskCard({ task, cta = "View task" }: { task: Task; cta?: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <Badge label={task.category} />
        <Badge label={task.status} tone={statusTone(task.status)} />
      </View>
      <Text style={styles.cardTitle}>{task.title}</Text>
      <Text style={styles.cardMeta}>{task.description}</Text>
      <View style={styles.signalRow}>
        <Text style={styles.price}>{task.budget}</Text>
        <Text style={styles.signal}>{task.area}</Text>
        <Text style={styles.signal}>{task.timing}</Text>
        {task.urgent ? <Badge label="Urgent" tone="danger" /> : null}
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardMeta}>{task.offerCount} offers</Text>
        <PrimaryButton label={cta} href="/(poster)/tasks" tone="secondary" />
      </View>
    </View>
  );
}

export function OfferCard({ offer }: { offer: Offer }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <View>
          <Text style={styles.cardTitle}>{offer.worker.name}</Text>
          <Text style={styles.cardMeta}>
            {offer.worker.rating} rating · {offer.worker.completedJobs} jobs · {offer.worker.area}
          </Text>
        </View>
        <Badge
          label={verificationLabel(offer.worker.verification)}
          tone={offer.worker.verification === "verified" ? "success" : "warning"}
        />
      </View>
      <Text style={styles.offerMessage}>{offer.message}</Text>
      <View style={styles.signalRow}>
        <Text style={styles.price}>{offer.amount}</Text>
        <Text style={styles.signal}>{offer.estimatedTime}</Text>
        <Badge label={offer.status} tone={offer.status === "accepted" ? "success" : "neutral"} />
      </View>
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
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.subtitle}>{body}</Text>
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
            <Text style={styles.cardMeta}>{event.detail}</Text>
          </View>
          {index < events.length - 1 ? <View style={styles.timelineLine} /> : null}
        </View>
      ))}
    </View>
  );
}

export function statusTone(status: TaskStatus) {
  if (status === "completed") return "success";
  if (status === "cancelled" || status === "disputed") return "danger";
  if (status === "completion requested" || status === "hired") return "warning";
  return "neutral";
}

export function verificationLabel(status: VerificationStatus) {
  if (status === "verified") return "Verified";
  if (status === "pending") return "Pending";
  return "Unverified";
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
  title: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 30,
    letterSpacing: -0.6,
    lineHeight: 36,
    marginTop: spacing.xs,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  roleSwitch: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: "row",
    flexShrink: 1,
    padding: spacing.xs,
  },
  rolePill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rolePillActive: {
    backgroundColor: colors.primary,
  },
  roleText: {
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  roleTextActive: {
    color: colors.card,
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  buttonText: {
    color: colors.card,
    fontFamily: fonts.bold,
    fontSize: 14,
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
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 21,
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
  categoryTile: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    gap: spacing.sm,
    minWidth: "30%",
    padding: spacing.md,
    ...shadows.card,
  },
  categoryTileActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  categoryIcon: {
    color: colors.primary,
    fontFamily: fonts.extraBold,
    fontSize: 16,
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
  cardTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 17,
    lineHeight: 23,
  },
  cardMeta: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
  },
  signalRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  price: {
    color: colors.primary,
    fontFamily: fonts.extraBold,
    fontSize: 20,
  },
  signal: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  cardFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  offerMessage: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 21,
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
