import { expect, it, vi } from "vitest";
import { createForegroundVenueRefresh, resolveRuntimeVenueSummary } from "./venue-runtime";
import { INITIAL_VENUE_SUMMARY } from "./initialState";

it("clears the old venue and its social signals when no venue is detected", () => {
  expect(resolveRuntimeVenueSummary({ ...INITIAL_VENUE_SUMMARY, venueId: "old", venueName: "Old cafe", visibleCount: 5 }, { currentVenueId: null, currentVenueName: null, nearbyVenues: [], selectedVenueId: null }))
    .toEqual(INITIAL_VENUE_SUMMARY);
});
it("replaces an old venue without carrying its social signals", () => {
  const result = resolveRuntimeVenueSummary({ ...INITIAL_VENUE_SUMMARY, visibleCount: 5 }, { currentVenueId: "new", currentVenueName: "New cafe", nearbyVenues: [], selectedVenueId: null });
  expect(result).toMatchObject({ venueId: "new", venueName: "New cafe", visibleCount: 0 });
});
it("preserves social signals for the same venue", () => {
  const current = { ...INITIAL_VENUE_SUMMARY, venueId: "same", venueName: "Cafe", visibleCount: 5 };
  expect(resolveRuntimeVenueSummary(current, { currentVenueId: "same", currentVenueName: "Cafe", nearbyVenues: [], selectedVenueId: null })).toBe(current);
});
it("requests a fresh fix before reading runtime, and throttles rapid resumes", async () => {
  let now = 0;
  const refresh = createForegroundVenueRefresh(() => now);
  const calls: string[] = [];
  const fix = vi.fn(async () => { calls.push("gps"); });
  const read = vi.fn(async () => { calls.push("runtime"); });
  await refresh(fix, read);
  await refresh(fix, read);
  expect(calls).toEqual(["gps", "runtime"]);
  now = 90000;
  await refresh(fix, read);
  expect(fix).toHaveBeenCalledTimes(2);
});
it("coalesces overlapping foreground refreshes", async () => {
  const refresh = createForegroundVenueRefresh();
  let finish!: () => void;
  const fix = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
  const read = vi.fn(async () => {});
  const pending = refresh(fix, read);
  await refresh(fix, read);
  finish();
  await pending;
  expect(fix).toHaveBeenCalledTimes(1);
  expect(read).toHaveBeenCalledTimes(1);
});
it("recovers after a failed refresh without immediate retry storms", async () => {
  let now = 0;
  const refresh = createForegroundVenueRefresh(() => now);
  await expect(refresh(async () => { throw new Error("GPS"); }, async () => {})).rejects.toThrow("GPS");
  now = 90000;
  const read = vi.fn(async () => {});
  await refresh(async () => {}, read);
  expect(read).toHaveBeenCalledOnce();
});
it("asks for confirmation when several places match", () => {
  expect(resolveRuntimeVenueSummary(INITIAL_VENUE_SUMMARY, { currentVenueId: "new", currentVenueName: "Cafe", nearbyVenues: [{}, {}] as any, selectedVenueId: null }).pulseCopy).toContain("Confirm yours");
});
it("clears a venue whose runtime name is missing", () => {
  expect(resolveRuntimeVenueSummary(INITIAL_VENUE_SUMMARY, { currentVenueId: "new", currentVenueName: null, nearbyVenues: [], selectedVenueId: null })).toBe(INITIAL_VENUE_SUMMARY);
});
