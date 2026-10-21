import interfaceTranslations from "./interface-translations.json";
import type { Language } from "./preferences-model";

const catalog: Record<string, string[]> = interfaceTranslations;
/** Translate app-owned copy; unknown external content retains its original text. */
export function translate(source: string, language: Language): string {
  return (language === "fi" ? catalog[source]?.[0] : language === "sv" ? catalog[source]?.[1] : source) ?? source;
}
export function hasTranslation(source: string) {
  return !!(catalog[source]?.[0] && catalog[source]?.[1]);
}
