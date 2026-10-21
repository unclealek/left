import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable, type GlassViewProps } from 'expo-glass-effect';
import { T } from '../theme';
import { useReducedTransparency } from '../left/use-navigation-accessibility';
import { canUseLiquidGlass } from './liquid-glass-support';

type GlassMaterialProps = ViewProps & {
  reduceTransparency: boolean;
  fallbackColor: string;
  blurFallback?: boolean;
  glassEffectStyle?: GlassViewProps['glassEffectStyle'];
  colorScheme?: GlassViewProps['colorScheme'];
  tintColor?: string;
  isInteractive?: boolean;
  scrimColor?: string;
};

/** One native material/fallback implementation, shared by cards and tab navigation. */
export function GlassMaterial({
  reduceTransparency, fallbackColor, blurFallback = false,
  glassEffectStyle = 'regular', colorScheme = 'light', tintColor,
  isInteractive = false, scrimColor, children, style, ...viewProps
}: GlassMaterialProps) {
  if (canUseLiquidGlass(Platform.OS, reduceTransparency, isLiquidGlassAvailable, isGlassEffectAPIAvailable)) {
    const content = scrimColor ? <>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: scrimColor, borderRadius: StyleSheet.flatten(style)?.borderRadius }]} />
      {children}
    </> : children;
    return <GlassView {...viewProps} glassEffectStyle={glassEffectStyle} colorScheme={colorScheme}
      tintColor={tintColor} isInteractive={isInteractive} style={style}>{content}</GlassView>;
  }
  if (blurFallback && Platform.OS === 'ios' && !reduceTransparency) {
    return <BlurView {...viewProps} intensity={65}
      tint={colorScheme === 'dark' ? "systemMaterialDark" : "systemMaterialLight"}
      style={[style, { overflow: 'hidden' }]}>{children}</BlurView>;
  }
  return <View {...viewProps} style={[style, { backgroundColor: fallbackColor }]}>{children}</View>;
}

export type LeftGlassProps = ViewProps & {
  children: ReactNode;
  glassEffectStyle?: GlassViewProps['glassEffectStyle'];
  tintColor?: string;
  radius?: number;
  isInteractive?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

/** The established card treatment; keep opacity at 1 on this and its ancestors. */
export function LeftGlass({
  children, glassEffectStyle = 'clear', tintColor = T.glassLight,
  radius = 24, isInteractive = false, contentStyle, style, ...viewProps
}: LeftGlassProps) {
  const reduceTransparency = useReducedTransparency(true);
  return (
    <GlassMaterial {...viewProps} key={isInteractive ? "interactive" : "static"}
      reduceTransparency={reduceTransparency} fallbackColor={T.surfaceCard}
      glassEffectStyle={glassEffectStyle} tintColor={tintColor} colorScheme="light"
      scrimColor={T.glassLightMedium} isInteractive={isInteractive}
      style={[s.frame, style, { borderRadius: radius, borderColor: T.borderBlackSoft }]}>
      <View style={contentStyle}>{children}</View>
    </GlassMaterial>
  );
}

const s = StyleSheet.create({
  frame: { position: 'relative', backgroundColor: 'transparent', borderWidth: 1 },
});
