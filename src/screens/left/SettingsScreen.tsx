import { Feather } from "@expo/vector-icons";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import type { AppUser } from "../../types/left-domain";
import { T, styles } from "../../app/leftTheme";
import { GhostButton } from "../../components/left/ui";
import type { VenuePreference } from "../../features/location/location-storage";

type SettingsMenuRowProps = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  last?: boolean;
};

export function SettingsScreen({
  user,
  deletionState,
  venuePreferences,
  venuePreferenceAction,
  venuePreferenceMessage,
  locationStatus,
  onOpenSafety,
  onClearVenueHidden,
  onClearVenueMuted,
  onSignOut,
  onRequestDeletion,
  onBack,
}: {
  user: AppUser;
  deletionState: "idle" | "submitting" | "submitted" | "error";
  venuePreferences: VenuePreference[];
  venuePreferenceAction: {
    venueId: string;
    action: "hide" | "mute" | "unhide" | "unmute";
  } | null;
  venuePreferenceMessage: { tone: "success" | "error"; text: string } | null;
  locationStatus: string;
  onOpenSafety: () => void;
  onClearVenueHidden: (venueId: string, venueName: string) => void;
  onClearVenueMuted: (venueId: string, venueName: string) => void;
  onSignOut: () => void;
  onRequestDeletion: () => void;
  onBack: () => void;
}) {
  function showLanguageSelection() {
    Alert.alert("Language", "English is currently the only supported language.");
  }

  function showAppearanceSelection() {
    Alert.alert("Appearance", "Light mode is currently the only supported appearance.");
  }

  function openNotificationPreferences() {
    void Linking.openSettings();
  }

  function openAboutLeft() {
    void Linking.openURL("https://google.com");
  }

  return (
    <View style={styles.settingsPage}>
      <View style={styles.settingsTopBar}>
        <Pressable onPress={onBack} accessibilityRole="button" style={({ pressed }) => [styles.profileHeaderButton, pressed && styles.iconButtonPressed]}>
          <Feather name="chevron-left" size={28} color={T.textPrimary} />
        </Pressable>
        <Text style={styles.profileHeaderTitle}>Settings</Text>
        <View style={styles.profileHeaderButton} />
      </View>

      <Text style={styles.settingsGroupTitle}>Account</Text>
      <View style={styles.settingsMenuCard}>
        <SettingsMenuRow icon="user" label="Account Information" value={user.firstName} />
        <SettingsMenuRow icon="shield" label="Privacy Settings" onPress={onOpenSafety} />
        <SettingsMenuRow icon="bell" label="Notification Preferences" value="Device settings" onPress={openNotificationPreferences} last />
      </View>

      <Text style={styles.settingsGroupTitle}>General</Text>
      <View style={styles.settingsMenuCard}>
        <SettingsMenuRow icon="globe" label="Language" value="English" onPress={showLanguageSelection} />
        <SettingsMenuRow icon="moon" label="Appearance" value="Light" onPress={showAppearanceSelection} />
        <SettingsMenuRow icon="info" label="About Left" onPress={openAboutLeft} last />
      </View>

      <Text style={styles.settingsGroupTitle}>Blocked or Muted Venues</Text>
      <View style={styles.settingsEditCard}>
        <Text style={styles.settingsInfoBody}>{locationStatus}</Text>
        {venuePreferenceMessage ? (
          <Text style={venuePreferenceMessage.tone === "success" ? styles.settingsSuccessText : styles.errorText}>
            {venuePreferenceMessage.text}
          </Text>
        ) : null}
        {venuePreferences.length === 0 ? (
          <Text style={styles.settingsInfoBody}>No blocked or muted venues yet.</Text>
        ) : (
          venuePreferences.map((preference) => {
            const activeAction =
              venuePreferenceAction?.venueId === preference.venueId ? venuePreferenceAction.action : null;

            return (
              <View key={preference.venueId} style={styles.settingsVenueRow}>
                <Text style={styles.settingsInfoTitle}>{preference.venueName}</Text>
                {preference.hidden ? (
                  <GhostButton
                    label={activeAction === "unhide" ? "Unhiding..." : "Undo hide"}
                    onPress={() => onClearVenueHidden(preference.venueId, preference.venueName)}
                    disabled={!!activeAction}
                  />
                ) : null}
                {preference.muted ? (
                  <GhostButton
                    label={activeAction === "unmute" ? "Re-enabling..." : "Allow notifications"}
                    onPress={() => onClearVenueMuted(preference.venueId, preference.venueName)}
                    disabled={!!activeAction}
                  />
                ) : null}
              </View>
            );
          })
        )}
      </View>

      <Pressable onPress={onSignOut} style={({ pressed }) => [styles.settingsLogoutButton, pressed && styles.primaryBtnPressed]}>
        <Feather name="log-out" size={20} color={T.white} />
        <Text style={styles.settingsLogoutText}>Log Out</Text>
      </Pressable>

      <GhostButton
        label={
          deletionState === "submitting"
            ? "Submitting identity removal..."
            : deletionState === "submitted"
              ? "Identity removal requested"
              : "Request identity removal"
        }
        onPress={onRequestDeletion}
        destructive
        disabled={deletionState === "submitting"}
      />
      {deletionState === "submitted" ? (
        <Text style={styles.settingsSuccessText}>We recorded your identity-removal request and the backend can now process it under the retention policy.</Text>
      ) : null}
      {deletionState === "error" ? (
        <Text style={styles.errorText}>We could not submit your identity-removal request yet.</Text>
      ) : null}
    </View>
  );
}

function SettingsMenuRow({ icon, label, value, onPress, last = false }: SettingsMenuRowProps) {
  const rowContent = (
    <>
      <Feather name={icon} size={22} color={T.textPrimary} />
      <Text style={styles.settingsMenuLabel}>{label}</Text>
      {value ? <Text style={styles.settingsMenuValue}>{value}</Text> : null}
      {onPress ? <Feather name="chevron-right" size={21} color={T.textSecondary} /> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.settingsMenuRow,
          last && styles.settingsMenuRowLast,
          pressed && styles.iconButtonPressed,
        ]}
      >
        {rowContent}
      </Pressable>
    );
  }

  return (
    <View style={[styles.settingsMenuRow, last && styles.settingsMenuRowLast]}>
      {rowContent}
    </View>
  );
}
