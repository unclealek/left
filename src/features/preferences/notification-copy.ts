import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { PREFERENCES_STORAGE_KEY, parsePreferences, resolveLanguage } from "./preferences-model";
import { translate } from "./translations";

/** Background tasks can run before React mounts; read the device choice directly. */
export async function loadVenueNotificationCopy(venue: string) {
  let stored: string | null = null;
  try { stored = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY); } catch { /* Follow device if storage is unavailable. */ }
  const language = resolveLanguage(parsePreferences(stored).language, getLocales().map(locale => locale.languageTag));
  return {
    title: translate("Open to chat?", language),
    body: translate("You've been at {venue} a while. Open to chat?", language).replaceAll("{venue}", () => venue),
    yes: translate("Yes", language),
    no: translate("No", language),
  };
}
