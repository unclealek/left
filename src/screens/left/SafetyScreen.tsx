import { Alert, Text, View } from "react-native";
import { styles } from "../../app/leftTheme";
import { BackNavButton } from "../../components/left/navigation";
import { FieldBlock, GhostButton, PrimaryButton } from "../../components/left/ui";
import type { VenuePreference } from "../../features/location/location-storage";

export function SafetyScreen({
  venueName,
  sessionVisible,
  venueMuted,
  venueAction,
  venueMessage,
  venuePreferences,
  venuePreferenceAction,
  venuePreferenceMessage,
  locationStatus,
  visibilityAction,
  onBack,
  onPauseVisibility,
  onEndSession,
  onHideVenue,
  onMuteVenue,
  onClearVenueHidden,
  onClearVenueMuted,
}: {
  venueName: string;
  sessionVisible: boolean;
  venueMuted: boolean;
  venueAction: "hiding" | "muting" | null;
  venueMessage: { tone: "success" | "error"; text: string } | null;
  venuePreferences: VenuePreference[];
  venuePreferenceAction: {
    venueId: string;
    action: "hide" | "mute" | "unhide" | "unmute";
  } | null;
  venuePreferenceMessage: { tone: "success" | "error"; text: string } | null;
  locationStatus: string;
  visibilityAction: "pause" | "end" | null;
  onBack: () => void;
  onPauseVisibility: () => void;
  onEndSession: () => void;
  onHideVenue: () => void;
  onMuteVenue: () => void;
  onClearVenueHidden: (venueId: string, venueName: string) => void;
  onClearVenueMuted: (venueId: string, venueName: string) => void;
}) {
  function confirmHideVenue() {
    Alert.alert(
      "Hide this venue?",
      `You will not appear at ${venueName} until you unhide it.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Hide venue", style: "destructive", onPress: onHideVenue },
      ],
    );
  }

  return (
    <View style={styles.safetyPage}>
      <BackNavButton label="Return" onPress={onBack} />
      <View style={styles.safetyHeader}>
        <Text style={styles.cardTitle}>Privacy and safety</Text>
        <Text style={styles.cardBody}>Control visibility, venue privacy, and blocked spaces from one place.</Text>
      </View>

      <View style={styles.safetySectionCard}>
        <FieldBlock label="Current visibility">
          <Text style={styles.settingsInfoBody}>Pause or end your current visible session.</Text>
          <View style={styles.safetyStatusRow}>
            <View style={[styles.pulseDot, sessionVisible && styles.pulseDotActive]} />
            <Text style={styles.safetyStatusText}>{sessionVisible ? "Visible nearby" : "Not currently visible"}</Text>
          </View>
          <PrimaryButton
            label={visibilityAction === "pause" ? "Pausing..." : "Pause visibility"}
            onPress={onPauseVisibility}
            disabled={!sessionVisible || !!visibilityAction}
          />
          <GhostButton
            label={visibilityAction === "end" ? "Ending..." : "End session"}
            onPress={onEndSession}
            disabled={!sessionVisible || !!visibilityAction}
          />
        </FieldBlock>
      </View>

      <View style={styles.safetySectionCard}>
        <FieldBlock label="Venue privacy">
          <Text style={styles.settingsInfoBody}>Choose where you can be seen and where alerts are allowed.</Text>
          {venueMessage ? (
            <Text style={venueMessage.tone === "success" ? styles.settingsSuccessText : styles.errorText}>
              {venueMessage.text}
            </Text>
          ) : null}
          <GhostButton
            label={venueAction === "hiding" ? "Hiding..." : `Hide this venue`}
            onPress={confirmHideVenue}
            destructive
            disabled={!!venueAction}
          />
          <GhostButton
            label={
              venueAction === "muting"
                ? "Muting venue..."
                : venueMuted
                  ? "Alerts are off here"
                  : "Turn off alerts here"
            }
            onPress={onMuteVenue}
            destructive={!venueMuted}
            disabled={!!venueAction || venueMuted}
          />
        </FieldBlock>
      </View>

      <View style={styles.safetySectionCard}>
        <FieldBlock label="Hidden and muted venues">
          <Text style={styles.settingsInfoBody}>{locationStatus}</Text>
          {venuePreferenceMessage ? (
            <Text style={venuePreferenceMessage.tone === "success" ? styles.settingsSuccessText : styles.errorText}>
              {venuePreferenceMessage.text}
            </Text>
          ) : null}
          {venuePreferences.length === 0 ? (
            <Text style={styles.settingsInfoBody}>No hidden or muted venues.</Text>
          ) : (
            venuePreferences.map((preference) => {
              const activeAction =
                venuePreferenceAction?.venueId === preference.venueId ? venuePreferenceAction.action : null;

              return (
                <View key={preference.venueId} style={styles.settingsVenueRow}>
                  <Text style={styles.settingsInfoTitle}>{preference.venueName}</Text>
                  {preference.hidden ? (
                    <GhostButton
                      label={activeAction === "unhide" ? "Unhiding..." : "Unhide"}
                      onPress={() => onClearVenueHidden(preference.venueId, preference.venueName)}
                      disabled={!!activeAction}
                    />
                  ) : null}
                  {preference.muted ? (
                    <GhostButton
                      label={activeAction === "unmute" ? "Turning on..." : "Turn notifications on"}
                      onPress={() => onClearVenueMuted(preference.venueId, preference.venueName)}
                      disabled={!!activeAction}
                    />
                  ) : null}
                </View>
              );
            })
          )}
        </FieldBlock>
      </View>
    </View>
  );
}
