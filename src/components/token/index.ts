export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 32,
  pill: 999,
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const typography = {
  fontBody: "Manrope_400Regular",
  fontBodyMedium: "Manrope_500Medium",
  fontBodyBold: "Manrope_700Bold",
  fontDisplay: "Manrope_500Medium",
  fontDisplayBold: "Manrope_700Bold",
  fontDisplayLight: "Manrope_300Light",
  display: 56,
  hero: 48,
  h1: 40,
  h2: 32,
  h3: 24,
  title: 20,
  bodyLg: 18,
  body: 16,
  caption: 14,
  tiny: 12,
} as const;

export const motion = {
  calm: 350,
  base: 425,
  slow: 500,
} as const;
