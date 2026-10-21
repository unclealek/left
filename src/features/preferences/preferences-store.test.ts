import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn(), locales: [{ languageTag: "fi-FI", regionCode: "FI", measurementSystem: "metric" }] }));
vi.mock("@react-native-async-storage/async-storage", () => ({ default: { getItem: m.get, setItem: m.set } }));
vi.mock("expo-localization", () => ({ getLocales: () => m.locales }));
vi.mock("react-native", () => ({ AppState: { addEventListener: vi.fn(() => ({ remove: vi.fn() })) } }));
beforeEach(() => { vi.resetModules(); m.get.mockResolvedValue(null); m.set.mockResolvedValue(undefined); });
it("loads once, follows device language and keeps units independent", async () => {
  m.get.mockResolvedValue('{"language":"sv","units":"imperial","analytics":true}');
  const store = await import("./preferences-store");
  await Promise.all([store.loadPreferences(), store.loadPreferences()]);
  expect(m.get).toHaveBeenCalledTimes(1);
  expect(store.getRegion()).toEqual({ language: "sv", locale: "sv-FI", units: "imperial" });
  expect(store.getPreferences().analytics).toBe(true);
});
it("persists changes and does not report a failed write as saved", async () => {
  const store = await import("./preferences-store");
  await store.loadPreferences();
  await store.savePreferences({ language: "fi", units: "metric", analytics: false });
  expect(JSON.parse(m.set.mock.calls[0][1]).language).toBe("fi");
  m.set.mockRejectedValue(new Error("disk"));
  await expect(store.savePreferences({ language: "sv", units: "imperial", analytics: true })).rejects.toThrow();
  expect(store.getPreferences().language).toBe("fi");
});
it("recovers from unavailable or corrupted storage with analytics off", async () => {
  m.get.mockRejectedValue(new Error("disk"));
  const store = await import("./preferences-store");
  await store.loadPreferences();
  expect(store.getPreferences().analytics).toBe(false);
  expect(store.getRegion().language).toBe("fi");
});
