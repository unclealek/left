import type { VenueActivityEnvelope } from "../../types/left-domain";
import type { RuntimeVenueCandidate } from "../location/location-storage";

export type DiscoveryMapFilter = "all" | "places" | "people" | "active";

export function venueHasActivity(
  candidate: RuntimeVenueCandidate,
  activityById: Record<string, VenueActivityEnvelope>,
) {
  const envelope = activityById[candidate.id];
  if (!envelope) return false;

  return (
    envelope.leftPresence.visible > 0 ||
    (envelope.activity.score ?? 0) >= 35 ||
    (envelope.activity.forecastScore ?? 0) >= 35
  );
}

export function filterMapVenues(
  candidates: RuntimeVenueCandidate[],
  filter: DiscoveryMapFilter,
  activityById: Record<string, VenueActivityEnvelope>,
) {
  if (filter === "people") return [];
  if (filter !== "active") return candidates;
  return candidates.filter((candidate) => venueHasActivity(candidate, activityById));
}

export function filterShowsPeople(filter: DiscoveryMapFilter) {
  return filter === "all" || filter === "people" || filter === "active";
}
