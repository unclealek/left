import type { ViewStyle } from "react-native";
import { leftColors } from "../color";

export type GlassVariant = "soft" | "medium" | "solid";
export type GlassTone = "light" | "creole";

export const glassToneTokens = {
  light: null,
  creole: {
    backgroundColor: "rgba(31,14,6,0.58)",
    reducedTransparencyColor: "rgba(31,14,6,0.97)",
    borderColor: "rgba(255,255,255,0.22)",
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
    backgroundColor: "rgba(255,255,255,0.56)",
    reducedTransparencyColor: "rgba(251,247,245,0.98)",
    borderColor: "rgba(255,255,255,0.58)",
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
    backgroundColor: "rgba(255,255,255,0.68)",
    reducedTransparencyColor: "rgba(251,247,245,0.98)",
    borderColor: "rgba(255,255,255,0.65)",
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
    backgroundColor: "rgba(255,255,255,0.96)",
    reducedTransparencyColor: "rgba(255,255,255,0.98)",
    borderColor: "#E8E2DC",
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
