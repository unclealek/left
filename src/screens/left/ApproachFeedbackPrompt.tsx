import { Text, View } from "react-native";
import { styles } from "../../app/leftTheme";
import type { PendingApproachFeedback } from "../../features/interactions/approach-feedback-storage";
import { GhostButton, PrimaryButton, SelectChip } from "../../components/left/ui";

export function ApproachFeedbackPrompt({
  feedback,
  wentOver,
  usedIcebreaker,
  onSetWentOver,
  onSetUsedIcebreaker,
  onSubmit,
  onLater,
}: {
  feedback: PendingApproachFeedback;
  wentOver: boolean | null;
  usedIcebreaker: boolean | null;
  onSetWentOver: (value: boolean) => void;
  onSetUsedIcebreaker: (value: boolean) => void;
  onSubmit: () => void;
  onLater: () => void;
}) {
  const canSubmit = wentOver === false || (wentOver === true && usedIcebreaker !== null);

  return (
    <View style={styles.feedbackPromptOverlay}>
      <View style={styles.feedbackPromptCard}>
        <Text style={styles.feedbackPromptEyebrow}>Quick follow-up</Text>
        <Text style={styles.feedbackPromptTitle}>How did it go with {feedback.targetFirstName}?</Text>
        <Text style={styles.feedbackPromptBody}>
          We assumed you went over after the countdown ended. Confirm what happened so the prompt flow stays useful.
        </Text>

        <View style={styles.feedbackPromptBlock}>
          <Text style={styles.fieldLabel}>DID YOU GO OVER?</Text>
          <View style={styles.feedbackPromptChoiceRow}>
            <SelectChip label="Yes" active={wentOver === true} onPress={() => onSetWentOver(true)} />
            <SelectChip label="No" active={wentOver === false} onPress={() => onSetWentOver(false)} />
          </View>
        </View>

        {wentOver === true ? (
          <View style={styles.feedbackPromptBlock}>
            <Text style={styles.fieldLabel}>DID YOU USE THE ICEBREAKER?</Text>
            <View style={styles.feedbackPromptChoiceRow}>
              <SelectChip label="Yes" active={usedIcebreaker === true} onPress={() => onSetUsedIcebreaker(true)} />
              <SelectChip label="No" active={usedIcebreaker === false} onPress={() => onSetUsedIcebreaker(false)} />
            </View>
            <Text style={styles.feedbackPromptIcebreaker}>"{feedback.approachPrompt}"</Text>
          </View>
        ) : null}

        <View style={styles.feedbackPromptActions}>
          <GhostButton label="Later" onPress={onLater} />
          <PrimaryButton label="Save feedback" onPress={onSubmit} />
        </View>

        {!canSubmit ? <Text style={styles.feedbackPromptHint}>Answer the prompt above to continue.</Text> : null}
      </View>
    </View>
  );
}
