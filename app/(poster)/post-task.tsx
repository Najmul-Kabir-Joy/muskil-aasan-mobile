import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import {
  ActionButton,
  AppHeader,
  AppText,
  Badge,
  PrimaryButton,
  ScrollScreen,
  SectionHeader,
  SelectableChip,
} from "@/shared/components/ui";
import { categories } from "@/data/mock";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

export default function PostTaskScreen() {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("Need AC servicing today");
  const [category, setCategory] = useState(categories[0].label);
  const [description, setDescription] = useState(
    "Split AC needs cleaning and cooling check before evening.",
  );
  const [budget, setBudget] = useState("1200");
  const [area, setArea] = useState("Mirpur");
  const [timing, setTiming] = useState("Today");
  const [remote, setRemote] = useState(false);
  const [urgent, setUrgent] = useState(true);

  const checks = useMemo(
    () => [
      { label: "Clear task title", done: title.trim().length > 5 },
      { label: "Budget added", done: Number(budget) > 0 },
      { label: "Location or remote selected", done: remote || area.trim().length > 1 },
      { label: "Timing selected", done: timing.trim().length > 1 },
      { label: "Useful description", done: description.trim().length >= 20 },
    ],
    [area, budget, description, remote, timing, title],
  );
  const canPublish = checks.every((check) => check.done);

  return (
    <ScrollScreen>
      <AppHeader
        title="Post a task in under a minute."
        subtitle="Progressive fields keep the first version fast while still collecting enough detail for useful offers."
      />

      <View style={styles.stepCard}>
        <Badge label={`Step ${step + 1} of 4`} tone="success" />
        {step === 0 ? (
          <>
            <SectionHeader title="What do you need?" />
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Example: Need AC servicing today"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <View style={styles.chips}>
              {categories.map((item) => (
                <SelectableChip
                  key={item.id}
                  label={item.label}
                  selected={category === item.label}
                  onPress={() => setCategory(item.label)}
                />
              ))}
            </View>
          </>
        ) : null}
        {step === 1 ? (
          <>
            <SectionHeader title="Details and photos" />
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              placeholder="Describe the task"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.textArea]}
            />
            <Badge label="Photo uploader placeholder" tone="warning" />
          </>
        ) : null}
        {step === 2 ? (
          <>
            <SectionHeader title="Budget and timing" />
            <TextInput
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
              placeholder="Budget amount"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <TextInput
              value={timing}
              onChangeText={setTiming}
              placeholder="Preferred time"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <SelectableChip
              label="Urgent"
              selected={urgent}
              onPress={() => setUrgent((value) => !value)}
            />
          </>
        ) : null}
        {step === 3 ? (
          <>
            <SectionHeader title="Location and review" />
            <SelectableChip
              label="Remote task"
              selected={remote}
              onPress={() => setRemote((value) => !value)}
            />
            {!remote ? (
              <TextInput
                value={area}
                onChangeText={setArea}
                placeholder="Area in Dhaka"
                placeholderTextColor={colors.muted}
                style={styles.input}
              />
            ) : null}
            <View style={styles.reviewCard}>
              <Text style={styles.stepTitle}>{title}</Text>
              <AppText style={styles.helpText}>
                {category} · ৳{budget} · {remote ? "Remote" : area} · {timing}
                {urgent ? " · Urgent" : ""}
              </AppText>
              <AppText style={styles.helpText}>{description}</AppText>
            </View>
          </>
        ) : null}
      </View>

      <View style={styles.actions}>
        {step > 0 ? (
          <ActionButton
            label="Back"
            onPress={() => setStep((value) => value - 1)}
            tone="secondary"
          />
        ) : null}
        {step < 3 ? (
          <ActionButton label="Next" onPress={() => setStep((value) => value + 1)} />
        ) : (
          <ActionButton
            label={canPublish ? "Mock publish ready" : "Complete checklist"}
            onPress={() => undefined}
            disabled={!canPublish}
          />
        )}
      </View>

      <View style={styles.stepCard}>
        <SectionHeader title="Publish checklist" />
        {checks.map((item) => (
          <Text key={item.label} style={[styles.checkItem, !item.done && styles.incompleteCheck]}>
            {item.done ? "✓" : "○"} {item.label}
          </Text>
        ))}
      </View>

      <PrimaryButton
        label="Save draft and review offers"
        href="/(poster)/tasks"
        tone={canPublish ? "primary" : "secondary"}
      />
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  stepCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  input: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  textArea: {
    minHeight: 120,
    paddingTop: spacing.md,
    textAlignVertical: "top",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  stepTitle: {
    color: colors.text,
    fontSize: 18,
    fontFamily: fonts.extraBold,
  },
  helpText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  checkItem: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.semiBold,
  },
  incompleteCheck: {
    color: colors.muted,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.sm,
    padding: spacing.md,
  },
});
