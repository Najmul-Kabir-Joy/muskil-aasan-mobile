import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionButton, AppText, Badge, SelectableChip } from "@/shared/components/ui";
import { DHAKA_AREAS } from "@/shared/constants/areas";
import { categories } from "@/data/mock";
import { colors, fonts, radius, shadows, spacing } from "@/theme/tokens";

const MAX_PHOTOS = 5;
const DESCRIPTION_MAX_LENGTH = 500;
const TIMING_OPTIONS = ["Today", "Tomorrow", "Custom"] as const;
const BUDGET_QUICK_PICKS = ["500", "800", "1200", "2000"];

type WorkMode = "inPerson" | "remote";

function formatCustomDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCustomTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// Compares calendar dates only (local time), ignoring time-of-day — today
// itself counts as "today or future". Used as an application-level backstop
// so a past date can never be accepted even if the native picker's own
// `minimumDate` fails to block it (observed under a fast synthetic scroll
// gesture in manual testing).
function isTodayOrFuture(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compared = new Date(date);
  compared.setHours(0, 0, 0, 0);
  return compared.getTime() >= today.getTime();
}

/**
 * Frontend-only "Post a Job" prototype. No backend, no persistence, no real
 * job creation — pressing "Post Job" only shows a local confirmation. See
 * docs/engineering/domain-and-terminology.md.
 */
