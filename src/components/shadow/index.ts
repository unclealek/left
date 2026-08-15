import type { ViewStyle } from "react-native";
import { alpha, leftColors } from "../color";

export const leftShadows = {
  small: {
    shadowColor: leftColors.inkBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.025,
    shadowRadius: 8,
    elevation: 1,
  } satisfies ViewStyle,
  medium: {
    shadowColor: leftColors.inkBlack,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
  } satisfies ViewStyle,
  large: {
    shadowColor: leftColors.inkBlack,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 3,
  } satisfies ViewStyle,
  glow: {
    shadowColor: alpha(leftColors.inkBlack, 0.18),
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 0,
  } satisfies ViewStyle,
} as const;
