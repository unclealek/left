import type { ReactNode } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { styles, T } from "../../app/leftTheme";
import { GhostButton, PrimaryButton } from "../buttons";
import { LeftIcon, type LeftIconName } from "../icons";
export { BrandPrimaryButton, GhostButton, PrimaryButton } from "../buttons";

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
  icon: LeftIconName;
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
      <LeftIcon name={icon} size={16} color={active ? T.accentBright : "rgba(31,46,36,0.58)"} active={active} />
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
          <LeftIcon name="check" size={11} color={T.white} />
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
      {showChevron ? <LeftIcon name="chevron-down" size={16} color={T.textSecondary} /> : null}
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
  icon: LeftIconName;
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
      <LeftIcon name={icon} size={18} color={tint} />
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
  icon: LeftIconName;
  title: string;
  metaIcon: LeftIconName;
  metaText: string;
  secondaryMetaIcon?: LeftIconName;
  secondaryMetaText?: string;
  emphasis?: "regular" | "hero";
  titleLines?: number;
}) {
  const hero = emphasis === "hero";
  return (
    <View style={styles.venueIdentityBlock}>
      <View style={[styles.venueIdentityBlockIconWrap, hero && styles.venueIdentityBlockIconWrapHero]}>
        <LeftIcon name={icon} size={hero ? 19 : 18} color={T.textPrimary} />
      </View>
      <View style={styles.venueIdentityBlockCopy}>
        <Text
          numberOfLines={titleLines}
          style={[styles.venueIdentityBlockTitle, hero && styles.venueIdentityBlockTitleHero]}
        >
          {title}
        </Text>
        <View style={styles.venueIdentityBlockMetaRow}>
          <LeftIcon name={metaIcon} size={16} color={T.primary} />
          <Text style={[styles.venueIdentityBlockMetaText, hero && styles.venueIdentityBlockMetaTextHero]}>
            {metaText}
          </Text>
        </View>
        {secondaryMetaIcon && secondaryMetaText ? (
          <View style={styles.venueIdentityBlockMetaRow}>
            <LeftIcon name={secondaryMetaIcon} size={15} color={T.textMuted} />
            <Text style={styles.venueIdentityBlockSecondaryText}>{secondaryMetaText}</Text>
          </View>
        ) : null}
      </View>
    </View>
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
