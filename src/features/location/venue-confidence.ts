import { isUuid } from "../../lib/validation";
import type { RuntimeVenueCandidate } from "./location-storage";
import type { VenueContextSummary } from "../../types/left-domain";

export type VenueConfidence = "confirmed" | "nearby_guess" | "needs_confirmation";


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
      return "HERE has a confirmed venue match for this place.";
    case "nearby_guess":
      return "HERE found a likely nearby venue, but it has not been fully confirmed yet.";
    default:
      return "HERE still needs a confirmed venue before visibility can start here.";
  }
}
