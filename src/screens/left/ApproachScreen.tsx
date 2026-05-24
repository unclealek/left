import { Text, View } from "react-native";
import type { NearbyFeedItem } from "../../types/left-domain";
import { styles } from "../../app/leftTheme";
import { BackNavButton } from "../../components/left/navigation";
import { GhostButton, InfoBlock, PrimaryButton } from "../../components/left/ui";

export function ApproachScreen({
  item,
  approachPrompt,
  onCancel,
  onConfirmConnected,
  onOpenSafety,
}: {
  item: NearbyFeedItem;
  approachPrompt: string;
  onCancel: () => void;
  onConfirmConnected: () => void;
  onOpenSafety: () => void;
}) {
  return (
    <View>
      <View style={styles.navRow}>
        <BackNavButton label="Back to nearby" onPress={onCancel} />
        <GhostButton label="Safety" onPress={onOpenSafety} compact />
      </View>
      <View style={styles.approachHero}>
        <Text style={styles.approachLabel}>Going over to</Text>
        <Text style={styles.approachName}>{item.firstName}</Text>
        <View style={styles.timerRing}>
          <Text style={styles.timerNum}>60</Text>
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
