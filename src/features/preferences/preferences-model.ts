export const PREFERENCES_STORAGE_KEY = "left/device-preferences/v1";
export const SUPPORTED_LANGUAGES = ["en", "fi", "sv"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export type LanguagePreference = Language | "system";
export type Units = "metric" | "imperial";
export type Preferences = { language: LanguagePreference; units: Units | "system"; analytics: boolean };
export const DEFAULT_PREFERENCES: Preferences = { language: "system", units: "system", analytics: false };
export function parsePreferences(value: string | null): Preferences {
  try {
    const p = JSON.parse(value ?? "null");
    return {
      language: (SUPPORTED_LANGUAGES as readonly string[]).includes(p?.language) ? p.language : "system",
      units: ["metric", "imperial"].includes(p?.units) ? p.units : "system",
      analytics: p?.analytics === true,
    };
  } catch { return { ...DEFAULT_PREFERENCES }; }
}
export function resolveLanguage(language: LanguagePreference, locales: string[]): Language {
  if (language !== "system") return language;
  for (const locale of locales) {
    const base = locale.split(/[-_]/)[0];
    if ((SUPPORTED_LANGUAGES as readonly string[]).includes(base)) return base as Language;
  }
  return "en";
}
export function resolveUnits(units: Preferences["units"], device: string | null, locale: string): Units {
  if (units !== "system") return units;
  if (device) return device === "metric" ? "metric" : "imperial";
  return /[-_](US|GB|LR|MM)\b/i.test(locale) ? "imperial" : "metric";
}
export function formatDistance(metres: number | null | undefined, units: Units, locale: string): string | null {
  if (metres == null || !Number.isFinite(metres) || metres < 0) return null;
  const large = units === "metric" ? metres >= 1000 : metres >= 1609.344;
  const value = units === "metric" ? (large ? metres / 1000 : metres) : (large ? metres / 1609.344 : metres / 0.3048);
  const amount = new Intl.NumberFormat(locale, { useGrouping: false, minimumFractionDigits: large ? 1 : 0, maximumFractionDigits: large ? 1 : 0 }).format(value);
  return `${amount} ${units === "metric" ? (large ? "km" : "m") : (large ? "mi" : "ft")}`;
}
