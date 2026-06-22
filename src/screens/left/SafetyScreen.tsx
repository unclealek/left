import { Text, View } from "react-native";
import { styles } from "../../app/leftTheme";
import { BackNavButton } from "../../components/left/navigation";
import { FieldBlock, GhostButton, PrimaryButton } from "../../components/left/ui";

export function SafetyScreen({
  venueName,
  sessionVisible,
  venueMuted,
  venueAction,
  venueMessage,
  onBack,
  onPauseVisibility,
  onEndSession,
  onHideVenue,
  onMuteVenue,
}: {
  venueName: string;
  sessionVisible: boolean;
  venueMuted: boolean;
  venueAction: "hiding" | "muting" | null;
  venueMessage: { tone: "success" | "error"; text: string } | null;
  onBack: () => void;
  onPauseVisibility: () => void;
  onEndSession: () => void;
  onHideVenue: () => void;
  onMuteVenue: () => void;
}) {
  return (
    <View>
      <BackNavButton label="Return" onPress={onBack} />
      <Text style={[styles.cardTitle, { marginTop: 20 }]}>Safety{"\n"}controls.</Text>
      <Text style={styles.cardBody}>Blocks are immediate and bilateral. Reports auto-hide the person for this session.</Text>
      <FieldBlock label="Current session">
        <View style={styles.safetyStatusRow}>
          <View style={[styles.pulseDot, sessionVisible && styles.pulseDotActive]} />
          <Text style={styles.safetyStatusText}>{sessionVisible ? "Visible nearby" : "Not currently visible"}</Text>
        </View>
        <PrimaryButton label="Pause visibility" onPress={onPauseVisibility} disabled={!sessionVisible} />
        <GhostButton label="End session" onPress={onEndSession} disabled={!sessionVisible} />
      </FieldBlock>
      <FieldBlock label="Venue">
        {venueMessage ? (
          <Text style={venueMessage.tone === "success" ? styles.settingsSuccessText : styles.errorText}>
            {venueMessage.text}
          </Text>
        ) : null}
        <GhostButton
          label={venueAction === "hiding" ? "Hiding venue..." : `Hide me at ${venueName}`}
          onPress={onHideVenue}
          destructive
          disabled={!!venueAction}
        />
        <GhostButton
          label={
            venueAction === "muting"
              ? "Muting venue..."
              : venueMuted
                ? `Venue notifications off at ${venueName}`
                : "Never notify me here"
          }
          onPress={onMuteVenue}
          destructive={!venueMuted}
          disabled={!!venueAction || venueMuted}
        />
      </FieldBlock>
    </View>
  );
}
