import type { Language } from "./preferences-model";
import { translate } from "./translations";
let currentLanguage: Language = "en";
let currentLocale = "en";
export function setTranslationLocale(locale: string) { currentLocale = locale; }
export function getTranslationLocale() { return currentLocale; }
export function setTranslationLanguage(language: Language) { currentLanguage = language; }
/** Call only for app-owned interface copy, never user-generated content. */
export function t(source: string, values: Record<string, string | number> = {}) {
  return translate(source, currentLanguage).replace(/\{(\w+)\}/g, (token, key: string) =>
    Object.hasOwn(values, key) ? String(values[key]) : token,
  );
}
