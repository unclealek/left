import { beforeEach, expect, it, vi } from "vitest";
const storage = vi.hoisted(() => ({ get: vi.fn(), locales: [{ languageTag: "sv-FI" }] }));
vi.mock("@react-native-async-storage/async-storage", () => ({ default: { getItem: storage.get } }));
vi.mock("expo-localization", () => ({ getLocales: () => storage.locales }));
import { loadVenueNotificationCopy } from "./notification-copy";
beforeEach(() => { storage.get.mockResolvedValue(null); });
it("uses the persisted app language in a background notification", async () => {
  storage.get.mockResolvedValue('{"language":"fi"}');
  const copy = await loadVenueNotificationCopy("Fazer Café");
  expect(copy.title).toBe("Avoin juttelulle?");
  expect(copy.body).toContain("Fazer Café");
  expect(copy.yes).toBe("Kyllä");
  expect(copy.no).toBe("Ei");
});
it("follows the device language without needing the React app to be mounted", async () => {
  const copy = await loadVenueNotificationCopy("Library");
  expect(copy.title).toBe("Öppen för samtal?");
  expect(copy.yes).toBe("Ja");
});
it("still provides notification text if preference storage is unavailable", async () => {
  storage.get.mockRejectedValue(new Error("disk"));
  expect((await loadVenueNotificationCopy("Cafe")).title).toBe("Öppen för samtal?");
});
