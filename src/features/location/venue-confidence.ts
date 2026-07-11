import type { RuntimeVenueCandidate } from "./location-storage";
import type { VenueContextSummary } from "../../types/left-domain";

export type VenueConfidence = "confirmed" | "nearby_guess" | "needs_confirmation";

export function isUuid(value: string | null | undefined) {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function resolveVenueConfidence(
  venue: VenueContextSummary,
  nearbyVenues: RuntimeVenueCandidate[],
): VenueConfidence {
  if (isUuid(venue.venueId)) return "confirmed";
  if (nearbyVenues.some((candidate) => isUuid(candidate.id))) return "nearby_guess";
  return "needs_confirmation";
}

export function getVenueConfidenceLabel(confidence: VenueConfidence) {
  switch (confidence) {
    case "confirmed":
      return "Confirmed venue";
    case "nearby_guess":
      return "Nearby match";
    default:
      return "Needs confirmation";
  }
}

export function getVenueConfidenceCopy(confidence: VenueConfidence) {
  switch (confidence) {
    case "confirmed":
      return "Left has a confirmed venue match for this place.";
    case "nearby_guess":
      return "Left found a likely nearby venue, but it has not been fully confirmed yet.";
    default:
      return "Left still needs a confirmed venue before visibility can start here.";
  }
}
