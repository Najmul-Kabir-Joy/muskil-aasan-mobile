import { MaterialIcons } from "@expo/vector-icons";
import { BottomTabBarHeightCallbackContext, type BottomTabBarProps } from "expo-router/js-tabs";
import { useContext } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import { groupApplications } from "@/features/marketplace/seeker/seekerActivity";
import { useSeekerActivity } from "@/features/marketplace/seeker/SeekerActivityContext";
import { colors, fonts, radius, shadows, spacing } from "@/theme/tokens";

type IconName = keyof typeof MaterialIcons.glyphMap;

const BAR_HEIGHT = 64;

/**
 * The four Job Seeker bottom-navigation destinations, left to right: Home,
 * Applications, Saved, Profile. `routeName` must match the corresponding
 * `Tabs.Screen` name in `app/(worker)/_layout.tsx`. There is deliberately no
 * center action — Job Seekers don't post jobs — and no Earnings or Offers.
 */
export const SEEKER_NAV_ITEMS: {
  routeName: string;
  label: string;
  icon: IconName;
  activeIcon: IconName;
}[] = [
  { routeName: "index", label: "Home", icon: "home", activeIcon: "home" },
  {
    routeName: "applications",
    label: "Applications",
    icon: "assignment",
    activeIcon: "assignment",
  },
  { routeName: "saved", label: "Saved", icon: "bookmark-border", activeIcon: "bookmark" },
  { routeName: "profile", label: "Profile", icon: "person-outline", activeIcon: "person" },
];

/**
 * The persistent Job Seeker bottom navigation — the Seeker counterpart of
 * `ProviderBottomNav`: the same white bar, upward shadow, 10pt labels and
 * primary/muted tints, but a flat four-item row with no notch. The active
 * tab gets a soft mint pill behind its icon so it reads at a glance.
 *
 * Applications carries a small count while job requests are waiting for
 * the Seeker's answer — the one thing in the Seeker experience that needs
 * them to act.
 *
 * Rendered by `app/(worker)/_layout.tsx` as the `Tabs` navigator's custom
 * `tabBar`, so active state and navigation come from React Navigation.
 */
export function SeekerBottomNav({ state, navigation, insets }: BottomTabBarProps) {
  const currentRouteName = state.routes[state.index]?.name;
  const { applications } = useSeekerActivity();
  const jobRequestCount = groupApplications(applications).jobRequests.length;
  // Reports the bar's real height so the navigator reserves exactly that
  // much space for screen content (see `ProviderBottomNav`).
  const reportHeight = useContext(BottomTabBarHeightCallbackContext);

  function navigateTo(routeName: string) {
    if (routeName !== currentRouteName) {
      navigation.navigate(routeName);
    }
  }

  function handleLayout(event: LayoutChangeEvent) {
    reportHeight?.(event.nativeEvent.layout.height);
  }

  return (
    <View
      style={[styles.bar, shadows.bottomBar, { paddingBottom: insets.bottom }]}
      onLayout={handleLayout}
    >
      <View style={styles.row}>
        {SEEKER_NAV_ITEMS.map((item) => {
          const active = item.routeName === currentRouteName;
          const tintColor = active ? colors.primary : colors.muted;
          const badgeCount = item.routeName === "applications" ? jobRequestCount : 0;
          return (
            <Pressable
              key={item.routeName}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={
                badgeCount > 0
                  ? `${item.label}, ${badgeCount} job ${badgeCount === 1 ? "request" : "requests"} waiting`
                  : item.label
              }
              onPress={() => navigateTo(item.routeName)}
              style={styles.item}
            >
              <View style={[styles.iconPill, active && styles.iconPillActive]}>
                <MaterialIcons
                  name={active ? item.activeIcon : item.icon}
                  size={22}
                  color={tintColor}
                />
                {badgeCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badgeCount}</Text>
                  </View>
                ) : null}
              </View>
              <Text
                numberOfLines={1}
                style={[styles.label, { color: tintColor }, active && styles.labelActive]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.card,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: "row",
    height: BAR_HEIGHT,
    paddingHorizontal: spacing.xs,
  },
  item: {
    alignItems: "center",
    flex: 1,
    gap: spacing.xxs,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 0,
  },
  iconPill: {
    alignItems: "center",
    borderRadius: radius.pill,
    height: 30,
    justifyContent: "center",
    width: 56,
  },
  iconPillActive: {
    backgroundColor: colors.primarySoft,
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderColor: colors.card,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 18,
    justifyContent: "center",
    minWidth: 18,
    paddingHorizontal: 3,
    position: "absolute",
    right: 8,
    top: -4,
  },
  badgeText: {
    color: colors.card,
    fontFamily: fonts.extraBold,
    fontSize: 10,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  labelActive: {
    fontFamily: fonts.bold,
  },
});
