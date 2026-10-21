import type { ReactNode } from "react";
import {
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { BlurView } from "expo-blur";
import { useReducedTransparency } from "../left/use-navigation-accessibility";
import { glassRadii, glassTokens, glassToneTokens, type GlassTone, type GlassVariant } from "./tokens";

export function GlassSurface({
  children,
  variant = "soft",
  tone = "light",
  blurIntensity,
  radius = glassRadii.card,
  padding = 0,
  style,
  contentStyle,
  ...viewProps
}: ViewProps & {
  children: ReactNode;
  variant?: GlassVariant;
  tone?: GlassTone;
  blurIntensity?: number;
  radius?: number;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const reduceTransparency = useReducedTransparency();
  const token = glassTokens[variant];
  const toneToken = glassToneTokens[tone];
  const usesBlur = variant !== "solid" && !reduceTransparency;
  const backgroundColor = toneToken?.backgroundColor ?? token.backgroundColor;
  const reducedTransparencyColor = toneToken?.reducedTransparencyColor ?? token.reducedTransparencyColor;
  const borderColor = toneToken?.borderColor ?? token.borderColor;

  return (
    <View
      {...viewProps}
      style={[
        glassStyles.shell,
        token.shadow,
        {
          borderRadius: radius,
          borderColor,
          backgroundColor: usesBlur ? "transparent" : reducedTransparencyColor,
        },
        style,
      ]}
    >
      {usesBlur ? (
        <BlurView
          pointerEvents="none"
          intensity={blurIntensity ?? token.blurIntensity}
          tint={toneToken?.blurTint ?? "light"}
          experimentalBlurMethod={Platform.OS === "android" ? "dimezisBlurView" : "none"}
          style={[StyleSheet.absoluteFill, { backgroundColor }]}
        />
      ) : null}
      <View style={[glassStyles.content, { padding }, contentStyle]}>{children}</View>
    </View>
  );
}

const glassStyles = StyleSheet.create({
  shell: {
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
  },
  content: {
    position: "relative",
    zIndex: 1,
  },
});
