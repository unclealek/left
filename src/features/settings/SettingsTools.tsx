import { useEffect, useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, Switch, Text, View } from "react-native";
import * as Application from "expo-application";
import { T, styles } from "../../app/leftTheme";
import type { ShowAppDialog } from "../../components/left/ui";
import { useTranslation } from "../preferences/use-translation";
import { applyAnalyticsPreference } from "../../lib/posthog";
import { downloadAccountData } from "./data-download";
import notices from "./third-party-notices.json";

type Pane = "language" | "units" | "privacy" | "licences" | null;
const title = { language: "App language", units: "Measurement units", privacy: "Privacy preferences", licences: "Licences" };
export function SettingsTools({ userId, onShowDialog, onOpenVenuePreferences }: { userId: string; onShowDialog: ShowAppDialog; onOpenVenuePreferences: () => void }) {
  const { t, preferences, savePreferences } = useTranslation();
  const [pane, setPane] = useState<Pane>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<(typeof notices)[number] | null>(null);
  useEffect(() => {
    setPane(null); setError(null);
  }, [userId]);
  async function save(next: typeof preferences) {
    setBusy(true); setError(null);
    try {
      if (next.analytics !== preferences.analytics) await applyAnalyticsPreference(next.analytics);
      await savePreferences(next);
    } catch {
      await applyAnalyticsPreference(preferences.analytics).catch(() => {});
      setError("Could not save your preferences. Please try again.");
    } finally { setBusy(false); }
  }
  function row(label: string, helper: string, action: () => void) {
    return <Pressable key={label} accessibilityRole="button" onPress={() => { setError(null); action(); }} style={({ pressed }) => [styles.settingsMenuRow, pressed && styles.iconButtonPressed]}>
      <View style={styles.settingsMenuTextBlock}><Text style={styles.settingsMenuLabel}>{t(label)}</Text><Text style={styles.settingsMenuHelper}>{t(helper)}</Text></View>
      <Text style={styles.settingsMenuValue}>›</Text>
    </Pressable>;
  }
  function choice(label: string, selected: boolean, action: () => void) {
    return <Pressable key={label} accessibilityRole="radio" accessibilityState={{ checked: selected, disabled: busy }} disabled={busy} onPress={action} style={styles.settingsMenuRow}>
      <Text style={[styles.settingsMenuLabel, { flex: 1 }]}>{t(label)}</Text><Text style={styles.settingsMenuValue}>{selected ? "✓" : ""}</Text>
    </Pressable>;
  }
  async function exportData() {
    setBusy(true); setError(null);
    try { await downloadAccountData(); }
    catch { setError("Could not prepare your data. Please try again."); }
    finally { setBusy(false); }
  }
  return <>
    <Text style={styles.settingsGroupTitle}>{t("Language and region")}</Text>
    <View style={styles.settingsMenuCard}>
      {row("App language", preferences.language === "system" ? "Follow device" : { en: "English", fi: "Finnish", sv: "Swedish" }[preferences.language], () => setPane("language"))}
      {row("Measurement units", preferences.units === "system" ? "Follow device" : preferences.units === "metric" ? "Metres and kilometres" : "Feet and miles", () => setPane("units"))}
    </View>
    <Text style={styles.settingsGroupTitle}>{t("Privacy preferences")}</Text>
    <View style={styles.settingsMenuCard}>
      {row("Privacy preferences", "Usage analytics and diagnostics", () => setPane("privacy"))}
      {row("Hidden & muted venues", "Manage hidden venues and muted alerts.", onOpenVenuePreferences)}
      <Pressable accessibilityRole="button" disabled={busy} onPress={() => onShowDialog(t("Download my data"), t("Your data includes personal information. Choose where to save it in the next step."), [{ label: t("Cancel"), variant: "ghost" }, { label: t("Continue"), variant: "primary", onPress: () => void exportData() }])} style={styles.settingsMenuRow}>
        <View style={styles.settingsMenuTextBlock}><Text style={styles.settingsMenuLabel}>{t(busy ? "Preparing your download…" : "Download my data")}</Text><Text style={styles.settingsMenuHelper}>{t("Save a copy of your app account records.")}</Text></View>
      </Pressable>
    </View>
    <View style={styles.settingsMenuCard}>
      {row("Licences", "Open-source software notices", () => { setNotice(null); setPane("licences"); })}
      <View style={styles.settingsMenuRow}><Text style={[styles.settingsMenuLabel, { flex: 1 }]}>{t("App version")}</Text><Text style={styles.settingsMenuValue}>{Application.nativeApplicationVersion ?? t("Web")} {Application.nativeBuildVersion ? `(${Application.nativeBuildVersion})` : ""}</Text></View>
    </View>
    {error && !pane ? <Text accessibilityRole="alert" style={styles.errorText}>{t(error)}</Text> : null}
    <Modal visible={pane !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPane(null)}>
      <View style={{ flex: 1, backgroundColor: T.surfaceCard, paddingTop: 24 }}>
        <View style={{ paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Text accessibilityRole="header" style={[styles.settingsGroupTitle, { flex: 1 }]}>{pane ? t(title[pane]) : ""}</Text>
          <Pressable accessibilityRole="button" onPress={() => { if (notice) setNotice(null); else setPane(null); }} style={{ minHeight: 44, minWidth: 60, justifyContent: "center" }}><Text style={styles.settingsMenuLabel}>{t(notice ? "Back" : "Done")}</Text></Pressable>
        </View>
        {pane === "licences" && !notice ? <FlatList data={notices} keyExtractor={item => `${item.name}@${item.version}`} contentContainerStyle={{ paddingBottom: 48 }} initialNumToRender={15} renderItem={({ item }) => <Pressable accessibilityRole="button" onPress={() => setNotice(item)} style={styles.settingsMenuRow}><View style={styles.settingsMenuTextBlock}><Text style={styles.settingsMenuLabel}>{item.name} {item.version}</Text><Text style={styles.settingsMenuHelper}>{typeof item.licence === "string" ? item.licence : JSON.stringify(item.licence)}</Text></View></Pressable>} /> : null}
        <ScrollView style={{ display: pane === "licences" && !notice ? "none" : "flex" }} contentContainerStyle={{ paddingBottom: 48 }}>
          {pane === "language" ? <View accessibilityRole="radiogroup">{(["system", "en", "fi", "sv"] as const).map(value => choice(value === "system" ? "Follow device" : { en: "English", fi: "Finnish", sv: "Swedish" }[value], preferences.language === value, () => void save({ ...preferences, language: value })))}</View> : null}
          {pane === "units" ? <View accessibilityRole="radiogroup">{(["system", "metric", "imperial"] as const).map(value => choice(value === "system" ? "Follow device" : value === "metric" ? "Metres and kilometres" : "Feet and miles", preferences.units === value, () => void save({ ...preferences, units: value })))}</View> : null}
          {pane === "privacy" ? <View style={styles.settingsMenuRow}>
            <View style={styles.settingsMenuTextBlock}><Text style={styles.settingsMenuLabel}>{t("Usage analytics and diagnostics")}</Text><Text style={styles.settingsMenuHelper}>{t("Help improve the app with usage events and error reports. Optional; this choice applies on this device.")}</Text></View>
            <Switch accessibilityLabel={t("Usage analytics and diagnostics")} value={preferences.analytics} disabled={busy} onValueChange={analytics => void save({ ...preferences, analytics })} />
          </View> : null}
          {pane === "licences" ? notice ? <View style={{ padding: 20, gap: 16 }}><Text style={styles.settingsGroupTitle}>{notice.name} {notice.version}</Text><Text selectable style={styles.settingsActionHint}>{notice.text}</Text><Text selectable style={styles.settingsActionHint}>{notice.url}</Text></View> : null : null}
          {error ? <Text accessibilityRole="alert" style={{ ...styles.errorText, padding: 20 }}>{t(error)}</Text> : null}
        </ScrollView>
      </View>
    </Modal>
  </>;
}
