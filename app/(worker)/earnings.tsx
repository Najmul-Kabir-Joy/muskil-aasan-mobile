import { useMemo, useState } from "react";
import { View } from "react-native";
import {
  AppHeader,
  EmptyState,
  PrimaryButton,
  Screen,
  SectionHeader,
  SelectableChip,
} from "@/shared/components/ui";

const periods = [
  { label: "This week", amount: 0, jobs: 0 },
  { label: "This month", amount: 2500, jobs: 1 },
  { label: "Pilot total", amount: 3700, jobs: 2 },
];

export default function WorkerEarningsScreen() {
  const [period, setPeriod] = useState(periods[0].label);
  const selectedPeriod = useMemo(
    () => periods.find((item) => item.label === period) ?? periods[0],
    [period],
  );

  return (
    <Screen>
      <AppHeader
        title="Job seeker earnings."
        subtitle="Pilot earnings stay honest: do not imply wallet, withdrawal, or escrow until those systems exist."
      />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {periods.map((item) => (
          <SelectableChip
            key={item.label}
            label={item.label}
            selected={period === item.label}
            onPress={() => setPeriod(item.label)}
          />
        ))}
      </View>

      <SectionHeader title="Manual payment tracking" />
      <EmptyState
        title={`৳${selectedPeriod.amount.toLocaleString()} tracked`}
        body={`${selectedPeriod.jobs} completed job${selectedPeriod.jobs === 1 ? "" : "s"} in ${selectedPeriod.label.toLowerCase()}. During MVP, payment status can be tracked manually with method, reference, admin note, and dispute marker.`}
        action={<PrimaryButton label="View hired tasks" href="/(worker)/offers" />}
      />
    </Screen>
  );
}
