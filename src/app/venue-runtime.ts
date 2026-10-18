import type { LocationRuntimeState } from "../features/location/location-storage";
import type { VenueContextSummary } from "../types/left-domain";
import { INITIAL_VENUE_SUMMARY } from "./initialState";

type VenueRuntime = Pick<LocationRuntimeState, "currentVenueId" | "currentVenueName" | "nearbyVenues" | "selectedVenueId">;

export function resolveRuntimeVenueSummary(current: VenueContextSummary, runtime: VenueRuntime): VenueContextSummary {
  if (!runtime.currentVenueId || !runtime.currentVenueName) return INITIAL_VENUE_SUMMARY;
  if (current.venueId === runtime.currentVenueId && current.venueName === runtime.currentVenueName) return current;
  return {
    ...INITIAL_VENUE_SUMMARY,
    venueId: runtime.currentVenueId,
    venueName: runtime.currentVenueName,
    pulseCopy: runtime.nearbyVenues.length > 1 && !runtime.selectedVenueId
      ? "We found multiple nearby venues. Confirm yours before going visible."
      : `You're currently at ${runtime.currentVenueName}.`,
  };
}

// Bound automatic discovery to fewer than eight requests per ten minutes.
export function createForegroundVenueRefresh(now = Date.now) {
  let lastAttempt = -Infinity;
  let running = false;
  return async (refreshLocation: () => Promise<unknown>, readRuntime: () => Promise<unknown>) => {
    if (running || now() - lastAttempt < 90_000) return;
    running = true;
    lastAttempt = now();
    try {
      await refreshLocation();
      await readRuntime();
    } finally {
      running = false;
    }
  };
}
