import { useMemo, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { RoleSwitch, TaskCard } from "@/features/marketplace/components";
import {
  ActionButton,
  AppHeader,
  EmptyState,
  ScrollScreen,
  SectionHeader,
  SelectableChip,
} from "@/shared/components/ui";
import { tasks } from "@/data/mock";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

const filters = ["Category", "Area", "Budget", "Urgent", "Remote"];

export default function WorkerJobsScreen() {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [savedTaskIds, setSavedTaskIds] = useState<string[]>([]);
  const [submittedTaskIds, setSubmittedTaskIds] = useState<string[]>([]);
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesQuery = `${task.title} ${task.category} ${task.area}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesUrgent = !activeFilters.includes("Urgent") || task.urgent;
      const matchesRemote = !activeFilters.includes("Remote") || task.area === "Remote";

      return matchesQuery && matchesUrgent && matchesRemote;
    });
  }, [activeFilters, query]);

  function toggleFilter(filter: string) {
    setActiveFilters((value) =>
      value.includes(filter) ? value.filter((item) => item !== filter) : [...value, filter],
    );
  }

  return (
    <ScrollScreen>
      <AppHeader
        title="Find jobs near Mirpur"
        subtitle="Job seeker mode helps you scan budget, area, urgency, category, and offer count before sending an offer."
        trailing={<RoleSwitch active="jobSeeker" />}
      />

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search jobs"
        placeholderTextColor={colors.muted}
        style={styles.search}
      />
      <View style={styles.filters}>
        {filters.map((filter) => (
          <SelectableChip
            key={filter}
            label={filter}
            selected={activeFilters.includes(filter)}
            onPress={() => toggleFilter(filter)}
          />
        ))}
      </View>

      <SectionHeader title={`Jobs you can offer on (${filteredTasks.length})`} />
      {filteredTasks.map((task) => (
        <View key={task.id} style={{ gap: 10 }}>
          <TaskCard task={task} cta="View job" />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <ActionButton
              label={savedTaskIds.includes(task.id) ? "Saved" : "Save"}
              onPress={() =>
                setSavedTaskIds((value) =>
                  value.includes(task.id)
                    ? value.filter((item) => item !== task.id)
                    : [...value, task.id],
                )
              }
              tone="secondary"
            />
            <ActionButton
              label={submittedTaskIds.includes(task.id) ? "Offer sent" : "Send mock offer"}
              onPress={() =>
                setSubmittedTaskIds((value) =>
                  value.includes(task.id) ? value : [...value, task.id],
                )
              }
              disabled={submittedTaskIds.includes(task.id)}
            />
          </View>
        </View>
      ))}
      {!filteredTasks.length ? (
        <EmptyState
          title="No jobs match"
          body="Try removing filters or search terms. This is the empty state job seekers should see when filters are too strict."
        />
      ) : null}

      <EmptyState
        title="Job seeker setup"
        body="If your profile is incomplete, this area should show category, skill, service area, and verification prompts before high-risk offers are allowed."
      />
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
