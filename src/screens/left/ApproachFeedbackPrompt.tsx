import { t } from "../../features/preferences/translation-runtime";
import { Text, View } from "react-native";
import { styles } from "../../app/leftTheme";
import type { PendingApproachFeedback } from "../../features/interactions/approach-feedback-storage";
import { GhostButton, PrimaryButton, SelectChip } from "../../components/left/ui";
import { GlassSurface, glassRadii } from "../../components/glass";

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
      <GlassSurface
        variant="medium"
        radius={glassRadii.card}
        style={styles.feedbackPromptGlass}
        contentStyle={styles.feedbackPromptCard}
      >
        <Text style={styles.feedbackPromptEyebrow}>{t("Quick follow-up")}</Text>
        <Text style={styles.feedbackPromptTitle}>{t("How did it go with")}{" "}{feedback.targetFirstName}?</Text>
        <Text style={styles.feedbackPromptBody}>{t("We assumed you went over after the countdown ended. Confirm what happened so the prompt flow stays useful.")}{" "}</Text>

        <View style={styles.feedbackPromptBlock}>
          <Text style={styles.fieldLabel}>{t("DID YOU GO OVER?")}</Text>
          <View style={styles.feedbackPromptChoiceRow}>
            <SelectChip label={t("Yes")} active={wentOver === true} onPress={() => onSetWentOver(true)} />
            <SelectChip label={t("No")} active={wentOver === false} onPress={() => onSetWentOver(false)} />
          </View>
        </View>

        {wentOver === true ? (
          <View style={styles.feedbackPromptBlock}>
            <Text style={styles.fieldLabel}>{t("DID YOU USE THE ICEBREAKER?")}</Text>
            <View style={styles.feedbackPromptChoiceRow}>
              <SelectChip label={t("Yes")} active={usedIcebreaker === true} onPress={() => onSetUsedIcebreaker(true)} />
              <SelectChip label={t("No")} active={usedIcebreaker === false} onPress={() => onSetUsedIcebreaker(false)} />
            </View>
            <Text style={styles.feedbackPromptIcebreaker}>"{feedback.approachPrompt}"</Text>
          </View>
        ) : null}

        <View style={styles.feedbackPromptActions}>
          <GhostButton label={t("Later")} onPress={onLater} />
          <PrimaryButton label={t("Save feedback")} onPress={onSubmit} disabled={!canSubmit} />
        </View>

        {!canSubmit ? <Text style={styles.feedbackPromptHint}>{t("Answer the prompt above to continue.")}</Text> : null}
      </GlassSurface>
    </View>
  );
}
