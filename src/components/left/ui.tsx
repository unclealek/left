import type { ReactNode } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { styles } from "../../app/leftTheme";

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

export function FieldBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
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

export function EnergyPill({ level }: { level: string }) {
  const isEmphasized = level === "busy" || level === "active";
  return (
    <View style={[styles.energyPill, isEmphasized && styles.energyPillHigh]}>
      <Text style={[styles.energyPillLabel, isEmphasized && styles.energyPillLabelHigh]}>
        {level.toUpperCase()}
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
          <Text style={styles.dialogTitle}>{title}</Text>
          <Text style={styles.dialogBody}>{message}</Text>
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
