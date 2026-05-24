import { Text, View } from "react-native";
import type { NearbyFeedItem } from "../../types/left-domain";
import { formatIntent } from "../../app/leftConfig";
import { styles } from "../../app/leftTheme";
import { BackNavButton } from "../../components/left/navigation";
import { Chip, GhostButton, InfoBlock, PrimaryButton } from "../../components/left/ui";

export function ProfileScreen({
  item,
  onBack,
  onWave,
  onApproach,
  onHide,
  onOpenSafety,
}: {
  item: NearbyFeedItem;
  onBack: () => void;
  onWave: () => void;
  onApproach: () => void;
  onHide: () => void;
  onOpenSafety: () => void;
}) {
  return (
    <View>
      <View style={styles.navRow}>
        <BackNavButton label="Back to nearby" onPress={onBack} />
        <GhostButton label="Safety" onPress={onOpenSafety} compact />
      </View>
      <View style={styles.profileHeroBlock}>
        <View style={styles.profileAvatarLg}>
          <Text style={styles.profileAvatarGlyph}>{item.firstName.slice(0, 1)}</Text>
        </View>
        <Text style={styles.profileName}>{item.firstName}</Text>
        <Text style={styles.profileIntent}>{formatIntent(item.intent)}</Text>
        <View style={styles.chipWrapCenter}>
          <Chip label={item.primaryVibe ?? "Open"} />
          <Chip label="Design" subtle />
        </View>
      </View>
      <View style={styles.profileSections}>
        <InfoBlock label="Hint">
          <Text style={styles.infoText}>{item.hintText ?? "No hint set."}</Text>
        </InfoBlock>
        <InfoBlock label="Shared alignment">
          <Text style={styles.infoText}>You both selected AI/startups.</Text>
        </InfoBlock>
        <InfoBlock label="Icebreaker">
          <Text style={[styles.infoText, styles.icebreakerText]}>
            "Ask what they're building right now, not what they do generally."
          </Text>
        </InfoBlock>
      </View>
      <View style={styles.profileActions}>
        <GhostButton label="Wave" onPress={onWave} />
        <PrimaryButton label="I'm going over →" onPress={onApproach} />
      </View>
      <View style={styles.profileDestructive}>
        <GhostButton label="Hide this person" onPress={onHide} destructive />
      </View>
    </View>
  );
}
