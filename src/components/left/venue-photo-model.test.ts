import { expect, it } from 'vitest';
import { resolveVenuePhotoKind, getVenuePhotoFallbackLabel } from './venue-photo-model';
it.each([
 ['cafe', 'cafe'], ['library', 'library'], ['university', 'library'],
 ['coworking_space', 'coworking'], ['gym', 'gym'], ['airport', 'airport'],
] as const)('uses typed %s metadata for the %s fallback', (venueType, expected) => {
 expect(resolveVenuePhotoKind({ name: 'A place', venueType })).toBe(expected);
});
it.each([
 ['Woolshed Helsinki - Australian Gastropub', 'bar'], ['A neighbourhood bistro', 'restaurant'],
 ['Central Park', 'park'], ['Coffee House', 'cafe'], ['Café Central', 'cafe'],
 ['A shared workspace', 'coworking'], ['Community Library', 'library'], ['City Fitness', 'gym'],
] as const)('recognizes a clear category in %s', (name, expected) => {
 expect(resolveVenuePhotoKind({ name, venueType: 'other' })).toBe(expected);
});
it('does not guess a category for missing or ambiguous venue context', () => {
 expect(resolveVenuePhotoKind(null)).toBe('hospitality');
 expect(resolveVenuePhotoKind({ name: 'Starbucks', venueType: 'other' })).toBe('hospitality');
 expect(resolveVenuePhotoKind({ name: 'Parkinson House', venueType: 'other' })).toBe('hospitality');
 expect(resolveVenuePhotoKind({ name: 'Garden Café', venueType: 'cafe' })).toBe('cafe');
 expect(getVenuePhotoFallbackLabel('hospitality')).toBe('Illustrative interior photo');
 expect(getVenuePhotoFallbackLabel('library')).toBe('Illustrative library photo');
});

it('localizes illustrative-photo labels without changing venue classification', async () => {
 const { setTranslationLanguage } = await import('../../features/preferences/translation-runtime');
 try {
  setTranslationLanguage('fi');
  expect(getVenuePhotoFallbackLabel('library')).toBe('Havainnekuva kirjastosta');
  setTranslationLanguage('sv');
  expect(getVenuePhotoFallbackLabel('hospitality')).toBe('Illustrativ interiörbild');
 } finally { setTranslationLanguage('en'); }
});
