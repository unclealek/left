import { setTranslationLanguage, setTranslationLocale } from "./translation-runtime";
import { useEffect, useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import { getLocales } from "expo-localization";
import { PREFERENCES_STORAGE_KEY, DEFAULT_PREFERENCES, parsePreferences, resolveLanguage, resolveUnits, type Preferences } from "./preferences-model";

let preferences = DEFAULT_PREFERENCES;
let ready = false;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
const notify = () => listeners.forEach(fn => fn());
let revision = 0;
const changed = () => { revision++; notify(); };
export function getPreferences() { return preferences; }
export function getRegion() {
  const locales = getLocales();
  const locale = locales[0];
  const language = resolveLanguage(preferences.language, locales.map(item => item.languageTag));
  setTranslationLanguage(language);
  const formatLocale = locale.regionCode ? `${language}-${locale.regionCode}` : language;
  setTranslationLocale(formatLocale);
  return {
    language,
    locale: formatLocale,
    units: resolveUnits(preferences.units, locale.measurementSystem, locale.regionCode ? `und-${locale.regionCode}` : locale.languageTag),
  };
}
export function loadPreferences() {
  return loading ??= AsyncStorage.getItem(PREFERENCES_STORAGE_KEY).then(value => { preferences = parsePreferences(value); ready = true; changed(); }).catch(() => { ready = true; changed(); });
}
export async function savePreferences(next: Preferences) {
  await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(next));
  preferences = next;
  changed();
}
export function usePreferencesBootstrap() {
  useEffect(() => {
    void loadPreferences();
    const subscription = AppState.addEventListener("change", state => { if (state === "active") changed(); });
    return () => subscription.remove();
  }, []);
}
export function usePreferences() {
  useSyncExternalStore(subscribe, () => revision, () => revision);
  return { preferences, ready, ...getRegion(), savePreferences };
}
