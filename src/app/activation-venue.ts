import type { LocationRuntimeState } from "../features/location/location-storage";
import { isVenueWithinConfirmationRange } from "../features/location/venue-distance-policy";
import { isUuid } from "../lib/validation";

export function resolveActivationVenue(runtime: LocationRuntimeState) {
  const fix = runtime.lastKnownCoords;
  if (!fix || fix.accuracy == null || !Number.isFinite(fix.accuracy) || fix.accuracy < 0 || fix.accuracy > 100) return null;
  const venueId = runtime.selectedVenueId ?? runtime.currentVenueId;
  return runtime.nearbyVenues.find(venue => venue.id === venueId && isUuid(venue.id) && isVenueWithinConfirmationRange(venue)) ?? null;
}
