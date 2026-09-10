import { MaterialIcons } from "@expo/vector-icons";
import { BottomTabBarHeightCallbackContext } from "@react-navigation/bottom-tabs";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useContext, useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors, fonts, radius, shadows, spacing } from "@/theme/tokens";

// Exact notch/cradle geometry from the "Bottom Navigation / Job Provider
// (Attached to Screen)" Stitch design — a 375x72 bar with a circular scoop
// carved from the top edge for the Post Job FAB to sit in.
const BAR_VIEWBOX_WIDTH = 375;
const BAR_HEIGHT = 72;
const NOTCH_PATH =
  "M0 0H140C145.5 0 150.2 3.5 152.8 8.5C159.6 21.5 172.5 30.5 187.5 30.5C202.5 30.5 215.4 21.5 222.2 8.5C224.8 3.5 229.5 0 235 0H375V72H0V0Z";

const FAB_SIZE = 58;
const FAB_RING_WIDTH = 2;
const FAB_LIFT = 20;

/**
 * The five Provider bottom-navigation destinations, left to right, as fixed
 * by the Stitch design and the Provider app-shell spec: Home, Responses,
 * Post Job, My Jobs, Profile. `routeName` must match the corresponding
 * `Tabs.Screen` name in `app/(poster)/_layout.tsx`.
 *
 * "Post Job" is not a plain grid entry — it renders as the elevated center
 * action (see `ProviderBottomNav` below) and is listed here only so its
 * position and route name have one source of truth.
 */
export const PROVIDER_NAV_ITEMS = [
  { routeName: "index", label: "Home", icon: "home" as const },
  { routeName: "responses", label: "Responses", icon: "chat-bubble-outline" as const },
  { routeName: "post-task", label: "Post Job", icon: "add" as const },
  { routeName: "tasks", label: "My Jobs", icon: "assignment-turned-in" as const },
  { routeName: "profile", label: "Profile", icon: "person-outline" as const },
] as const;

const POST_JOB_ROUTE_NAME = "post-task";

function useReducedMotionPreference(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((value) => {
        if (mounted) setReduced(value);
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener?.("reduceMotionChanged", (value) => {
      setReduced(value);
    });
    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  return reduced;
}

/**
 * A slow, subtle outer-ring pulse behind the Post Job FAB — draws the eye
 * without being distracting (no bounce, no flash, no large size change).
 * Skips entirely when the user prefers reduced motion; the button itself
 * never depends on this for tappability.
 */
function usePostJobPulse(enabled: boolean) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enabled) {
      progress.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 2200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [enabled, progress]);

  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
  const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });
  return { scale, opacity };
}

/**
 * The persistent Provider bottom navigation bar: a notched cradle SVG
 * background, four regular destinations in a grid with an empty placeholder
 * slot, and the elevated, pulsing "Post Job" FAB seated in the notch.
 *
 * Rendered by `app/(poster)/_layout.tsx` as the `Tabs` navigator's custom
 * `tabBar` — it receives standard `BottomTabBarProps`, so active state and
 * navigation come from React Navigation itself rather than being
 * reimplemented here.
 */
export function ProviderBottomNav({ state, navigation, insets }: BottomTabBarProps) {
  const activeRouteName = state.routes[state.index]?.name;
  const reduceMotion = useReducedMotionPreference();
  const pulse = usePostJobPulse(!reduceMotion);
  const bottomInset = insets.bottom;
  // Reports this custom bar's real rendered height back to the Tabs
  // navigator so it reserves exactly that much space for screen content —
  // otherwise the navigator falls back to a generic default-bar-height
  // guess, which would either gap or overlap our notched shape.
  const reportHeight = useContext(BottomTabBarHeightCallbackContext);

  function navigateTo(routeName: string) {
    if (routeName !== activeRouteName) {
      navigation.navigate(routeName);
    }
  }

  function handleLayout(event: LayoutChangeEvent) {
    reportHeight?.(event.nativeEvent.layout.height);
  }

  return (
    <View style={styles.wrapper} onLayout={handleLayout}>
      <View style={[styles.barShape, shadows.bottomBar]}>
        <Svg
          style={StyleSheet.absoluteFill}
          width="100%"
          height={BAR_HEIGHT}
          viewBox={`0 0 ${BAR_VIEWBOX_WIDTH} ${BAR_HEIGHT}`}
          preserveAspectRatio="none"
        >
          <Path d={NOTCH_PATH} fill={colors.card} />
        </Svg>

        <View style={styles.grid}>
          {PROVIDER_NAV_ITEMS.map((item) => {
            if (item.routeName === POST_JOB_ROUTE_NAME) {
              // Empty placeholder — keeps the 5-column grid spacing under
              // the center action without rendering a normal tab there.
              return (
                <View
                  key={item.routeName}
                  style={styles.gridItem}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                />
              );
            }
            const active = item.routeName === activeRouteName;
            const tintColor = active ? colors.primary : colors.muted;
            return (
              <Pressable
                key={item.routeName}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={item.label}
                onPress={() => navigateTo(item.routeName)}
                style={styles.gridItem}
              >
                <MaterialIcons name={item.icon} size={24} color={tintColor} />
                <Text
                  style={[styles.gridLabel, { color: tintColor }, active && styles.gridLabelActive]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.fabColumn} pointerEvents="box-none">
          {/* Outer white ring separating the FAB from the notch/page
              background behind it, matching the Stitch design's
              `ring-2 ring-white` (in addition to the button's own light
              emerald border). */}
          <View style={styles.fabRing}>
            <View style={styles.fabTouchArea}>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.fabPulseRing,
                  { opacity: pulse.opacity, transform: [{ scale: pulse.scale }] },
                ]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Post a Job"
                onPress={() => navigateTo(POST_JOB_ROUTE_NAME)}
                style={({ pressed }) => [styles.fab, shadows.fab, pressed && styles.fabPressed]}
              >
                <MaterialIcons name="add" size={30} color={colors.card} />
              </Pressable>
            </View>
          </View>
          <Text style={styles.fabLabel}>Post Job</Text>
        </View>
      </View>

      {bottomInset > 0 ? <View style={[styles.safeAreaFill, { height: bottomInset }]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "transparent",
  },
  barShape: {
    height: BAR_HEIGHT,
    width: "100%",
  },
  safeAreaFill: {
    backgroundColor: colors.card,
    width: "100%",
  },
  grid: {
    flexDirection: "row",
    height: "100%",
    width: "100%",
  },
  gridItem: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingTop: spacing.xs,
  },
  gridLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    marginTop: spacing.xxs,
  },
  gridLabelActive: {
    fontFamily: fonts.bold,
  },
  fabColumn: {
    alignItems: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: -FAB_LIFT,
  },
  fabRing: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    height: FAB_SIZE + FAB_RING_WIDTH * 2,
    justifyContent: "center",
    width: FAB_SIZE + FAB_RING_WIDTH * 2,
  },
  fabTouchArea: {
    alignItems: "center",
    height: FAB_SIZE,
    justifyContent: "center",
    width: FAB_SIZE,
  },
  fabPulseRing: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: FAB_SIZE,
    position: "absolute",
    width: FAB_SIZE,
  },
  fab: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: colors.primarySoft,
    borderRadius: radius.pill,
    borderWidth: 4,
    height: FAB_SIZE,
    justifyContent: "center",
    width: FAB_SIZE,
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
  },
  fabLabel: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 10,
    marginTop: spacing.xs,
  },
});