export default function PostJobScreen() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [workMode, setWorkMode] = useState<WorkMode>("inPerson");
  const [area, setArea] = useState("");
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);
  const [timing, setTiming] = useState<(typeof TIMING_OPTIONS)[number] | "">("");
  // Tracked independently (not merged into one Date) so picking one doesn't
  // make the other's placeholder disappear before the person has actually
  // chosen it.
  const [customDatePart, setCustomDatePart] = useState<Date | null>(null);
  const [customTimePart, setCustomTimePart] = useState<Date | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [budget, setBudget] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Only the day matters here — today itself is still selectable, only
  // strictly earlier calendar days are disallowed.
  const minimumDate = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  function handleDateChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === "android") {
      setDatePickerOpen(false);
    }
    if (event.type === "set" && selected && isTodayOrFuture(selected)) {
      setCustomDatePart(selected);
    }
  }

  function handleTimeChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === "android") {
      setTimePickerOpen(false);
    }
    if (event.type === "set" && selected) {
      setCustomTimePart(selected);
    }
  }

  async function addPhoto(source: "camera" | "gallery") {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        source === "camera"
          ? "Enable camera permission in your device settings to take this photo."
          : "Enable photo library permission in your device settings to choose this photo.",
      );
      return;
    }
    try {
      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true })
          : await ImagePicker.launchImageLibraryAsync({ quality: 0.6, allowsEditing: true });
      const uri = result.assets?.[0]?.uri;
      if (!result.canceled && uri) {
        setPhotos((current) => (current.length >= MAX_PHOTOS ? current : [...current, uri]));
      }
    } catch {
      Alert.alert("Something went wrong", "Try again in a moment.");
    }
  }

  function removePhoto(index: number) {
    setPhotos((current) => current.filter((_, i) => i !== index));
  }

  const canSubmit =
    title.trim().length > 0 &&
    category.length > 0 &&
    description.trim().length > 0 &&
    (workMode === "remote" || area.length > 0) &&
    timing.length > 0 &&
    (timing !== "Custom" ||
      (customDatePart !== null && isTodayOrFuture(customDatePart) && customTimePart !== null)) &&
    budget.length > 0 &&
    Number(budget) > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    setSubmitted(true);
  }

  const timingLabel =
    timing === "Custom" && customDatePart && customTimePart
      ? `${formatCustomDate(customDatePart)}, ${formatCustomTime(customTimePart)}`
      : timing || "Timing";

  const summaryText = [
    category || "Category",
    workMode === "remote" ? "Remote" : area || "Area",
    timingLabel,
    budget ? `৳${Number(budget).toLocaleString()}` : "Budget",
  ].join(" • ");

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.localHeader}>
          <View style={styles.localHeaderText}>
            <Text style={styles.localHeaderTitle}>Post a Job</Text>
            <AppText style={styles.localHeaderSubtitle}>
              Tell people what you need help with
            </AppText>
          </View>
        </View>

        {/* Title & category */}
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>
              What do you need help with? <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Need someone to assemble a wardrobe"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>
              Category <Text style={styles.required}>*</Text>
            </Text>
            <AppText style={styles.helperText}>Choose the category that fits best</AppText>
            <Pressable
              accessibilityRole="button"
              onPress={() => setCategoryPickerOpen(true)}
              style={styles.selectButton}
            >
              <View style={styles.selectButtonContent}>
                <MaterialIcons name="category" size={20} color={colors.primary} />
                <Text style={[styles.selectButtonText, !category && styles.placeholderText]}>
                  {category || "Choose a category"}
                </Text>
              </View>
              <MaterialIcons name="expand-more" size={20} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.label}>
            Describe the job <Text style={styles.required}>*</Text>
          </Text>
          <AppText style={styles.helperText}>
            Add useful details so people understand exactly what you need.
          </AppText>
          <TextInput
            value={description}
            onChangeText={(text) => setDescription(text.slice(0, DESCRIPTION_MAX_LENGTH))}
            multiline
            maxLength={DESCRIPTION_MAX_LENGTH}
            placeholder="Add enough detail so others understand the job clearly."
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.textArea]}
          />
          <View style={styles.descriptionFooter}>
            <AppText style={styles.helperText}>
              Add enough detail so others understand the job clearly.
            </AppText>
            <Text style={styles.charCount}>
              {description.length}/{DESCRIPTION_MAX_LENGTH}
            </Text>
          </View>
        </View>

        {/* Photos */}
        <View style={styles.card}>
          <View style={styles.photosHeaderRow}>
            <View style={styles.photosHeaderText}>
              <View style={styles.photosTitleRow}>
                <Text style={styles.cardTitle}>Add photos</Text>
                <Badge label="Optional" />
              </View>
              <AppText style={styles.helperText}>
                Add up to {MAX_PHOTOS} photos to help people understand the job.
              </AppText>
            </View>
            <Text style={styles.photoCount}>
              {photos.length}/{MAX_PHOTOS} photos
            </Text>
          </View>

          {photos.length < MAX_PHOTOS ? (
            <View style={styles.photoActionsRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Take Photo"
                onPress={() => addPhoto("camera")}
                style={styles.photoActionButton}
              >
                <MaterialIcons name="photo-camera" size={18} color={colors.primary} />
                <Text style={styles.photoActionText}>Take Photo</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Gallery"
                onPress={() => addPhoto("gallery")}
                style={styles.photoActionButton}
              >
                <MaterialIcons name="image" size={18} color={colors.secondaryDark} />
                <Text style={styles.photoActionText}>Gallery</Text>
              </Pressable>
            </View>
          ) : null}

          {photos.length > 0 ? (
            <View style={styles.photoGrid}>
              {photos.map((uri, index) => (
                <View key={`${uri}-${index}`} style={styles.photoThumb}>
                  <Image source={{ uri }} style={styles.photoImage} />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove photo ${index + 1}`}
                    onPress={() => removePhoto(index)}
                    style={styles.photoRemoveButton}
                  >
                    <MaterialIcons name="close" size={14} color={colors.card} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Location */}
        <View style={styles.card}>
          <Text style={styles.label}>
            Where is the job? <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.segmentedRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: workMode === "inPerson" }}
              onPress={() => setWorkMode("inPerson")}
              style={[styles.segmentButton, workMode === "inPerson" && styles.segmentButtonActive]}
            >
              <MaterialIcons
                name="check-circle"
                size={16}
                color={workMode === "inPerson" ? colors.primary : colors.muted}
              />
              <Text
                style={[styles.segmentText, workMode === "inPerson" && styles.segmentTextActive]}
              >
                In person
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: workMode === "remote" }}
              onPress={() => setWorkMode("remote")}
              style={[styles.segmentButton, workMode === "remote" && styles.segmentButtonActive]}
            >
              <MaterialIcons
                name="computer"
                size={16}
                color={workMode === "remote" ? colors.primary : colors.muted}
              />
              <Text style={[styles.segmentText, workMode === "remote" && styles.segmentTextActive]}>
                Remote
              </Text>
            </Pressable>
          </View>

          {workMode === "inPerson" ? (
            <View style={styles.field}>
              <Text style={styles.labelSmall}>
                Area in Dhaka <Text style={styles.required}>*</Text>
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setAreaPickerOpen(true)}
                style={styles.selectButton}
              >
                <View style={styles.selectButtonContent}>
                  <MaterialIcons name="location-on" size={20} color={colors.secondaryDark} />
                  <Text style={[styles.selectButtonText, !area && styles.placeholderText]}>
                    {area || "Select area (e.g. Mirpur 10, Dhaka)"}
                  </Text>
                </View>
                <MaterialIcons name="expand-more" size={20} color={colors.muted} />
              </Pressable>
            </View>
          ) : null}
        </View>

        {/* Timing */}
        <View style={styles.card}>
          <Text style={styles.label}>
            When do you need it? <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.chipsRow}>
            {TIMING_OPTIONS.map((option) => (
              <SelectableChip
                key={option}
                label={option}
                selected={timing === option}
                onPress={() => setTiming(option)}
              />
            ))}
          </View>
          {timing === "Custom" ? (
            <View style={styles.field}>
              <Text style={styles.labelSmall}>
                Date & time <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.customDateRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setDatePickerOpen(true)}
                  style={[styles.selectButton, styles.customDateButton]}
                >
                  <MaterialIcons name="event" size={18} color={colors.primary} />
                  <Text
                    style={[styles.selectButtonText, !customDatePart && styles.placeholderText]}
                  >
                    {customDatePart ? formatCustomDate(customDatePart) : "Select date"}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setTimePickerOpen(true)}
                  style={[styles.selectButton, styles.customDateButton]}
                >
                  <MaterialIcons name="schedule" size={18} color={colors.primary} />
                  <Text
                    style={[styles.selectButtonText, !customTimePart && styles.placeholderText]}
                  >
                    {customTimePart ? formatCustomTime(customTimePart) : "Select time"}
                  </Text>
                </Pressable>
              </View>

              {datePickerOpen ? (
                <View style={styles.inlinePickerWrap}>
                  <DateTimePicker
                    value={customDatePart ?? new Date()}
                    mode="date"
                    minimumDate={minimumDate}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleDateChange}
                  />
                  {Platform.OS === "ios" ? (
                    <ActionButton label="Done" onPress={() => setDatePickerOpen(false)} />
                  ) : null}
                </View>
              ) : null}

              {timePickerOpen ? (
                <View style={styles.inlinePickerWrap}>
                  <DateTimePicker
                    value={customTimePart ?? new Date()}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleTimeChange}
                  />
                  {Platform.OS === "ios" ? (
                    <ActionButton label="Done" onPress={() => setTimePickerOpen(false)} />
                  ) : null}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Budget */}
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>
              Your budget <Text style={styles.required}>*</Text>
            </Text>
            <AppText style={styles.helperText}>
              Enter the amount you expect to pay for this job.
            </AppText>
          </View>
          <View style={styles.budgetCard}>
            <Text style={styles.budgetSymbol}>৳</Text>
            <TextInput
              value={budget}
              onChangeText={(text) => setBudget(text.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.muted}
              style={styles.budgetInput}
            />
            <Text style={styles.budgetCurrency}>BDT</Text>
          </View>
          <View style={styles.chipsRow}>
            {BUDGET_QUICK_PICKS.map((amount) => (
              <SelectableChip
                key={amount}
                label={`৳${Number(amount).toLocaleString()}`}
                selected={budget === amount}
                onPress={() => setBudget(amount)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.stickyFooter}>
        {submitted ? (
          <View style={styles.successRow}>
            <View style={styles.successText}>
              <View style={styles.successTitleRow}>
                <MaterialIcons name="check-circle" size={18} color={colors.primary} />
                <Text style={styles.successTitle}>Job posted</Text>
              </View>
              <AppText style={styles.successSubtitle}>
                This is a prototype — no real job was created or sent anywhere.
              </AppText>
            </View>
            <ActionButton label="Back to Home" onPress={() => router.replace("/(poster)")} />
          </View>
        ) : (
          <>
            <View style={styles.summaryChip}>
              <Text style={styles.summaryChipText} numberOfLines={1}>
                {summaryText}
              </Text>
            </View>
            <ActionButton label="Post Job →" onPress={handleSubmit} disabled={!canSubmit} />
          </>
        )}
      </View>

      <Modal
        visible={categoryPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryPickerOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setCategoryPickerOpen(false)} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Choose a category</Text>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setCategory(item.label);
                  setCategoryPickerOpen(false);
                }}
                style={styles.modalRow}
              >
                <Text style={styles.modalRowText}>{item.label}</Text>
                {category === item.label ? (
                  <MaterialIcons name="check" size={18} color={colors.primary} />
                ) : null}
              </Pressable>
            )}
          />
        </View>
      </Modal>

      <Modal
        visible={areaPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setAreaPickerOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setAreaPickerOpen(false)} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select area</Text>
          <FlatList
            data={DHAKA_AREAS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setArea(item);
                  setAreaPickerOpen(false);
                }}
                style={styles.modalRow}
              >
                <Text style={styles.modalRowText}>{item}</Text>
                {area === item ? (
                  <MaterialIcons name="check" size={18} color={colors.primary} />
                ) : null}
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.appBg,
    flex: 1,
  },
  scrollContent: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  localHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  localHeaderText: {
    flex: 1,
    gap: 2,
  },
  localHeaderTitle: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 20,
  },
  localHeaderSubtitle: {
    fontSize: 13,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    gap: spacing.sm,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  labelSmall: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  required: {
    color: colors.danger,
  },
  helperText: {
    fontSize: 12,
  },
  input: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  textArea: {
    minHeight: 110,
    paddingTop: spacing.md,
    textAlignVertical: "top",
  },
  descriptionFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  charCount: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  selectButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  selectButtonContent: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: spacing.sm,
  },
  selectButtonText: {
    color: colors.text,
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  placeholderText: {
    color: colors.muted,
    fontFamily: fonts.regular,
  },
  photosHeaderRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  photosHeaderText: {
    flex: 1,
    gap: 2,
  },
  photosTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  photoCount: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 11,
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  photoActionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  photoActionButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
    height: 44,
    justifyContent: "center",
  },
  photoActionText: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  photoThumb: {
    borderRadius: radius.sm,
    height: 64,
    overflow: "hidden",
    width: 64,
  },
  photoImage: {
    height: "100%",
    width: "100%",
  },
  photoRemoveButton: {
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    borderRadius: radius.pill,
    height: 18,
    justifyContent: "center",
    position: "absolute",
    right: 3,
    top: 3,
    width: 18,
  },
  segmentedRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xxs,
    padding: spacing.xxs,
  },
  segmentButton: {
    alignItems: "center",
    borderRadius: radius.pill,
    flex: 1,
    flexDirection: "row",
    gap: spacing.xxs,
    height: 40,
    justifyContent: "center",
  },
  segmentButtonActive: {
    backgroundColor: colors.card,
    ...shadows.card,
  },
  segmentText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  segmentTextActive: {
    color: colors.text,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  customDateRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  customDateButton: {
    flex: 1,
  },
  inlinePickerWrap: {
    alignItems: "center",
    gap: spacing.sm,
  },
  budgetCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  budgetSymbol: {
    alignItems: "center",
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.pill,
    color: colors.secondaryDark,
    fontFamily: fonts.extraBold,
    fontSize: 18,
    height: 40,
    lineHeight: 40,
    textAlign: "center",
    width: 40,
  },
  budgetInput: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.extraBold,
    fontSize: 22,
    padding: 0,
  },
  budgetCurrency: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  stickyFooter: {
    backgroundColor: colors.card,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  summaryChip: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    maxWidth: "100%",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  summaryChipText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  successRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  successText: {
    flex: 1,
    gap: 2,
  },
  successTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  successTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  successSubtitle: {
    fontSize: 12,
  },
  modalBackdrop: {
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    flex: 1,
  },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: "70%",
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  modalTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  modalRow: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  modalRowText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
});
