import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
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
  const isHigh = level === "high";
  return (
    <View style={[styles.energyPill, isHigh && styles.energyPillHigh]}>
      <Text style={[styles.energyPillLabel, isHigh && styles.energyPillLabelHigh]}>
        {level.toUpperCase()}
      </Text>
    </View>
  );
}

export function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}>
      <Text style={styles.primaryBtnLabel}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
  compact = false,
  destructive = false,
}: {
  label: string;
  onPress: () => void;
  compact?: boolean;
  destructive?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.ghostBtn, compact && styles.ghostBtnCompact, destructive && styles.ghostBtnDestructive]}>
      <Text style={[styles.ghostBtnLabel, destructive && styles.ghostBtnLabelDestructive]}>{label}</Text>
    </Pressable>
  );
}
