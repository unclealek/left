import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ owner: "a" as string | null, nearby: vi.fn(), stop: vi.fn(), save: vi.fn(), clear: vi.fn(), schedule: vi.fn(), presented: vi.fn(), started: false, start: vi.fn(), permissions: "granted" }));
vi.mock("react-native", () => ({ Platform: { OS: "ios" } }));
vi.mock("expo-location", () => ({ hasStartedLocationUpdatesAsync: async () => m.started, stopLocationUpdatesAsync: m.stop,
  startLocationUpdatesAsync: m.start, Accuracy: { Balanced: 3 }, getForegroundPermissionsAsync: async () => ({ status: m.permissions }),
  getBackgroundPermissionsAsync: async () => ({ status: m.permissions }) }));
vi.mock("expo-notifications", () => ({ setNotificationHandler: vi.fn(), getPresentedNotificationsAsync: m.presented,
  dismissNotificationAsync: vi.fn(), scheduleNotificationAsync: m.schedule }));
vi.mock("./venue-detection", () => ({ getNearbyVenues: m.nearby, detectVenueFromCoords: vi.fn() }));
vi.mock("./location-storage", () => ({
  getLocationStorageOwner: async () => m.owner,
  getLocationRuntimeState: async () => ({ storageOwnerId: m.owner, prompt: null, nearbyVenues: [] }),
  saveLocationRuntimeState: m.save,
  clearLocationAccountData: m.clear,
  getDefaultRuntimeState: () => ({ permissionGranted: false }),
  updateLocationRuntimeState: async (updater: any) => updater({}),
}));
import { handleVenuePromptResponse, processLocationFix, stopLocationForAccount, syncLocationRegistrationState } from "./location-service";
beforeEach(() => {
  vi.clearAllMocks(); m.owner = "a"; m.nearby.mockResolvedValue([]); m.stop.mockResolvedValue(undefined); m.presented.mockResolvedValue([]);
  m.started = true; m.permissions = "granted"; m.start.mockResolvedValue(undefined);
});
const coords = { latitude: 60, longitude: 24, accuracy: 1 } as any;
it("does no lookup or persistence while signed out", async () => {
  m.owner = null;
  await processLocationFix(coords);
  expect(m.nearby).not.toHaveBeenCalled(); expect(m.save).not.toHaveBeenCalled();
});
it("discards an in-flight fix when the account changes", async () => {
  m.nearby.mockImplementation(async () => { m.owner = "b"; return []; });
  await processLocationFix(coords);
  expect(m.save).not.toHaveBeenCalled(); expect(m.schedule).not.toHaveBeenCalled();
});
it("stops the OS task and clears account data", async () => {
  await stopLocationForAccount("a");
  expect(m.stop).toHaveBeenCalledWith("left/background-location");
  expect(m.clear).toHaveBeenCalledWith("a");
});
it("clears local data even if the OS cannot stop its task", async () => {
  m.stop.mockRejectedValue(new Error("OS failure"));
  await expect(stopLocationForAccount("a")).rejects.toThrow("OS failure");
  expect(m.clear).toHaveBeenCalledWith("a");
});
it("ignores another account's notification", async () => {
  expect(await handleVenuePromptResponse({ notification: { request: { content: { data: { ownerId: "b", venueId: "v", venueName: "private" } } } } } as any))
    .toEqual({ action: "unknown" });
});
it("resumes tracking only for an authenticated account with existing permission", async () => {
  m.started = false;
  expect(await syncLocationRegistrationState()).toMatchObject({ backgroundRegistered: true, permissionGranted: true });
  expect(m.start).toHaveBeenCalledTimes(1);
});
it.each(["signed-out", "denied"])("does not start tracking when %s", async (reason) => {
  m.started = false;
  if (reason === "signed-out") m.owner = null; else m.permissions = "denied";
  await syncLocationRegistrationState();
  expect(m.start).not.toHaveBeenCalled();
});
