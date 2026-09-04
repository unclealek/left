import type { ViewStyle } from "react-native";
import { alpha, leftColors } from "../color";

export type GlassVariant = "soft" | "medium" | "solid";
export type GlassTone = "light" | "creole";

export const glassToneTokens = {
  light: null,
  creole: {
    backgroundColor: alpha(leftColors.creoleBrown, 0.92),
    reducedTransparencyColor: alpha(leftColors.creoleBrown, 0.97),
    borderColor: alpha(leftColors.white, 0.22),
    blurTint: "dark" as const,
  },
} as const;

export const glassTokens: Record<GlassVariant, {
  backgroundColor: string;
  reducedTransparencyColor: string;
  borderColor: string;
  blurIntensity: number;
  shadow: ViewStyle;
}> = {
  soft: {
    backgroundColor: alpha(leftColors.white, 0.56),
    reducedTransparencyColor: alpha(leftColors.porcelain, 0.98),
    borderColor: alpha(leftColors.white, 0.58),
    blurIntensity: 28,
    shadow: {
      shadowColor: leftColors.inkBlack,
      shadowOpacity: 0.045,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 2,
    },
  },
  medium: {
    backgroundColor: alpha(leftColors.white, 0.68),
    reducedTransparencyColor: alpha(leftColors.porcelain, 0.98),
    borderColor: alpha(leftColors.white, 0.65),
    blurIntensity: 34,
    shadow: {
      shadowColor: leftColors.inkBlack,
      shadowOpacity: 0.05,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
  },
  solid: {
    backgroundColor: alpha(leftColors.white, 0.96),
    reducedTransparencyColor: alpha(leftColors.white, 0.98),
    borderColor: leftColors.stone,
    blurIntensity: 0,
    shadow: {
      shadowColor: leftColors.inkBlack,
      shadowOpacity: 0.025,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 1,
    },
  },
};

export const glassRadii = {
  control: 14,
  compactCard: 18,
  card: 24,
  largeCard: 30,
  navigation: 24,
  pill: 999,
} as const;
