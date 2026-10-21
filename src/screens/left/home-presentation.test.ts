import { expect, it } from 'vitest';
import { formatVenueDistance, homeActivityLabel } from './home-presentation';
import type { VenueActivityEnvelope } from '../../types/left-domain';
it('shows distances without inventing walking routes', () => {
  expect(formatVenueDistance(103)).toBe('103 m away');
  expect(formatVenueDistance(1550)).toBe('1.6 km away');
  expect(formatVenueDistance(null)).toBeNull();
  expect(formatVenueDistance(-1)).toBeNull();
  expect(formatVenueDistance(NaN)).toBeNull();
});
it('distinguishes typical popularity from live signals and suppresses stale data', () => {
  const envelope = { activity: { score: 80, forecastScore: 80, label: 'busy', liveAvailable: false, isStale: false } } as VenueActivityEnvelope;
  expect(homeActivityLabel(envelope)).toBe('Typically busy');
  expect(homeActivityLabel({ ...envelope, activity: { ...envelope.activity, liveAvailable: true } })).toBe('Busy now');
  expect(homeActivityLabel({ ...envelope, activity: { ...envelope.activity, isStale: true } })).toBeNull();
  expect(homeActivityLabel({ ...envelope, activity: { ...envelope.activity, score: null, forecastScore: null } })).toBeNull();
  expect(homeActivityLabel(undefined)).toBeNull();
});
