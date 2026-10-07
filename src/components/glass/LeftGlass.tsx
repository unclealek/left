import { useEffect, useState, type ReactNode } from "react";
import { AccessibilityInfo, Platform, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable, type GlassViewProps } from "expo-glass-effect";
import { T } from "../../app/leftTheme";
import { canUseLiquidGlass } from "./liquid-glass-support";

export type LeftGlassProps = ViewProps & {
  children: ReactNode;
  variant?: "card" | "navigation";
  glassEffectStyle?: GlassViewProps["glassEffectStyle"];
  tintColor?: string;
  radius?: number;
  isInteractive?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

/** Printed content stays crisp; only its supporting surface becomes glass.
 * Keep opacity at 1 on this component and its ancestors (including Pressable).
 */
export function LeftGlass({
  children,
  variant = "card",
  glassEffectStyle = variant === "navigation" ? "regular" : "clear",
  tintColor = variant === "navigation" ? T.glassDark : T.glassLight,
  radius = 24,
  isInteractive = false,
  contentStyle,
  style,
  ...viewProps
}: LeftGlassProps) {
  // Start opaque until the accessibility preference has been read.
  const [reduceTransparency, setReduceTransparency] = useState(true);
  useEffect(() => {
    if (Platform.OS !== "ios") return;
    let active = true;
    let changed = false;
    const subscription = AccessibilityInfo.addEventListener("reduceTransparencyChanged", value => {
      changed = true;
      setReduceTransparency(value);
    });
    void AccessibilityInfo.isReduceTransparencyEnabled().then(value => {
      if (active && !changed) setReduceTransparency(value);
    }).catch(() => { /* Keep the opaque, readable fallback. */ });
    return () => { active = false; subscription.remove(); };
  }, []);

  const nativeGlass = canUseLiquidGlass(Platform.OS, reduceTransparency, isLiquidGlassAvailable, isGlassEffectAPIAvailable);
  const navigation = variant === "navigation";
  const fallbackColor = navigation ? T.onboardingInk : T.surfaceCard;
  // These theme scrims put a lower bound on contrast, even over poster artwork.
  const scrimColor = navigation ? T.glassDark : T.glassLightMedium;
  const frame = { borderRadius: radius, borderColor: navigation ? T.glassBorderDark : T.borderBlackSoft };
  const content = <View style={contentStyle}>{children}</View>;

  if (!nativeGlass) {
    return <View {...viewProps} style={[s.frame, style, frame, { backgroundColor: fallbackColor }]}>{content}</View>;
  }

  if (navigation) {
    // Keep the lifted indicator outside the glass's contentView so it cannot be clipped.
    return (
      <View {...viewProps} style={[s.frame, style, frame]}>
        <GlassView pointerEvents="none" glassEffectStyle={glassEffectStyle} tintColor={tintColor}
          colorScheme="dark" isInteractive={false} style={[StyleSheet.absoluteFill, { borderRadius: radius }]} />
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, backgroundColor: scrimColor }]} />
        {content}
      </View>
    );
  }

  return (
    <GlassView {...viewProps} key={isInteractive ? "interactive" : "static"}
      glassEffectStyle={glassEffectStyle} tintColor={tintColor} colorScheme="light"
      isInteractive={isInteractive} style={[s.frame, style, frame]}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, backgroundColor: scrimColor }]} />
      {content}
    </GlassView>
  );
}

const s = StyleSheet.create({
  frame: { position: "relative", backgroundColor: "transparent", borderWidth: 1 },
});
