export const colors = {
  primary: "#059669",
  primaryDark: "#047857",
  primarySoft: "#D1FAE5",
  secondary: "#F59E0B",
  secondaryDark: "#B45309",
  secondarySoft: "#FEF3C7",
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
};
