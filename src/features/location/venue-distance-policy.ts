export const VENUE_DISCOVERY_RADIUS_METERS = 500;
export const VENUE_CONFIRMATION_MAX_DISTANCE_METERS = 120;

export function isVenueWithinConfirmationRange(input: {
  distanceMeters: number | null;
  radiusMeters: number;
}) {
  if (input.distanceMeters == null || !Number.isFinite(input.distanceMeters)) return false;
  const confirmationRadius = Math.min(
    Math.max(input.radiusMeters, 0),
    VENUE_CONFIRMATION_MAX_DISTANCE_METERS,
  );
  return input.distanceMeters <= confirmationRadius;
}
