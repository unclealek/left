import { expect, it } from "vitest";
import { translate } from "./translations";
import { setTranslationLanguage, t } from "./translation-runtime";
import dictionary from "./interface-translations.json";
it("provides both translations for every catalog entry", () => {
  for (const [key, values] of Object.entries(dictionary)) {
    expect(values).toHaveLength(2);
    for (const language of ["fi", "sv"] as const) expect(translate(key, language).trim().length).toBeGreaterThan(0);
  }
});
it("switches interface copy and preserves unknown user-provided text", () => {
  setTranslationLanguage("fi"); expect(t("Settings")).toBe("Asetukset");
  setTranslationLanguage("sv"); expect(t("Go visible")).toBe("Bli synlig");
  expect(t("Fazer Café Kluuvikatu")).toBe("Fazer Café Kluuvikatu");
  setTranslationLanguage("en"); expect(t("Go visible")).toBe("Go visible");
});

it("preserves interpolation placeholders in both launch languages", () => {
  const placeholders = (value: string) => [...value.matchAll(/\{([a-zA-Z]\w*)\}/g)].map(match => match[1]).sort();
  for (const [source, translations] of Object.entries(dictionary)) {
    for (const translated of translations) expect(placeholders(translated), source).toEqual(placeholders(source));
  }
});

it("matches the confirmed launch languages in native configuration", async () => {
  const { SUPPORTED_LANGUAGES } = await import("./preferences-model");
  const appConfig = await import("../../../app.json");
  const plugin = appConfig.expo.plugins.find(value => Array.isArray(value) && value[0] === "expo-localization") as [string, { supportedLocales: string[] }];
  expect(SUPPORTED_LANGUAGES).toEqual(["en", "fi", "sv"]);
  expect(plugin[1].supportedLocales).toEqual([...SUPPORTED_LANGUAGES]);
});

it("has Finnish and Swedish copy for every literal translation call", async () => {
  const { readFileSync, readdirSync } = await import("node:fs");
  const path = await import("node:path");
  const ts = await import("typescript");
  const { hasTranslation } = await import("./translations");
  const keys = new Set<string>();
  function scanFile(filePath: string) {
    const file = ts.createSourceFile(filePath, readFileSync(filePath, "utf8"), ts.ScriptTarget.Latest, true);
    function visit(node: import("typescript").Node) {
      if (ts.isCallExpression(node) && node.expression.getText(file) === "t" && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) keys.add(node.arguments[0].text);
      ts.forEachChild(node, visit);
    }
    visit(file);
  }
  function scanDirectory(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) scanDirectory(file);
      else if (/\.tsx?$/.test(file) && !file.includes(".test.")) scanFile(file);
    }
  }
  scanDirectory("src"); scanFile("App.tsx");
  const unchanged = new Set(["Google", "Google Maps", "Left", "LEFT", ""]);
  expect([...keys].filter(key => !unchanged.has(key) && !hasTranslation(key))).toEqual([]);
});

it("inserts names literally without treating their characters as replacement syntax", () => {
  setTranslationLanguage("sv");
  expect(t("Notifications are off at {venue}.", { venue: "$& {count}" })).toBe("Aviseringar är avstängda för $& {count}.");
  setTranslationLanguage("en");
});
