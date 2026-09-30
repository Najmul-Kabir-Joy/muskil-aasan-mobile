import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge } from "@/shared/components/ui";
import { BRAND_NAME } from "@/shared/constants/brand";
import { PROTOTYPE_SEEKER_ROUTE } from "@/shared/constants/routes";
import { colors, fonts, radius, shadows, spacing } from "@/theme/tokens";

const DRAWER_WIDTH_RATIO = 0.84;
const DRAWER_MAX_WIDTH = 340;
const OPEN_ANIMATION_MS = 300;
const CLOSE_ANIMATION_MS = 240;

// Prototype/mock user identity — the same "Nadia Rahman, Mirpur" identity
// the Profile tab (`getCurrentUserProfile`) and ProviderAppHeader use. No
// real phone number exists anywhere in the app, so it's shown masked,
// matching the Stitch design's own masked-phone treatment. See
// docs/engineering/domain-and-terminology.md.
const CURRENT_USER = {
  name: "Nadia Rahman",
  initials: "NR",
  area: "Mirpur, Dhaka",
  maskedPhone: "+880 17••••••••",
};

type DrawerRoute = { kind: "route"; href: string } | { kind: "comingSoon"; title: string };

function comingSoon(title: string): DrawerRoute {
  return { kind: "comingSoon", title };
}

const SECONDARY_ACTIONS: {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  destination: DrawerRoute;
  statusBadge?: { label: string; tone: "warning" };
}[] = [
  {
    key: "saved-jobs",
    label: "Saved Jobs",
    icon: "bookmark",
    destination: comingSoon("Saved Jobs"),
  },
  {
    key: "identity-setup",
    label: "Identity Setup",
    icon: "badge",
    destination: comingSoon("Identity Setup"),
    statusBadge: { label: "Not added", tone: "warning" },
  },
  {
    key: "job-interests",
    label: "Job Interests",
    icon: "interests",
    destination: comingSoon("Job Interests"),
  },
];

const ACCOUNT_ROWS: {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  destination: DrawerRoute;
  trailingValue?: string;
}[] = [
  {
    key: "personal-info",
    label: "Personal Information",
    icon: "person",
    destination: comingSoon("Personal Information"),
  },
  {
    key: "location-area",
    label: "Location / Area",
    icon: "location-on",
    destination: comingSoon("Location / Area"),
    trailingValue: CURRENT_USER.area,
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: "notifications",
    destination: comingSoon("Notifications"),
  },
];

const SUPPORT_ROWS: {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  destination: DrawerRoute;
}[] = [
  {
    key: "help-support",
    label: "Help & Support",
    icon: "help-outline",
    destination: { kind: "route", href: "/(poster)/support" },
  },
  {
    key: "terms",
    label: "Terms & Conditions",
    icon: "description",
    destination: comingSoon("Terms & Conditions"),
  },
  {
    key: "privacy",
    label: "Privacy Policy",
    icon: "policy",
    destination: comingSoon("Privacy Policy"),
  },
];

/**
 * The canonical Job Provider navigation drawer — "Drawer / Job Provider
 * (Variant A — Clean Grouped Flow)" in Stitch. Opened/closed by
 * `app/(poster)/_layout.tsx`, which owns `visible`/`onClose`; this component
 * only renders content and the slide/overlay animation.
 *
 * Uses a plain RN `Modal` (transparent, `onRequestClose`) rather than a
 * drawer-navigation dependency — it's the smallest primitive that already
 * gives us Android hardware-back handling for free, and the slide/fade
 * itself is a two-value `Animated` timing (decelerating in, accelerating
 * out), matching how the Post Job FAB pulse already does its animation
 * without `reanimated`. The Modal itself is kept mounted for the duration
 * of the closing animation — its own `visible` prop would otherwise dismiss
 * it instantly and cut the slide-out off before it can play.
 */
