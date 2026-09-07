import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { categories } from "@/data/mock";
import { AppText, SelectableChip } from "@/shared/components/ui";
import { colors, fonts, radius, spacing } from "@/theme/tokens";
import type { Role } from "@/types/domain";

export type PrimaryUseCase = Role | "";

export const MAX_PREFERRED_CATEGORIES = 5;

const OPTIONS: {
  value: Role;
  icon: "assignment" | "account-balance-wallet";
  title: string;
  subtitle: string;
}[] = [
  {
    value: "poster",
    icon: "assignment",
    title: "I need help",
    subtitle: "Post small jobs and get help from your neighborhood.",
  },
  {
    value: "jobSeeker",
    icon: "account-balance-wallet",
    title: "I'd like to help & earn",
    subtitle: "Find small jobs and earn extra income.",
  },
];

/**
 * Confirmed requirement: a single account can act as both a Job Provider and
 * a Job Seeker and switch between them — this step only records an initial
 * preference, not an exclusive choice. See
 * docs/engineering/domain-and-terminology.md.
 */
export function UseCaseStep({
  useCase,
  onChangeUseCase,
  selectedCategories,
  onToggleCategory,
}: {
  useCase: PrimaryUseCase;
  onChangeUseCase: (value: PrimaryUseCase) => void;
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
}) {
  function toggleUseCase(value: Role) {
    onChangeUseCase(useCase === value ? "" : value);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>How would you like to use it?</Text>
        <AppText style={styles.subtitle}>
          You can always switch modes or do both later from your profile.
        </AppText>
      </View>
      <View style={styles.cards}>
        {OPTIONS.map((option) => {
          const selected = useCase === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => toggleUseCase(option.value)}
              style={[styles.card, selected && styles.cardActive]}
            >
              <View style={[styles.cardIcon, selected && styles.cardIconActive]}>
                <MaterialIcons
                  name={option.icon}
                  size={22}
                  color={selected ? colors.card : colors.primary}
                />
              </View>
              <Text style={styles.cardTitle}>{option.title}</Text>
              <AppText style={styles.cardSubtitle}>{option.subtitle}</AppText>
            </Pressable>
          );
        })}
      </View>

      {useCase === "jobSeeker" ? (
        <View style={styles.categoriesBlock}>
          <View style={styles.categoriesHeader}>
            <Text style={styles.categoriesTitle}>
              Pick up to {MAX_PREFERRED_CATEGORIES} categories
            </Text>
            <Text style={styles.categoriesCount}>
              {selectedCategories.length}/{MAX_PREFERRED_CATEGORIES} selected
            </Text>
          </View>
          <View style={styles.chips}>
            {categories.map((category) => (
              <SelectableChip
                key={category.id}
                label={category.label}
                selected={selectedCategories.includes(category.id)}
                onPress={() => onToggleCategory(category.id)}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  header: {
    gap: spacing.xxs,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
  },
  cards: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  cardActive: {
    borderColor: colors.primary,
  },
  cardIcon: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  cardIconActive: {
    backgroundColor: colors.primary,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  cardSubtitle: {
    color: colors.muted,
    fontSize: 12,
  },
  categoriesBlock: {
    gap: spacing.sm,
  },
  categoriesHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoriesTitle: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  categoriesCount: {
    color: colors.muted,
    fontSize: 12,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
