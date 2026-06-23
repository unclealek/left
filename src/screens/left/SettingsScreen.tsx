import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import type { AppUser } from "../../types/left-domain";
import { T, styles } from "../../app/leftTheme";
import { GhostButton } from "../../components/left/ui";

type SettingsMenuRowProps = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  helper?: string;
  value?: string;
  onPress?: () => void;
  last?: boolean;
};

export function SettingsScreen({
  user,
  deletionState,
  onOpenSafety,
  onSignOut,
  onRequestDeletion,
  onBack,
}: {
  user: AppUser;
  deletionState: "idle" | "submitting" | "submitted" | "error";
  onOpenSafety: () => void;
  onSignOut: () => void;
  onRequestDeletion: () => void;
  onBack: () => void;
}) {
  const [settingsActionMessage, setSettingsActionMessage] = useState<string | null>(null);

  function openNotificationPreferences() {
    setSettingsActionMessage(null);
    void Linking.openSettings().catch(() => {
      setSettingsActionMessage("Couldn't open phone settings.");
    });
  }

  function openAboutLeft() {
    setSettingsActionMessage(null);
    void Linking.openURL("https://google.com").catch(() => {
      setSettingsActionMessage("Couldn't open the website.");
    });
  }

  function confirmSignOut() {
    Alert.alert(
      "Log out?",
      "You can sign back in anytime.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log out", style: "destructive", onPress: onSignOut },
      ],
    );
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
        <SettingsMenuRow icon="user" label="Account information" value={user.firstName} />
        <SettingsMenuRow icon="shield" label="Privacy and safety" helper="Manage blocks and hidden venues." onPress={onOpenSafety} />
        <SettingsMenuRow icon="bell" label="Notifications" helper="Manage alerts." onPress={openNotificationPreferences} last />
      </View>

      <Text style={styles.settingsGroupTitle}>General</Text>
      <View style={styles.settingsMenuCard}>
        <SettingsMenuRow icon="info" label="About Left" helper="App info and updates." onPress={openAboutLeft} last />
      </View>
      {settingsActionMessage ? <Text style={styles.settingsInfoBody}>{settingsActionMessage}</Text> : null}

      <Pressable onPress={confirmSignOut} style={({ pressed }) => [styles.settingsLogoutButton, pressed && styles.primaryBtnPressed]}>
        <Feather name="log-out" size={20} color={T.white} />
        <Text style={styles.settingsLogoutText}>Log out</Text>
      </Pressable>

      <Text style={styles.settingsInfoBody}>Need your identity removed from Left? Submit a request below.</Text>
      <GhostButton
        label={
          deletionState === "submitting"
            ? "Sending request..."
            : deletionState === "submitted"
              ? "Removal requested"
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

function SettingsMenuRow({ icon, label, helper, value, onPress, last = false }: SettingsMenuRowProps) {
  const rowContent = (
    <>
      <Feather name={icon} size={22} color={T.textPrimary} />
      <View style={styles.settingsMenuTextBlock}>
        <Text style={styles.settingsMenuLabel}>{label}</Text>
        {helper ? <Text style={styles.settingsMenuHelper}>{helper}</Text> : null}
      </View>
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