export function ProviderDrawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  // Read once here, in the normal app tree, rather than via a <SafeAreaView>
  // rendered inside the Modal below — a Modal renders into its own native
  // root, and `react-native-safe-area-context` doesn't reliably re-measure
  // insets for content nested inside one. The numeric values stay correct
  // for the modal (it covers the same physical screen), so read them here
  // and apply as plain padding instead.
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const drawerWidth = Math.min(windowWidth * DRAWER_WIDTH_RATIO, DRAWER_MAX_WIDTH);
  // Plain `useState` initializers (not `useRef`) keep these stable,
  // one-time-created `Animated.Value`s without tripping the
  // react-hooks/refs rule, which disallows reading a ref's `.current`
  // during render (the `transform` style and effect deps below).
  const [translateX] = useState(() => new Animated.Value(drawerWidth));
  const [overlayOpacity] = useState(() => new Animated.Value(0));
  // A `Modal`'s `visible` prop dismisses it immediately (no chance for our
  // own closing animation to play) — so this is kept true for the duration
  // of the close animation, and only turns false once it finishes. Opening
  // flips it true right away so the Modal is present for the open animation
  // to animate into.
  const [isMounted, setIsMounted] = useState(visible);

  // Adjusted directly during render (not in an effect) per React's guidance
  // for deriving state from a prop change — this makes the Modal present
  // for the open-animation effect below in the same render pass, with no
  // extra flicker frame where the Modal is still hidden.
  if (visible && !isMounted) {
    setIsMounted(true);
  }

  useEffect(() => {
    // Nothing to animate closed if it's opening, or was never opened.
    if (visible || !isMounted) return;

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: drawerWidth,
        duration: CLOSE_ANIMATION_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: CLOSE_ANIMATION_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setIsMounted(false);
    });
  }, [visible, isMounted, drawerWidth, translateX, overlayOpacity]);

  useEffect(() => {
    if (!isMounted || !visible) return;
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: OPEN_ANIMATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: OPEN_ANIMATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [isMounted, visible, drawerWidth, translateX, overlayOpacity]);

  function navigateTo(destination: DrawerRoute) {
    onClose();
    if (destination.kind === "route") {
      router.push(destination.href);
    } else {
      router.push({ pathname: "/(poster)/coming-soon", params: { title: destination.title } });
    }
  }

  function handleViewProfile() {
    onClose();
    router.push("/(poster)/profile");
  }

  function handleSwitchToJobSeeker() {
    onClose();
    router.replace(PROTOTYPE_SEEKER_ROUTE);
  }

  function handleLogOut() {
    onClose();
    // No real session/auth exists in this prototype — the smallest safe
    // interaction is returning to the pre-auth welcome screen.
    router.replace("/");
  }

  return (
    <Modal visible={isMounted} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <Pressable
            // Tap-outside-to-close scrim. Given its own distinct label
            // (rather than hidden from accessibility entirely) so a screen
            // reader user exploring by touch learns what tapping here does,
            // instead of finding an unexplained silent touch target.
            accessibilityRole="button"
            accessibilityLabel="Close navigation menu overlay"
            style={StyleSheet.absoluteFill}
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View style={[styles.drawer, { width: drawerWidth, transform: [{ translateX }] }]}>
          <View
            style={[
              styles.drawerSafeArea,
              {
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
                paddingRight: insets.right,
              },
            ]}
          >
            <View style={styles.drawerTopBar}>
              <Text style={styles.drawerBrand}>{BRAND_NAME}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close navigation menu"
                onPress={onClose}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={20} color={colors.muted} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* User summary */}
              <View style={styles.userCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{CURRENT_USER.initials}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{CURRENT_USER.name}</Text>
                  <View style={styles.userAreaRow}>
                    <MaterialIcons name="location-on" size={13} color={colors.primary} />
                    <Text style={styles.userAreaText}>{CURRENT_USER.area}</Text>
                  </View>
                  <Text style={styles.userPhone}>{CURRENT_USER.maskedPhone}</Text>
                  <View style={styles.viewProfileDivider}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={handleViewProfile}
                      style={styles.viewProfileRow}
                    >
                      <Text style={styles.viewProfileText}>View Profile</Text>
                      <MaterialIcons name="arrow-forward" size={14} color={colors.primary} />
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Switch mode */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Switch mode</Text>
                <View style={styles.switchModeCard}>
                  <View style={[styles.modeRow, styles.modeRowActive]}>
                    <View style={styles.modeRowLeft}>
                      <View style={[styles.modeIcon, styles.modeIconActive]}>
                        <MaterialIcons name="person-search" size={20} color={colors.primary} />
                      </View>
                      <View style={styles.modeTextColumn}>
                        <View style={styles.modeTitleRow}>
                          <Text style={styles.modeTitleActive}>Job Provider</Text>
                          <Badge label="ACTIVE" tone="success" />
                        </View>
                        <Text style={styles.modeSubtitle}>I need help</Text>
                      </View>
                    </View>
                    <View style={styles.activeCheck}>
                      <MaterialIcons name="check" size={14} color={colors.card} />
                    </View>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Switch to Job Seeker"
                    onPress={handleSwitchToJobSeeker}
                    style={styles.modeRow}
                  >
                    <View style={styles.modeRowLeft}>
                      <View style={styles.modeIcon}>
                        <MaterialIcons name="work" size={20} color={colors.muted} />
                      </View>
                      <View style={styles.modeTextColumn}>
                        <Text style={styles.modeTitle}>Job Seeker</Text>
                        <Text style={styles.modeSubtitle}>I want to help &amp; earn</Text>
                      </View>
                    </View>
                    <View style={styles.switchPill}>
                      <Text style={styles.switchPillText}>Switch</Text>
                      <MaterialIcons name="swap-horiz" size={14} color={colors.muted} />
                    </View>
                  </Pressable>
                </View>
                <Text style={styles.switchModeCaption}>One account • Switch anytime</Text>
              </View>

              {/* Secondary actions */}
              <View style={styles.rowCard}>
                {SECONDARY_ACTIONS.map((item, index) => (
                  <Pressable
                    key={item.key}
                    accessibilityRole="button"
                    onPress={() => navigateTo(item.destination)}
                    style={[styles.row, index > 0 && styles.rowDivider]}
                  >
                    <View style={styles.rowLeft}>
                      <MaterialIcons name={item.icon} size={20} color={colors.muted} />
                      <Text style={styles.rowLabel}>{item.label}</Text>
                    </View>
                    <View style={styles.rowRight}>
                      {item.statusBadge ? (
                        <Badge label={item.statusBadge.label} tone={item.statusBadge.tone} />
                      ) : null}
                      <MaterialIcons name="chevron-right" size={18} color={colors.muted} />
                    </View>
                  </Pressable>
                ))}
              </View>

              {/* Account & preferences */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Account &amp; Preferences</Text>
                <View style={styles.rowCard}>
                  {ACCOUNT_ROWS.map((item, index) => (
                    <Pressable
                      key={item.key}
                      accessibilityRole="button"
                      onPress={() => navigateTo(item.destination)}
                      style={[styles.row, index > 0 && styles.rowDivider]}
                    >
                      <View style={styles.rowLeft}>
                        <MaterialIcons name={item.icon} size={20} color={colors.muted} />
                        <Text style={styles.rowLabel}>{item.label}</Text>
                      </View>
                      <View style={styles.rowRight}>
                        {item.trailingValue ? (
                          <Text style={styles.rowTrailingValue}>{item.trailingValue}</Text>
                        ) : null}
                        <MaterialIcons name="chevron-right" size={18} color={colors.muted} />
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Support & legal */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Support &amp; Legal</Text>
                <View style={styles.rowCard}>
                  {SUPPORT_ROWS.map((item, index) => (
                    <Pressable
                      key={item.key}
                      accessibilityRole="button"
                      onPress={() => navigateTo(item.destination)}
                      style={[styles.row, index > 0 && styles.rowDivider]}
                    >
                      <View style={styles.rowLeft}>
                        <MaterialIcons name={item.icon} size={20} color={colors.muted} />
                        <Text style={styles.rowLabel}>{item.label}</Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={18} color={colors.muted} />
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Log out */}
              <View style={styles.logOutSection}>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleLogOut}
                  style={styles.logOutButton}
                >
                  <MaterialIcons name="logout" size={20} color={colors.danger} />
                  <Text style={styles.logOutText}>Log Out</Text>
                </Pressable>
                <Text style={styles.versionText}>{BRAND_NAME} v1.0.0 • Dhaka, BD</Text>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.scrim,
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
    ...shadows.card,
  },
  drawerSafeArea: {
    flex: 1,
  },
  drawerTopBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  drawerBrand: {
    color: colors.primary,
    fontFamily: fonts.extraBold,
    fontSize: 18,
    letterSpacing: -0.2,
  },
  closeButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  userCard: {
    alignItems: "flex-start",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    ...shadows.card,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: colors.primarySoft,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  avatarText: {
    color: colors.card,
    fontFamily: fonts.extraBold,
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 16,
  },
  userAreaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
    marginTop: 2,
  },
  userAreaText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  userPhone: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12,
    letterSpacing: 0.4,
    marginTop: 2,
  },
  viewProfileDivider: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  viewProfileRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
  },
  viewProfileText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  section: {
    gap: spacing.xs,
  },
  sectionLabel: {
    color: colors.muted,
    fontFamily: fonts.extraBold,
    fontSize: 11,
    letterSpacing: 0.6,
    paddingHorizontal: spacing.xs,
    textTransform: "uppercase",
  },
  switchModeCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xxs,
    padding: spacing.xs,
  },
  modeRow: {
    alignItems: "center",
    borderRadius: radius.md,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.sm,
  },
  modeRowActive: {
    backgroundColor: colors.card,
    borderColor: colors.primarySoft,
    borderWidth: 1,
    ...shadows.card,
  },
  modeRowLeft: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: spacing.sm,
  },
  modeIcon: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  modeIconActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primarySoft,
    borderWidth: 1,
  },
  modeTextColumn: {
    flexShrink: 1,
    gap: 2,
  },
  modeTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  modeTitleActive: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 14,
  },
  modeTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  modeSubtitle: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  activeCheck: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  switchPill: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  switchPillText: {
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  switchModeCaption: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 11,
    textAlign: "center",
  },
  rowCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    ...shadows.card,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.sm,
  },
  rowDivider: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  rowLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  rowLabel: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  rowRight: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  rowTrailingValue: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  logOutSection: {
    paddingTop: spacing.xxs,
  },
  logOutButton: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.card,
  },
  logOutText: {
    color: colors.danger,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  versionText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 10,
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
