import type { RuntimeVenueCandidate } from '../../features/location/location-storage';

/** Decorative context only. Never establishes venue eligibility or presence. */
export function selectVenueBackground(venues: RuntimeVenueCandidate[], currentVenueId: string, hasLocation: boolean) {
  if (!hasLocation) return null;
  const nearby = venues.filter(venue => venue.distanceMeters !== null && Number.isFinite(venue.distanceMeters)
    && venue.distanceMeters >= 0 && venue.distanceMeters <= 250);
  return nearby.find(venue => venue.id === currentVenueId)
    ?? nearby.reduce<RuntimeVenueCandidate | null>((closest, venue) =>
      !closest || venue.distanceMeters! < closest.distanceMeters! ? venue : closest, null);
}
