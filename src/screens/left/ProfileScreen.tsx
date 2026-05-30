import { Text, TextInput, View } from "react-native";
import type { NearbyFeedItem, ReportCategory } from "../../types/left-domain";
import { formatIntent } from "../../app/leftConfig";
import { T, styles } from "../../app/leftTheme";
import { BackNavButton } from "../../components/left/navigation";
import { Chip, GhostButton, InfoBlock, PrimaryButton, SelectChip } from "../../components/left/ui";

const reportCategories: Array<{ id: ReportCategory; label: string }> = [
  { id: "unsafe_behavior", label: "Unsafe" },
  { id: "harassment", label: "Harassment" },
  { id: "impersonation", label: "Impersonation" },
  { id: "spam", label: "Spam" },
  { id: "other", label: "Other" },
];

export function ProfileScreen({
  item,
  profilePrompt,
  reportCategory,
  reportNotes,
  reportSubmitting,
  onBack,
  onWave,
  onApproach,
  onHide,
  onBlock,
  onChangeReportCategory,
  onChangeReportNotes,
  onReport,
  onOpenSafety,
}: {
  item: NearbyFeedItem;
  profilePrompt: string;
  reportCategory: ReportCategory;
  reportNotes: string;
  reportSubmitting: boolean;
  onBack: () => void;
  onWave: () => void;
  onApproach: () => void;
  onHide: () => void;
  onBlock: () => void;
  onChangeReportCategory: (category: ReportCategory) => void;
  onChangeReportNotes: (notes: string) => void;
  onReport: () => void;
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
          <Text style={[styles.infoText, styles.icebreakerText]}>"{profilePrompt}"</Text>
        </InfoBlock>
      </View>
      <View style={styles.profileActions}>
        <GhostButton label="Wave" onPress={onWave} />
        <PrimaryButton label="I'm going over →" onPress={onApproach} />
      </View>
      <View style={styles.profileDestructive}>
        <GhostButton label="Hide this person" onPress={onHide} destructive />
        <GhostButton label="Block" onPress={onBlock} destructive />
      </View>
      <View style={styles.reportPanel}>
        <Text style={styles.reportPanelTitle}>Report {item.firstName}</Text>
        <View style={styles.reportChipWrap}>
          {reportCategories.map((category) => (
            <SelectChip
              key={category.id}
              label={category.label}
              active={reportCategory === category.id}
              onPress={() => onChangeReportCategory(category.id)}
            />
          ))}
        </View>
        <TextInput
          value={reportNotes}
          onChangeText={onChangeReportNotes}
          placeholder="Add optional context"
          placeholderTextColor={T.textMuted}
          style={[styles.input, styles.multilineInput]}
          multiline
        />
        <GhostButton label={reportSubmitting ? "Submitting..." : "Submit report"} onPress={onReport} destructive />
      </View>
    </View>
  );
}
