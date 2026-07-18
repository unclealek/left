import { Text, View } from "react-native";
import type { NearbyFeedItem } from "../../types/left-domain";
import { styles } from "../../app/leftTheme";
import { BackNavButton } from "../../components/left/navigation";
import { InfoBlock, PrimaryButton, SafetyActionButton } from "../../components/left/ui";

export function ApproachScreen({
  item,
  approachPrompt,
  remainingSeconds,
  onCancel,
  onConfirmConnected,
  onOpenSafety,
}: {
  item: NearbyFeedItem;
  approachPrompt: string;
  remainingSeconds: number;
  onCancel: () => void;
  onConfirmConnected: () => void;
  onOpenSafety: () => void;
}) {
  return (
    <View>
      <View style={styles.navRow}>
        <BackNavButton label="Back to nearby" onPress={onCancel} />
        <SafetyActionButton onPress={onOpenSafety} compact />
      </View>
      <View style={styles.approachHero}>
        <Text style={styles.approachLabel}>Going over to</Text>
        <Text style={styles.approachName}>{item.firstName}</Text>
        <View style={styles.timerRing}>
          <Text style={styles.timerNum}>{remainingSeconds}</Text>
          <Text style={styles.timerUnit}>sec</Text>
        </View>
      </View>
      <View style={styles.approachSections}>
        <InfoBlock label="Look for">
          <Text style={styles.infoText}>{item.hintText}</Text>
        </InfoBlock>
        <InfoBlock label="Icebreaker">
          <Text style={[styles.infoText, styles.icebreakerText]}>"{approachPrompt}"</Text>
        </InfoBlock>
      </View>
      <PrimaryButton label="We connected ✓" onPress={onConfirmConnected} />
    </View>
  );
}
