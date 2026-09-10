import { useState } from "react";
import { View } from "react-native";
import type { Edges } from "react-native-safe-area-context";
import { RoleSwitch } from "@/features/marketplace/components";
import {
  ActionButton,
  AppHeader,
  Badge,
  EmptyState,
  PrimaryButton,
  ScrollScreen,
  SectionHeader,
  SelectableChip,
} from "@/shared/components/ui";

/**
 * Shared profile/trust screen — reused as-is by the standalone `/profile`
 * route and by the Provider bottom navigation's "Profile" tab
 * (`app/(poster)/profile.tsx`), so there is one implementation instead of
 * two. `edges` lets a caller inside a persistent shell (which already owns
 * the top/bottom safe area) opt out of re-applying it — see `ScrollScreen`.
 */
export function ProfileScreen({ edges }: { edges?: Edges }) {
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [jobSeekerSetup, setJobSeekerSetup] = useState(false);
  const [categories, setCategories] = useState<string[]>(["Repair"]);
  const jobSeekerCategories = ["Repair", "Tutor", "Delivery", "Design", "Photo", "Admin"];

  function toggleCategory(category: string) {
    setCategories((value) =>
      value.includes(category) ? value.filter((item) => item !== category) : [...value, category],
    );
  }

  return (
    <ScrollScreen edges={edges}>
      <AppHeader
        title="Nadia Rahman"
        subtitle="Mirpur · two modes enabled · switch anytime"
        trailing={<RoleSwitch active="poster" />}
      />

      <SectionHeader title="Trust profile" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Badge
          label={phoneVerified ? "Phone verified" : "Phone pending"}
          tone={phoneVerified ? "success" : "warning"}
        />
        <Badge label="Poster mode" tone="success" />
        <Badge
          label={jobSeekerSetup ? "Job seeker setup complete" : "Job seeker setup available"}
          tone={jobSeekerSetup ? "success" : "neutral"}
        />
      </View>

      <View style={{ gap: 12 }}>
        <ActionButton
          label={phoneVerified ? "Phone verified" : "Mark phone verified"}
          onPress={() => setPhoneVerified(true)}
          disabled={phoneVerified}
        />
        <ActionButton
          label={jobSeekerSetup ? "Job seeker setup complete" : "Complete job seeker setup"}
          onPress={() => setJobSeekerSetup(true)}
          tone="secondary"
          disabled={jobSeekerSetup}
        />
      </View>

      <SectionHeader title="Job seeker categories" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {jobSeekerCategories.map((category) => (
          <SelectableChip
            key={category}
            label={category}
            selected={categories.includes(category)}
            onPress={() => toggleCategory(category)}
          />
        ))}
      </View>

      <EmptyState
        title="Job seeker setup"
        body={`Selected categories: ${categories.join(", ") || "none"}. Verification prompts, portfolio proof, and service areas belong here before job seekers can send high-risk offers.`}
      />

      <PrimaryButton label="Contact support" href="/support" tone="secondary" />
    </ScrollScreen>
  );
}
