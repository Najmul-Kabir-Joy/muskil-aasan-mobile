export const colors = {
  primary: "#059669",
  primaryDark: "#047857",
  primarySoft: "#D1FAE5",
  // Stronger mint than `primarySoft` — the profile's Edit Profile action and
  // its "N active" count pill, per the finalized Profile Stitch designs
  // (`primary-fixed`).
  primaryLight: "#6EE7B7",
  secondary: "#F59E0B",
  secondaryDark: "#B45309",
  secondarySoft: "#FEF3C7",
  // Between `secondary` and `secondarySoft` — the lighter tail segment of a
  // rating bar (Profile reputation cards).
  secondaryLight: "#FCD34D",
  tertiary: "#0D9488",
  tertiaryDark: "#0F766E",
  tertiarySoft: "#CCFBF1",
  danger: "#EF4444",
  dangerDark: "#B91C1C",
  dangerSoft: "#FEE2E2",
  inverted: "#0F172A",
  appBg: "#F4F5FB",
  card: "#FFFFFF",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
  surface: "#EEF2FF",
  // A more saturated `surface` for small count pills that sit on a white
  // card (e.g. "18 ratings received").
  surfaceStrong: "#E2E7FF",
};

export const fonts = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semiBold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extraBold: "PlusJakartaSans_800ExtraBold",
};

// Semantic typography presets. Only the handful of roles that are actually
// reused across components — not a token per one-off text style. See
// docs/engineering/code-style.md.
export const typography = {
  display: {
    fontFamily: fonts.extraBold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  heading: {
    fontFamily: fonts.extraBold,
    fontSize: 21,
  },
  body: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
  },
  button: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
  // Buttons are fully pill-shaped per the Stitch design system spec
  // ("Primary (Pill): ... radius 9999px") and the exported screen HTML
  // (`rounded-full` on every button) — corrected from an earlier, mistaken
  // 12px reading of a summary swatch image.
  button: 999,
};

export const shadows = {
  card: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  // Barely-there lift for cards sitting on `appBg` — the Profile Stitch
  // designs' `shadow-sm`, lighter than `card`.
  subtle: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  // Elevated Post Job FAB, per the "Bottom Navigation / Job Provider
  // (Attached to Screen)" Stitch design's `.fab-shadow` spec.
  fab: {
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.42,
    shadowRadius: 22,
    elevation: 8,
  },
  // Soft upward shadow cast by the bottom navigation bar onto the content
  // above it, per the same design's `.bottom-bar-filter` spec.
  bottomBar: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
};

// Named gradient presets, analogous to `shadows` — a role name (what the
// gradient is for), not a screen name, so it can be reused if another
// surface wants the same "hero illustration" treatment.
export const gradients = {
  hero: ["#F2F3FF", "#EAEDFF", "#E2E7FF"] as const,
  // Profile cover banner — primary into tertiary, per the finalized Profile
  // Stitch designs (`from-primary to-tertiary`).
  profileCover: [colors.primaryDark, colors.tertiaryDark] as const,
};
