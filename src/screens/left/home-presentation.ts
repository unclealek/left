import type { RuntimeVenueCandidate } from '../../features/location/location-storage';
import type { VenueActivityEnvelope } from '../../types/left-domain';

export function formatVenueDistance(distance: number | null | undefined) {
  if (distance == null || !Number.isFinite(distance) || distance < 0) return null;
  return distance < 1000 ? `${Math.round(distance)} m away` : `${(distance / 1000).toFixed(1)} km away`;
}
export function venueCategory(venue: RuntimeVenueCandidate) {
  switch (venue.venueType) {
    case 'cafe': return 'Café';
    case 'coworking_space': return 'Coworking space';
    case 'library': return 'Library';
    case 'university': return 'University';
    case 'airport': return 'Airport';
    case 'gym': return 'Gym';
    default: return 'Place';
  }
}
export function homeActivityLabel(envelope?: VenueActivityEnvelope) {
  const activity = envelope?.activity;
  if (!activity || activity.isStale || activity.label === 'unknown' || activity.label === 'closed') return null;
  const score = activity.liveAvailable ? activity.score : activity.forecastScore;
  if (score == null || !Number.isFinite(score)) return null;
  const label = activity.label;
  return activity.liveAvailable ? `${label[0].toUpperCase()}${label.slice(1)} now` : `Typically ${label}`;
}
