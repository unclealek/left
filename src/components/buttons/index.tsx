import { Pressable, StyleSheet, Text, View } from "react-native";
import { leftColors } from "../color";
import { LeftIcon } from "../icons";
import { LeftLogoMark } from "../light_logo/LeftLogoMark";
import { leftShadows } from "../shadow";
import { T } from "../theme";
import { radii, spacing, typography } from "../token";

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
  size = "compact",
  trailingIcon = "none",
}: {
  label: string;
  subtitle?: string;
  onPress: () => void;
  disabled?: boolean;
  size?: "compact" | "hero";
  trailingIcon?: "none" | "arrow";
}) {
  const hero = size === "hero";
  const compactInline = !hero && !subtitle && trailingIcon === "none";

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.brandPrimaryButtonPressable,
        pressed && !disabled && styles.primaryBtnPressed,
      ]}
    >
      <View
        style={[
          styles.brandPrimaryButton,
          hero ? styles.brandPrimaryButtonHero : styles.brandPrimaryButtonCompact,
          disabled && styles.brandPrimaryButtonDisabled,
        ]}
      >
        {compactInline ? (
          <View style={styles.brandPrimaryButtonInlineGroup}>
            <ButtonAccentGlyph size={18} />
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
              <ButtonAccentGlyph size={hero ? 20 : 18} />
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
  compact = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryBtn,
        compact && styles.primaryBtnCompact,
        disabled && styles.primaryBtnDisabled,
        pressed && !disabled && styles.primaryBtnPressed,
      ]}
    >
      <Text style={[styles.primaryBtnLabel, disabled && styles.primaryBtnLabelDisabled]}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
  compact = false,
  destructive = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  compact?: boolean;
  destructive?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.ghostBtn,
        compact && styles.ghostBtnCompact,
        destructive && styles.ghostBtnDestructive,
        disabled && styles.ghostBtnDisabled,
      ]}
    >
      <Text
        style={[
          styles.ghostBtnLabel,
          destructive && styles.ghostBtnLabelDestructive,
          disabled && styles.ghostBtnLabelDisabled,
        ]}
      >
        {label}
      </Text>
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
    backgroundColor: leftColors.white,
  },
  brandPrimaryButtonPressable: {
    width: "100%",
  },
  brandPrimaryButton: {
    minHeight: 60,
    borderRadius: radii.xl,
    paddingHorizontal: spacing[4],
    backgroundColor: T.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: T.primary,
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
    backgroundColor: leftColors.white,
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
    color: leftColors.white,
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
    color: "rgba(255,255,255,0.72)",
    fontSize: typography.caption,
    lineHeight: 18,
    fontFamily: typography.fontBody,
  },
  primaryBtn: {
    minHeight: 54,
    borderRadius: radii.xl,
    backgroundColor: T.primary,
    borderWidth: 1,
    borderColor: T.primary,
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
  primaryBtnDisabled: {
    opacity: 0.45,
  },
  primaryBtnLabel: {
    color: leftColors.white,
    fontSize: typography.body,
    lineHeight: 20,
    fontFamily: typography.fontBodyBold,
  },
  primaryBtnLabelDisabled: {
    color: "rgba(255,255,255,0.7)",
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
  ghostBtnLabelDisabled: {
    color: T.textMuted,
  },
});
