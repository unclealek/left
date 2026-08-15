import { Text, TextInput, View } from "react-native";
import type { NearbyFeedItem, ReportCategory } from "../../types/left-domain";
import { formatIntent } from "../../app/leftConfig";
import { T, styles } from "../../app/leftTheme";
import { LeftAvatar } from "../../components/left/LeftAvatar";
import { BackNavButton } from "../../components/left/navigation";
import { Chip, GhostButton, InfoBlock, PrimaryButton, SafetyActionButton, SelectChip, type ShowAppDialog } from "../../components/left/ui";

const reportCategories: Array<{ id: ReportCategory; label: string }> = [
  { id: "unsafe_behavior", label: "Unsafe" },
  { id: "harassment", label: "Harassment" },
  { id: "impersonation", label: "Impersonation" },
  { id: "spam", label: "Spam" },
  { id: "other", label: "Other" },
];

export function ProfileScreen({
  item,
  reportCategory,
  reportNotes,
  reportSubmitting,
  profileAction,
  onBack,
  onApproach,
  onHide,
  onBlock,
  onChangeReportCategory,
  onChangeReportNotes,
  onReport,
  onOpenSafety,
  onShowDialog,
}: {
  item: NearbyFeedItem;
  reportCategory: ReportCategory;
  reportNotes: string;
  reportSubmitting: boolean;
  profileAction: "hide" | "block" | null;
  onBack: () => void;
  onApproach: () => void;
  onHide: () => void;
  onBlock: () => void;
  onChangeReportCategory: (category: ReportCategory) => void;
  onChangeReportNotes: (notes: string) => void;
  onReport: () => void;
  onOpenSafety: () => void;
  onShowDialog: ShowAppDialog;
}) {
  function confirmHide() {
    onShowDialog(
      "Hide this person?",
      `${item.firstName} will be removed from your nearby feed for this session.`,
      [
        { label: "Cancel", variant: "ghost" },
        { label: "Hide", variant: "destructive", onPress: onHide },
      ],
    );
  }

  function confirmBlock() {
    onShowDialog(
      "Block this person?",
      `You and ${item.firstName} will no longer see each other.`,
      [
        { label: "Cancel", variant: "ghost" },
        { label: "Block", variant: "destructive", onPress: onBlock },
      ],
    );
  }

  return (
    <View>
      <View style={styles.navRow}>
        <BackNavButton label="Back to nearby" onPress={onBack} />
        <SafetyActionButton onPress={onOpenSafety} compact />
      </View>
      <View style={styles.profileHeroBlock}>
        <LeftAvatar name={item.firstName} avatarStyle={item.avatarStyle} size="lg" />
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
      </View>
      <View style={styles.profileActions}>
        <PrimaryButton label="I'm going over" onPress={onApproach} trailingIcon="arrow-up-right" />
      </View>
      <View style={styles.profileDestructive}>
        <Text style={styles.profileActionHint}>Need space? These controls update your nearby feed right away.</Text>
        <GhostButton
          label={profileAction === "hide" ? "Hiding..." : "Hide this person"}
          onPress={confirmHide}
          destructive
          disabled={!!profileAction && profileAction !== "hide"}
          loading={profileAction === "hide"}
        />
        <GhostButton
          label={profileAction === "block" ? "Blocking..." : "Block"}
          onPress={confirmBlock}
          destructive
          disabled={!!profileAction && profileAction !== "block"}
          loading={profileAction === "block"}
        />
      </View>
      <View style={styles.reportPanel}>
        <Text style={styles.reportPanelTitle}>Report {item.firstName}</Text>
        <Text style={styles.reportPanelHint}>Use this for safety issues, harassment, spam, or impersonation.</Text>
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
        <GhostButton
          label={reportSubmitting ? "Sending..." : "Send report"}
          onPress={onReport}
          destructive
          loading={reportSubmitting}
        />
      </View>
    </View>
  );
}
