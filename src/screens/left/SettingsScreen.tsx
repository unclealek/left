import { SettingsTools } from "../../features/settings/SettingsTools";
import { useTranslation } from "../../features/preferences/use-translation";
import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import type { AppUser } from "../../types/left-domain";
import { T, styles } from "../../app/leftTheme";
import { LeftIcon, type LeftIconName } from "../../components/icons";
import { type ShowAppDialog } from "../../components/left/ui";
import { ScreenHeader } from "../../components/left/navigation";
import type { LegalDocumentId } from "../../features/legal/legal-content";

type SettingsMenuRowProps = {
  icon: LeftIconName;
  label: string;
  helper?: string;
  value?: string;
  onPress?: () => void;
  last?: boolean;
  destructive?: boolean;
  disabled?: boolean;
};

export function SettingsScreen({
  user,
  deletionState,
  onOpenSafety,
  onSignOut,
  onRequestDeletion,
  onShowDialog,
  onBack,
  onOpenLegal,
}: {
  user: AppUser;
  deletionState: "idle" | "submitting" | "pending" | "error";
  onOpenSafety: () => void;
  onSignOut: () => void;
  onRequestDeletion: () => void;
  onShowDialog: ShowAppDialog;
  onBack: () => void;
  onOpenLegal: (document: LegalDocumentId) => void;
}) {
  const { t } = useTranslation();
  const [settingsActionMessage, setSettingsActionMessage] = useState<string | null>(null);

  function openNotificationPreferences() {
    setSettingsActionMessage(null);
    void Linking.openSettings().catch(() => {
      setSettingsActionMessage(t("Couldn't open phone settings."));
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
      t("Log out?"),
      t("You can sign back in anytime."),
      [
        { label: t("Cancel"), variant: "ghost" },
        { label: t("Log out"), variant: "destructive", onPress: onSignOut },
      ],
    );
  }

  return (
    <View style={styles.settingsPage}>
      <ScreenHeader title={t("Settings")} onBack={onBack} variant="utility" />

      <Text style={styles.settingsGroupTitle}>{t('Account')}</Text>
      <View style={styles.settingsMenuCard}>
        <SettingsMenuRow icon="user" label={t("Account information")} value={user.firstName} />
        <SettingsMenuRow icon="shield" label={t("Privacy and safety")} helper={t("Manage hidden venues and muted alerts.")} onPress={onOpenSafety} />
        <SettingsMenuRow icon="radio" label={t("Notifications")} helper={t("Manage alerts.")} onPress={openNotificationPreferences} last />
      </View>

      <SettingsTools userId={user.id} onShowDialog={onShowDialog} onOpenVenuePreferences={onOpenSafety} />
      <Text style={styles.settingsGroupTitle}>{t('Legal')}</Text>
      <View style={styles.settingsMenuCard}>
        <SettingsMenuRow icon="file-text" label={t("Terms of Service")} onPress={() => onOpenLegal("terms")} />
        <SettingsMenuRow icon="lock" label={t("Privacy Policy")} onPress={() => onOpenLegal("privacy")} />
        <SettingsMenuRow icon="users" label={t("Community Guidelines")} onPress={() => onOpenLegal("community")} last />
      </View>
      <Text style={styles.settingsGroupTitle}>{t('General')}</Text>
      <View style={styles.settingsMenuCard}>
        <SettingsMenuRow icon="activity" label={t("About Left")} helper={t("App info and updates.")} onPress={openAboutLeft} last />
      </View>
      {settingsActionMessage ? <Text style={styles.settingsInfoBody}>{settingsActionMessage}</Text> : null}

      <View style={styles.settingsSessionActions}>
        <SettingsSessionAction
          label={t("Log out")}
          onPress={confirmSignOut}
          disabled={deletionState === "submitting"}
        />
        <SettingsSessionAction
          label={t(
            deletionState === "submitting"
              ? "Deleting account..."
              : deletionState === "pending" || deletionState === "error"
                ? "Retry account deletion"
                : "Delete account"
          )}
          onPress={onRequestDeletion}
          disabled={deletionState === "submitting"}
          busy={deletionState === "submitting"}
        />
        {deletionState === "pending" ? (
          <View style={styles.settingsRemovalStatus} accessibilityRole="text">
            <LeftIcon name="clock" size={19} color={T.textSecondary} />
            <View style={styles.settingsRemovalStatusCopy}>
              <Text style={[styles.settingsRemovalStatusTitle, { color: T.textPrimary }]}>{t('Deletion needs another try')}</Text>
              <Text style={styles.settingsSuccessText}>{t('Your request is saved, but deletion has not been confirmed. Stay signed in and retry. Apple may ask you to authorize again.')}</Text>
            </View>
          </View>
        ) : null}
        {deletionState === "error" ? (
          <Text accessibilityLiveRegion="polite" style={[styles.errorText, styles.settingsDeletionFeedback]}>{t('We could not confirm deletion. Please try again.')}</Text>
        ) : null}
      </View>
    </View>
  );
}

function SettingsSessionAction({ label, onPress, disabled, busy = false }: {
  label: string;
  onPress: () => void;
  disabled: boolean;
  busy?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy }}
      style={({ pressed }) => [
        styles.settingsSessionAction,
        pressed && styles.iconButtonPressed,
        disabled && styles.settingsMenuDisabled,
      ]}
    >
      <Text style={styles.settingsSessionActionLabel}>{label}</Text>
    </Pressable>
  );
}

function SettingsMenuRow({ icon, label, helper, value, onPress, last = false, destructive = false, disabled = false }: SettingsMenuRowProps) {
  const rowContent = (
    <>
      <View style={styles.settingsMenuIconWrap}>
        <LeftIcon name={icon} size={19} color={destructive ? T.dangerText : T.textPrimary} />
      </View>
      <View style={styles.settingsMenuTextBlock}>
        <Text style={[styles.settingsMenuLabel, destructive && styles.settingsMenuDestructiveLabel]}>{label}</Text>
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
        disabled={disabled}
        accessibilityState={{ disabled, busy: disabled }}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.settingsMenuRow,
          last && styles.settingsMenuRowLast,
          pressed && styles.iconButtonPressed,
          disabled && styles.settingsMenuDisabled,
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
