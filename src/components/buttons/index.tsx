import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { LeftIcon, type LeftIconName } from "../icons";
import { LeftLogoMark } from "../light_logo/LeftLogoMark";
import { leftShadows } from "../shadow";
import { T } from "../theme";
import { radii, spacing, typography } from "../token";
import { hasCompletedSlide } from "./slide-confirm";

function ButtonAccentGlyph({ size = 18 }: { size?: number }) {
  return (
    <View style={styles.buttonBrandMarkShell}>
      <LeftLogoMark size={size} />
    </View>
  );
}

export function BrandPrimaryButton({
  label,
  subtitle,
  onPress,
  disabled = false,
  loading = false,
  size = "compact",
  trailingIcon = "none",
}: {
  label: string;
  subtitle?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: "compact" | "hero";
  trailingIcon?: "none" | "arrow";
}) {
  const hero = size === "hero";
  const compactInline = !hero && !subtitle && trailingIcon === "none";
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${label}. ${subtitle}` : label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.brandPrimaryButtonPressable,
        pressed && !inactive && styles.primaryBtnPressed,
      ]}
    >
      <View
        style={[
          styles.brandPrimaryButton,
          hero ? styles.brandPrimaryButtonHero : styles.brandPrimaryButtonCompact,
          inactive && styles.brandPrimaryButtonDisabled,
        ]}
      >
        {compactInline ? (
          <View style={styles.brandPrimaryButtonInlineGroup}>
            {loading ? (
              <ActivityIndicator size="small" color={T.actionContent} />
            ) : (
              <ButtonAccentGlyph size={18} />
            )}
            <Text style={styles.brandPrimaryButtonLabel}>{label}</Text>
          </View>
        ) : (
          <>
            <View
              style={[
                styles.brandPrimaryButtonContentGroup,
                hero && styles.brandPrimaryButtonCopyHero,
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={T.actionContent} />
              ) : (
                <ButtonAccentGlyph size={hero ? 20 : 18} />
              )}
              <View style={styles.brandPrimaryButtonCopy}>
                <Text style={[styles.brandPrimaryButtonLabel, hero && styles.brandPrimaryButtonLabelHero]}>
                  {label}
                </Text>
                {subtitle ? <Text style={styles.brandPrimaryButtonSubtitle}>{subtitle}</Text> : null}
              </View>
            </View>
            <View
              style={[
                styles.brandPrimaryButtonAccessory,
                styles.brandPrimaryButtonAccessoryRight,
                hero && styles.brandPrimaryButtonAccessoryHero,
              ]}
            >
              {trailingIcon === "arrow" ? (
                <View style={styles.brandPrimaryButtonArrowBubble}>
                  <LeftIcon name="arrow-up-right" size={hero ? 22 : 18} color={T.primary} />
                </View>
              ) : (
                <View style={styles.brandPrimaryButtonAccessoryGhost}>
                  <ButtonAccentGlyph size={hero ? 20 : 18} />
                </View>
              )}
            </View>
          </>
        )}
      </View>
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  compact = false,
  tone = "default",
  leadingIcon,
  trailingIcon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  tone?: "default" | "onboarding";
  leadingIcon?: LeftIconName;
  trailingIcon?: LeftIconName;
}) {
  const inactive = disabled || loading;
  const contentColor = T.actionContent;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryBtn,
        tone === "onboarding" && styles.primaryBtnOnboarding,
        compact && styles.primaryBtnCompact,
        inactive && styles.primaryBtnDisabled,
        pressed && !inactive && styles.primaryBtnPressed,
      ]}
    >
      <View style={styles.buttonLabelRow}>
        {loading ? (
          <ActivityIndicator size="small" color={contentColor} />
        ) : leadingIcon ? (
          <LeftIcon name={leadingIcon} size={18} color={contentColor} />
        ) : null}
        <Text
          style={[
            styles.primaryBtnLabel,
            tone === "onboarding" && styles.primaryBtnLabelOnboarding,
            inactive && styles.primaryBtnLabelDisabled,
          ]}
        >
          {label}
        </Text>
        {!loading && trailingIcon ? <LeftIcon name={trailingIcon} size={18} color={contentColor} /> : null}
      </View>
    </Pressable>
  );
}

export function SlideToConfirmButton({
  label,
  subtitle,
  onConfirm,
  disabled = false,
  loading = false,
}: {
  label: string;
  subtitle?: string;
  onConfirm: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const dragStart = useRef(0);
  const completionFired = useRef(false);
  const thumbSize = 42;
  const trackInset = 5;
  const maxTravel = Math.max(trackWidth - thumbSize - trackInset * 2, 0);
  const inactive = disabled || loading;

  function resetThumb() {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 180,
      friction: 18,
    }).start();
  }

  function completeSlide() {
    if (inactive || completionFired.current || maxTravel <= 0) return;
    completionFired.current = true;
    Animated.timing(translateX, {
      toValue: maxTravel,
      duration: 140,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onConfirm();
    });
  }

  useEffect(() => {
    if (loading && maxTravel > 0) {
      Animated.timing(translateX, {
        toValue: maxTravel,
        duration: 140,
        useNativeDriver: true,
      }).start();
      return;
    }

    completionFired.current = false;
    resetThumb();
  }, [disabled, loading, maxTravel, translateX]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !inactive && maxTravel > 0,
        onStartShouldSetPanResponderCapture: () => !inactive && maxTravel > 0,
        onMoveShouldSetPanResponder: (_, gesture) =>
          !inactive &&
          maxTravel > 0 &&
          gesture.dx > 4 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => {
          translateX.stopAnimation((value) => {
            dragStart.current = value;
          });
        },
        onPanResponderMove: (_, gesture) => {
          const nextValue = Math.max(0, Math.min(dragStart.current + gesture.dx, maxTravel));
          translateX.setValue(nextValue);
        },
        onPanResponderRelease: (_, gesture) => {
          const releasedAt = Math.max(0, Math.min(dragStart.current + gesture.dx, maxTravel));
          if (hasCompletedSlide(releasedAt, maxTravel)) {
            completeSlide();
          } else {
            resetThumb();
          }
        },
        onPanResponderTerminationRequest: () => false,
        onPanResponderTerminate: resetThumb,
        onShouldBlockNativeResponder: () => true,
      }),
    [inactive, maxTravel, onConfirm, translateX],
  );

  return (
    <View
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Swipe the handle to the right to confirm."
      accessibilityState={{ disabled: inactive, busy: loading }}
      accessibilityActions={[{ name: "activate", label: "Confirm" }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === "activate") completeSlide();
      }}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      style={[styles.slideConfirmTrack, inactive && styles.slideConfirmTrackDisabled]}
    >
      <View pointerEvents="none" style={styles.slideConfirmCopy}>
        <Text style={styles.slideConfirmLabel}>{loading ? "Going visible..." : label}</Text>
        {subtitle ? <Text style={styles.slideConfirmSubtitle}>{subtitle}</Text> : null}
      </View>
      <Animated.View
        {...panResponder.panHandlers}
        hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.slideConfirmThumb,
          {
            width: thumbSize,
            height: thumbSize,
            transform: [{ translateX }],
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={T.actionSurface} />
        ) : (
          <LeftLogoMark size={20} />
        )}
      </Animated.View>
    </View>
  );
}

export function GhostButton({
  label,
  onPress,
  compact = false,
  destructive = false,
  disabled = false,
  loading = false,
  selected = false,
  leadingIcon,
  trailingIcon,
}: {
  label: string;
  onPress: () => void;
  compact?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  loading?: boolean;
  selected?: boolean;
  leadingIcon?: LeftIconName;
  trailingIcon?: LeftIconName;
}) {
  const inactive = disabled || loading;
  const labelColor = destructive ? T.dangerText : selected ? T.primary : T.textPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading, selected }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.ghostBtn,
        compact && styles.ghostBtnCompact,
        selected && styles.ghostBtnSelected,
        destructive && styles.ghostBtnDestructive,
        inactive && styles.ghostBtnDisabled,
        pressed && !inactive && styles.ghostBtnPressed,
      ]}
    >
      <View style={styles.buttonLabelRow}>
        {loading ? (
          <ActivityIndicator size="small" color={labelColor} />
        ) : leadingIcon ? (
          <LeftIcon name={leadingIcon} size={18} color={labelColor} />
        ) : null}
        <Text
          style={[
            styles.ghostBtnLabel,
            selected && styles.ghostBtnLabelSelected,
            destructive && styles.ghostBtnLabelDestructive,
            inactive && styles.ghostBtnLabelDisabled,
          ]}
        >
          {label}
        </Text>
        {!loading && trailingIcon ? <LeftIcon name={trailingIcon} size={18} color={labelColor} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBrandMarkShell: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.actionContent,
  },
  brandPrimaryButtonPressable: {
    width: "100%",
  },
  brandPrimaryButton: {
    minHeight: 60,
    borderRadius: radii.xl,
    paddingHorizontal: spacing[4],
    backgroundColor: T.actionSurface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: T.actionSurface,
    ...leftShadows.medium,
  },
  brandPrimaryButtonCompact: {
    minHeight: 56,
  },
  brandPrimaryButtonHero: {
    minHeight: 68,
    paddingHorizontal: spacing[5],
  },
  brandPrimaryButtonDisabled: {
    opacity: 0.45,
  },
  brandPrimaryButtonAccessory: {
    minWidth: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  brandPrimaryButtonAccessoryRight: {
    alignSelf: "stretch",
  },
  brandPrimaryButtonAccessoryHero: {
    minWidth: 52,
  },
  brandPrimaryButtonArrowBubble: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: T.actionContent,
    alignItems: "center",
    justifyContent: "center",
  },
  brandPrimaryButtonAccessoryGhost: {
    opacity: 0.9,
  },
  brandPrimaryButtonInlineGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  brandPrimaryButtonContentGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    flex: 1,
  },
  brandPrimaryButtonCopy: {
    flex: 1,
    gap: 2,
  },
  brandPrimaryButtonCopyHero: {
    gap: spacing[1],
  },
  brandPrimaryButtonLabel: {
    color: T.actionContent,
    fontSize: typography.body,
    lineHeight: 22,
    fontFamily: typography.fontBodyBold,
    letterSpacing: -0.2,
  },
  brandPrimaryButtonLabelHero: {
    fontSize: typography.title,
    lineHeight: 26,
  },
  brandPrimaryButtonSubtitle: {
    color: "rgba(198,227,133,0.72)",
    fontSize: typography.caption,
    lineHeight: 18,
    fontFamily: typography.fontBody,
  },
  primaryBtn: {
    minHeight: 54,
    borderRadius: radii.xl,
    backgroundColor: T.actionSurface,
    borderWidth: 1,
    borderColor: T.actionSurface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[5],
    ...leftShadows.small,
  },
  primaryBtnPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.995 }],
  },
  primaryBtnCompact: {
    minHeight: 44,
    alignSelf: "flex-start",
    paddingHorizontal: spacing[4],
    borderRadius: radii.lg,
  },
  primaryBtnOnboarding: {
    minHeight: 58,
    borderRadius: radii.xl,
    backgroundColor: T.actionSurface,
    borderColor: T.actionSurface,
    shadowColor: T.actionSurface,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  primaryBtnDisabled: {
    opacity: 0.45,
  },
  primaryBtnLabel: {
    color: T.actionContent,
    fontSize: typography.body,
    lineHeight: 20,
    fontFamily: typography.fontBodyBold,
  },
  primaryBtnLabelOnboarding: {
    color: T.actionContent,
  },
  primaryBtnLabelDisabled: {
    color: "rgba(198,227,133,0.7)",
  },
  slideConfirmTrack: {
    width: "100%",
    minHeight: 52,
    borderRadius: radii.xl,
    backgroundColor: T.actionSurface,
    borderWidth: 1,
    borderColor: T.actionSurface,
    justifyContent: "center",
    overflow: "hidden",
    ...leftShadows.small,
  },
  slideConfirmTrackDisabled: {
    opacity: 0.46,
  },
  slideConfirmCopy: {
    minHeight: 52,
    justifyContent: "center",
    paddingLeft: 60,
    paddingRight: 14,
    gap: 0,
  },
  slideConfirmLabel: {
    color: "rgba(198,227,133,0.84)",
    fontSize: 14,
    lineHeight: 17,
    fontFamily: typography.fontBodyMedium,
    letterSpacing: -0.1,
  },
  slideConfirmSubtitle: {
    color: "rgba(198,227,133,0.52)",
    fontSize: 11,
    lineHeight: 14,
    fontFamily: typography.fontBody,
  },
  slideConfirmThumb: {
    position: "absolute",
    left: 5,
    top: 4,
    borderRadius: radii.pill,
    backgroundColor: T.actionContent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: T.actionSurface,
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  buttonLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
  },
  ghostBtn: {
    minHeight: 52,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: T.borderBlack,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[5],
  },
  ghostBtnCompact: {
    minHeight: 42,
    borderRadius: radii.lg,
    paddingHorizontal: spacing[4],
  },
  ghostBtnDestructive: {
    borderColor: T.dangerBorder,
    backgroundColor: T.dangerDim,
  },
  ghostBtnSelected: {
    borderColor: T.primary,
    backgroundColor: T.primarySoft,
  },
  ghostBtnPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.995 }],
  },
  ghostBtnDisabled: {
    opacity: 0.45,
  },
  ghostBtnLabel: {
    color: T.textPrimary,
    fontSize: typography.body,
    lineHeight: 20,
    fontFamily: typography.fontBodyMedium,
  },
  ghostBtnLabelDestructive: {
    color: T.dangerText,
  },
  ghostBtnLabelSelected: {
    color: T.primary,
    fontFamily: typography.fontBodyBold,
  },
  ghostBtnLabelDisabled: {
    color: T.textMuted,
  },
});
