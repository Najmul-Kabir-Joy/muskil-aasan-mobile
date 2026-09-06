import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

export function BasicInfoStep({
  name,
  onChangeName,
  area,
  onChangeArea,
}: {
  name: string;
  onChangeName: (value: string) => void;
  area: string;
  onChangeArea: (value: string) => void;
}) {
  return (
    <View style={styles.fields}>
      <View style={styles.field}>
        <Text style={styles.label}>Full name</Text>
        <TextInput
          value={name}
          onChangeText={onChangeName}
          placeholder="Your name"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Area in Dhaka</Text>
        <TextInput
          value={area}
          onChangeText={onChangeArea}
          placeholder="e.g. Mirpur 10"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    paddingLeft: spacing.xs,
  },
  input: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
});
