import type { ReactNode } from "react";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Modal, Pressable, Text, View } from "react-native";
import { styles, T } from "../../app/leftTheme";
import { LeftDoorwayMark } from "./LeftDoorwayMark";

export function Card({ children, step, total }: { children: ReactNode; step?: string; total?: string }) {
  return (
    <View style={styles.card}>
      {step && total && (
        <View style={styles.cardStepRow}>
          <Text style={styles.cardStepText}>{step} / {total}</Text>
        </View>
      )}
      {children}
    </View>
  );
}

export function FieldBlock({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

export function InfoBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.infoBlock}>
      <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
      {children}
    </View>
  );
}

export function Chip({ label, subtle = false }: { label: string; subtle?: boolean }) {
  return (
    <View style={[styles.chip, subtle && styles.chipSubtle]}>
      <Text style={[styles.chipLabel, subtle && styles.chipLabelSubtle]}>{label}</Text>
    </View>
  );
}

export function SelectChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.selectChip, active && styles.selectChipActive]}>
      <Text style={[styles.selectChipLabel, active && styles.selectChipLabelActive]}>{label}</Text>
    </Pressable>
  );
}

export function IconSelectChip({
  label,
  icon,
  active,
  compact = false,
  onPress,
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  active: boolean;
  compact?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.iconSelectChip,
        compact && styles.iconSelectChipCompact,
        active && styles.iconSelectChipActive,
      ]}
    >
      {active ? <View style={styles.iconSelectChipGlow} /> : null}
      <Feather
        name={icon}
        size={16}
        color={active ? T.accentBright : "rgba(31,46,36,0.58)"}
      />
      <Text
        style={[
          styles.iconSelectChipLabel,
          compact && styles.iconSelectChipLabelCompact,
          active && styles.iconSelectChipLabelActive,
        ]}
      >
        {label}
      </Text>
      {active && !compact ? (
        <View style={styles.iconSelectChipCheck}>
          <Feather name="check" size={11} color={T.white} />
        </View>
      ) : null}
    </Pressable>
  );
}

export function StatusPill({
  label,
  visible,
  onPress,
  showChevron = false,
}: {
  label: string;
  visible: boolean;
  onPress?: () => void;
  showChevron?: boolean;
}) {
  const content = (
    <>
      <View
        style={[
          styles.statusPillDot,
          visible ? styles.statusPillDotVisible : styles.statusPillDotHidden,
        ]}
      />
      <Text style={styles.statusPillLabel}>{label}</Text>
      {showChevron ? <Feather name="chevron-down" size={16} color={T.textSecondary} /> : null}
    </>
  );

  if (!onPress) {
    return <View style={styles.statusPillBase}>{content}</View>;
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.statusPillBase, pressed && styles.primaryBtnPressed]}>
      {content}
    </Pressable>
  );
}

export function UtilityIconButton({
  icon,
  label,
  onPress,
  tint = T.accentBright,
  compact = false,
  showLabel = true,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  tint?: string;
  compact?: boolean;
  showLabel?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.utilityIconButton,
        compact && styles.utilityIconButtonCompact,
        !showLabel && styles.utilityIconButtonIconOnly,
        pressed && styles.primaryBtnPressed,
      ]}
    >
      <Feather name={icon} size={18} color={tint} />
      {showLabel ? <Text style={styles.utilityIconButtonLabel}>{label}</Text> : null}
    </Pressable>
  );
}

export function SafetyActionButton({
  onPress,
  compact = false,
}: {
  onPress: () => void;
  compact?: boolean;
}) {
  return <UtilityIconButton icon="shield" label="Safety" onPress={onPress} compact={compact} showLabel={false} />;
}

