import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ owner: "a" as string | null, data: new Map<string, string>() }));
vi.mock("../../lib/supabase", () => ({ supabase: { auth: { getSession: async () => ({ data: { session: m.owner ? { user: { id: m.owner } } : null }, error: null }) } } }));
vi.mock("@react-native-async-storage/async-storage", () => ({ default: {
  getItem: async (key: string) => m.data.get(key) ?? null,
  setItem: async (key: string, value: string) => { m.data.set(key, value); },
  multiRemove: async (keys: string[]) => { keys.forEach(key => m.data.delete(key)); },
} }));
import { clearLocationAccountData, clearVenuePreference, getActivationDefaults, getDefaultRuntimeState, getLocationRuntimeState, getVenueApproachPrompts, getVenuePreferences, saveActivationDefaults, saveLocationRuntimeState, saveVenueApproachPrompts, saveVenuePreferences, updateLocationRuntimeState, upsertVenueApproachPrompt, upsertVenuePreference } from "./location-storage";
const prefs = { v: { venueId: "v", venueName: "Private venue", hidden: true, muted: false, cooldownUntil: null, updatedAt: "today" } };
beforeEach(async () => { vi.useRealTimers(); m.owner = "a"; m.data.clear(); await clearLocationAccountData("a"); });
it("does not read or migrate ambiguous legacy preferences into an account", async () => {
  m.data.set("left/location/venue-preferences", JSON.stringify(prefs));
  expect(await getVenuePreferences()).toEqual({});
});
it("isolates account A from B", async () => {
  await saveVenuePreferences(prefs);
  m.owner = "b";
  expect(await getVenuePreferences()).toEqual({});
  m.owner = "a";
  expect(await getVenuePreferences()).toEqual(prefs);
});
it("does not persist signed-out writes", async () => {
  m.owner = null;
  await saveVenuePreferences(prefs);
  expect(m.data.size).toBe(0);
});
it("does not write a stale runtime into the next account", async () => {
  const runtime = await getLocationRuntimeState();
  m.owner = "b";
  await saveLocationRuntimeState({ ...runtime, currentVenueName: "A's venue" });
  expect((await getLocationRuntimeState()).currentVenueName).toBeNull();
});
it("clears account data and does not persist precise coordinates", async () => {
  await saveVenuePreferences(prefs);
  await saveLocationRuntimeState({ ...getDefaultRuntimeState(), lastKnownCoords: { latitude: 60.123456, longitude: 24.123456, accuracy: 1 } });
  expect([...m.data.values()].join()).not.toContain("60.123456");
  expect((await getLocationRuntimeState()).lastKnownCoords?.latitude).toBe(60.123456);
  await clearLocationAccountData("a");
  expect(await getVenuePreferences()).toEqual({});
  expect((await getLocationRuntimeState()).lastKnownCoords).toBeNull();
});
it("scopes activation hints and approach prompts to their account", async () => {
  const defaults = { intent: null, vibes: [], durationMinutes: 30, hintText: "private hint" };
  await saveActivationDefaults(defaults);
  await upsertVenueApproachPrompt("v", "Venue", "private prompt");
  expect(await getActivationDefaults()).toEqual(defaults);
  expect((await getVenueApproachPrompts()).v.promptText).toBe("private prompt");
  await saveVenueApproachPrompts({});
  expect(await getVenueApproachPrompts()).toEqual({});
  m.owner = "b";
  expect(await getActivationDefaults()).toBeNull();
  expect(await getVenueApproachPrompts()).toEqual({});
});
it("updates and clears only the current account's preference", async () => {
  await upsertVenuePreference("v", "Venue", value => ({ ...value, hidden: true }));
  await upsertVenuePreference("v", "Venue", value => ({ ...value, muted: true }));
  expect((await getVenuePreferences()).v).toMatchObject({ hidden: true, muted: true });
  await clearVenuePreference("v");
  expect(await getVenuePreferences()).toEqual({});
});
it("ignores corrupt persisted data", async () => {
  m.data.set("left/location/venue-preferences/account/a", "not-json");
  expect(await getVenuePreferences()).toEqual({});
});
it("updates runtime within the same owner without persisting photo credentials", async () => {
  await updateLocationRuntimeState(current => ({ ...current, currentVenueName: "Venue", lastKnownCoords: { latitude: 60, longitude: 24, accuracy: 5 } }));
  const runtime = await getLocationRuntimeState();
  expect(runtime.currentVenueName).toBe("Venue");
  await saveLocationRuntimeState({ ...runtime, nearbyVenues: [{ id: "v", name: "Venue", latitude: 60, longitude: 24,
    radiusMeters: 50, source: "google_places", distanceMeters: 10, photoUrl: "private-url", photo: { uri: "signed-url", attributions: [] } }] });
  expect([...m.data.values()].join()).not.toContain("private-url");
  expect([...m.data.values()].join()).not.toContain("signed-url");
});

it("does not restore a current venue after its location fix expires", async () => {
  vi.useFakeTimers();
  try {
    await saveLocationRuntimeState({ ...getDefaultRuntimeState(), currentVenueId: "old", currentVenueName: "Old cafe", selectedVenueId: "old", lastKnownCoords: { latitude: 60, longitude: 24, accuracy: 5 } });
    expect((await getLocationRuntimeState()).currentVenueId).toBe("old");
    vi.advanceTimersByTime(5 * 60_000);
    expect(await getLocationRuntimeState()).toMatchObject({ currentVenueId: null, currentVenueName: null, selectedVenueId: null, nearbyVenues: [], lastKnownCoords: null });
  } finally { vi.useRealTimers(); }
});
