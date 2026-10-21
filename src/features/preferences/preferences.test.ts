import { describe, expect, it } from "vitest";
import { resolveLanguage, resolveUnits, formatDistance, parsePreferences } from "./preferences-model";
describe("regional preferences", () => {
  it("matches supported device languages and falls back to English", () => {
    expect(resolveLanguage("system", ["de-DE", "fi-FI"])).toBe("fi");
    expect(resolveLanguage("system", ["de-DE"])).toBe("en");
    expect(resolveLanguage("sv", ["fi-FI"])).toBe("sv");
  });
  it("respects the phone measurement system independently of language", () => {
    expect(resolveUnits("system", "imperial", "fi-FI")).toBe("imperial");
    expect(resolveUnits("system", null, "en-US")).toBe("imperial");
    expect(resolveUnits("system", null, "en-GB")).toBe("imperial");
    expect(resolveUnits("system", "metric", "en-US")).toBe("metric");
    expect(resolveUnits("metric", "imperial", "en-US")).toBe("metric");
  });
  it("converts stored metres and handles unavailable distances", () => {
    expect(formatDistance(100, "metric", "en")).toBe("100 m");
    expect(formatDistance(1609.344, "imperial", "en")).toBe("1.0 mi");
    expect(formatDistance(100, "imperial", "en")).toBe("328 ft");
    expect(formatDistance(1500, "metric", "fi")).toMatch(/1,5.*km/);
    for (const n of [null, undefined, -1, NaN, Infinity]) expect(formatDistance(n, "metric", "en")).toBeNull();
  });
  it("ignores corrupt storage and never opts in from malformed values", () => {
    expect(parsePreferences("bad")).toEqual({ language: "system", units: "system", analytics: false });
    expect(parsePreferences('{"language":"xx","units":"xx","analytics":"yes"}').analytics).toBe(false);
  });
});