export function VenueIdentityBlock({
  icon,
  title,
  metaIcon,
  metaText,
  secondaryMetaIcon,
  secondaryMetaText,
  emphasis = "regular",
  titleLines = 1,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  metaIcon: keyof typeof Feather.glyphMap;
  metaText: string;
  secondaryMetaIcon?: keyof typeof Feather.glyphMap;
  secondaryMetaText?: string;
  emphasis?: "regular" | "hero";
  titleLines?: number;
}) {
  const hero = emphasis === "hero";
  return (
    <View style={styles.venueIdentityBlock}>
      <View style={[styles.venueIdentityBlockIconWrap, hero && styles.venueIdentityBlockIconWrapHero]}>
        <Feather name={icon} size={hero ? 19 : 18} color={T.textPrimary} />
      </View>
      <View style={styles.venueIdentityBlockCopy}>
        <Text
          numberOfLines={titleLines}
          style={[styles.venueIdentityBlockTitle, hero && styles.venueIdentityBlockTitleHero]}
        >
          {title}
        </Text>
        <View style={styles.venueIdentityBlockMetaRow}>
          <Feather name={metaIcon} size={16} color={T.primary} />
          <Text style={[styles.venueIdentityBlockMetaText, hero && styles.venueIdentityBlockMetaTextHero]}>
            {metaText}
          </Text>
        </View>
        {secondaryMetaIcon && secondaryMetaText ? (
          <View style={styles.venueIdentityBlockMetaRow}>
            <Feather name={secondaryMetaIcon} size={15} color={T.textMuted} />
            <Text style={styles.venueIdentityBlockSecondaryText}>{secondaryMetaText}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function ButtonBrandMark({ size = 18 }: { size?: number }) {
  return (
    <View style={styles.buttonBrandMarkShell}>
      <LeftDoorwayMark
        size={size}
        archColor={T.primary}
        innerColor={T.accent}
        baseColor={T.accent}
        baseScale={0.54}
      />
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
  const colors = disabled
    ? (["rgba(36,92,74,0.34)", "rgba(36,92,74,0.24)"] as const)
    : (["#2B6A57", "#245C4A"] as const);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.brandPrimaryButtonPressable, pressed && !disabled && styles.primaryBtnPressed]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.brandPrimaryButton,
          hero ? styles.brandPrimaryButtonHero : styles.brandPrimaryButtonCompact,
        ]}
      >
        {compactInline ? (
          <View style={styles.brandPrimaryButtonInlineGroup}>
            <ButtonBrandMark size={18} />
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
              <ButtonBrandMark size={hero ? 20 : 18} />
              <View style={styles.brandPrimaryButtonCopy}>
                <Text style={[styles.brandPrimaryButtonLabel, hero && styles.brandPrimaryButtonLabelHero]}>
                  {label}
                </Text>
                {subtitle ? (
                  <Text style={styles.brandPrimaryButtonSubtitle}>{subtitle}</Text>
                ) : null}
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
                  <Feather name="arrow-up-right" size={hero ? 22 : 18} color={T.white} />
                </View>
              ) : (
                <View style={styles.brandPrimaryButtonAccessoryGhost}>
                  <ButtonBrandMark size={hero ? 20 : 18} />
                </View>
              )}
            </View>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

export function EnergyPill({ level }: { level: string }) {
  const normalizedLevel = level.toLowerCase();
  const isEmphasized = normalizedLevel === "busy" || normalizedLevel === "active";
  return (
    <View style={[styles.energyPill, isEmphasized && styles.energyPillHigh]}>
      <View style={[styles.energyPillDot, isEmphasized && styles.energyPillDotHigh]} />
      <Text style={[styles.energyPillLabel, isEmphasized && styles.energyPillLabelHigh]}>
        {level}
      </Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryBtn,
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

export function AppDialog({
  visible,
  title,
  message,
  actions,
}: {
  visible: boolean;
  title: string;
  message: string;
  actions: Array<{
    label: string;
    onPress: () => void;
    variant?: "primary" | "ghost" | "destructive";
  }>;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={actions[0]?.onPress}>
      <View style={styles.dialogOverlay}>
        <Pressable style={styles.absoluteFill} onPress={actions[0]?.onPress} />
        <View style={styles.dialogCard}>
          <View style={styles.dialogAccent} />
          <View style={styles.dialogTextBlock}>
            <Text style={styles.dialogTitle}>{title}</Text>
            <Text style={styles.dialogBody}>{message}</Text>
          </View>
          <View style={styles.dialogActions}>
            {actions.map((action) =>
              action.variant === "primary" ? (
                <PrimaryButton key={action.label} label={action.label} onPress={action.onPress} />
              ) : (
                <GhostButton
                  key={action.label}
                  label={action.label}
                  onPress={action.onPress}
                  destructive={action.variant === "destructive"}
                />
              ),
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
