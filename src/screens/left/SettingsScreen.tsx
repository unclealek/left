import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import type { AppUser } from "../../types/left-domain";
import { T, styles } from "../../app/leftTheme";
import { LeftIcon, type LeftIconName } from "../../components/icons";
import { GhostButton, type ShowAppDialog } from "../../components/left/ui";
import { ScreenHeader } from "../../components/left/navigation";

type SettingsMenuRowProps = {
  icon: LeftIconName;
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
  onShowDialog,
  onBack,
}: {
  user: AppUser;
  deletionState: "idle" | "submitting" | "submitted" | "error";
  onOpenSafety: () => void;
  onSignOut: () => void;
  onRequestDeletion: () => void;
  onShowDialog: ShowAppDialog;
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
    onShowDialog(
      "About Left",
      "Left helps you signal presence at real venues, discover nearby social energy, and control how you are seen.",
    );
  }

  function confirmSignOut() {
    onShowDialog(
      "Log out?",
      "You can sign back in anytime.",
      [
        { label: "Cancel", variant: "ghost" },
        { label: "Log out", variant: "destructive", onPress: onSignOut },
      ],
    );
  }

  return (
    <View style={styles.settingsPage}>
      <ScreenHeader title="Settings" onBack={onBack} variant="utility" />

      <Text style={styles.settingsGroupTitle}>Account</Text>
      <View style={styles.settingsMenuCard}>
        <SettingsMenuRow icon="user" label="Account information" value={user.firstName} />
        <SettingsMenuRow icon="shield" label="Privacy and safety" helper="Manage blocks and hidden venues." onPress={onOpenSafety} />
        <SettingsMenuRow icon="radio" label="Notifications" helper="Manage alerts." onPress={openNotificationPreferences} last />
      </View>

      <Text style={styles.settingsGroupTitle}>General</Text>
      <View style={styles.settingsMenuCard}>
        <SettingsMenuRow icon="activity" label="About Left" helper="App info and updates." onPress={openAboutLeft} last />
      </View>
      {settingsActionMessage ? <Text style={styles.settingsInfoBody}>{settingsActionMessage}</Text> : null}

      <View style={styles.settingsActionSection}>
        <Text style={styles.settingsGroupTitle}>Session</Text>
        <Text style={styles.settingsActionHint}>Sign out on this device. You can sign back in anytime.</Text>
        <GhostButton label="Log out" onPress={confirmSignOut} leadingIcon="log-out" />
      </View>

      <View style={styles.settingsDangerCard}>
        <View style={styles.settingsDangerHeader}>
          <View style={styles.settingsDangerIconWrap}>
            <LeftIcon name="user-x" size={19} color={T.dangerText} />
          </View>
          <View style={styles.settingsDangerCopy}>
            <Text style={styles.settingsDangerTitle}>Identity removal</Text>
            <Text style={styles.settingsDangerBody}>
              Request removal of your direct identity details from Left. Retained safety and operational records remain under the current policy.
            </Text>
          </View>
        </View>

        {deletionState === "submitted" ? (
          <View style={styles.settingsRemovalStatus} accessibilityRole="text">
            <LeftIcon name="check-circle" size={19} color={T.visibilityOn} />
            <View style={styles.settingsRemovalStatusCopy}>
              <Text style={styles.settingsRemovalStatusTitle}>Removal requested</Text>
              <Text style={styles.settingsSuccessText}>Your request is recorded and ready for processing.</Text>
            </View>
          </View>
        ) : (
          <GhostButton
            label={
              deletionState === "submitting"
                ? "Sending request..."
                : deletionState === "error"
                  ? "Try request again"
                  : "Request identity removal"
            }
            onPress={onRequestDeletion}
            destructive
            loading={deletionState === "submitting"}
            leadingIcon="user-x"
          />
        )}
        {deletionState === "error" ? (
          <Text style={styles.errorText}>We could not submit your request. Nothing was removed.</Text>
        ) : null}
      </View>
    </View>
  );
}

function SettingsMenuRow({ icon, label, helper, value, onPress, last = false }: SettingsMenuRowProps) {
  const rowContent = (
    <>
      <View style={styles.settingsMenuIconWrap}>
        <LeftIcon name={icon} size={19} color={T.textPrimary} />
      </View>
      <View style={styles.settingsMenuTextBlock}>
        <Text style={styles.settingsMenuLabel}>{label}</Text>
        {helper ? <Text style={styles.settingsMenuHelper}>{helper}</Text> : null}
      </View>
      {value ? <Text style={styles.settingsMenuValue}>{value}</Text> : null}
      {onPress ? <LeftIcon name="chevron-right" size={21} color={T.textSecondary} /> : null}
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
