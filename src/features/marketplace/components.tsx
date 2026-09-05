import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { statusTone, verificationLabel } from "@/features/marketplace/status";
import { Badge, CaptionText, PrimaryButton } from "@/shared/components/ui";
import { colors, fonts, radius, shadows, spacing } from "@/theme/tokens";
import type { Category, Offer, Task } from "@/types/domain";

// Prototype/mock marketplace UI — tied to src/types/domain.ts's prototype
// shapes, not approved product requirements. See
// docs/engineering/domain-and-terminology.md.

/**
 * Top-level poster/job-seeker mode switch. Uses `router.replace` (not
 * `push`) so repeatedly switching modes doesn't stack an unbounded back
 * history — see docs/engineering/git-workflow.md history for context.
 */
export function RoleSwitch({ active }: { active: "poster" | "jobSeeker" }) {
  const router = useRouter();
  return (
    <View style={styles.roleSwitch}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: active === "poster" }}
        onPress={() => router.replace("/(poster)")}
        style={[styles.rolePill, active === "poster" && styles.rolePillActive]}
      >
        <Text style={[styles.roleText, active === "poster" && styles.roleTextActive]}>
          Poster mode
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: active === "jobSeeker" }}
        onPress={() => router.replace("/(worker)/jobs")}
        style={[styles.rolePill, active === "jobSeeker" && styles.rolePillActive]}
      >
        <Text style={[styles.roleText, active === "jobSeeker" && styles.roleTextActive]}>
          Job seeker
        </Text>
      </Pressable>
    </View>
  );
}

export function CategoryTile({ category }: { category: Category }) {
  return (
    <View style={styles.categoryTile}>
      <Text style={styles.categoryIcon}>{category.icon}</Text>
      <Text style={styles.cardTitle}>{category.label}</Text>
      <CaptionText>{category.example}</CaptionText>
    </View>
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
      <CaptionText>{task.description}</CaptionText>
      <View style={styles.signalRow}>
        <Text style={styles.price}>{task.budget}</Text>
        <Text style={styles.signal}>{task.area}</Text>
        <Text style={styles.signal}>{task.timing}</Text>
        {task.urgent ? <Badge label="Urgent" tone="danger" /> : null}
      </View>
      <View style={styles.cardFooter}>
        <CaptionText>{task.offerCount} offers</CaptionText>
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
          <CaptionText>
            {offer.worker.rating} rating · {offer.worker.completedJobs} jobs · {offer.worker.area}
          </CaptionText>
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

const styles = StyleSheet.create({
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
});
