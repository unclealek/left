import { t } from "../../features/preferences/translation-runtime";
import type { RuntimeVenueCandidate } from '../../features/location/location-storage';
export type VenuePhotoContext = Pick<RuntimeVenueCandidate, 'name' | 'venueType'>;
export type VenuePhotoKind = 'hospitality' | 'cafe' | 'bar' | 'restaurant' | 'library' | 'coworking' | 'park' | 'gym' | 'airport';

/** Presentation only: this never confirms location, presence or venue eligibility. */
export function resolveVenuePhotoKind(venue?: VenuePhotoContext | null): VenuePhotoKind {
  if (!venue) return 'hospitality';
  switch (venue.venueType) {
    case 'cafe': return 'cafe';
    case 'library': case 'university': return 'library';
    case 'coworking_space': return 'coworking';
    case 'airport': return 'airport';
    case 'gym': return 'gym';
  }
  const name = venue.name.toLocaleLowerCase();
  if (/\b(?:gastropub|pub|bar|brewery|cocktail)\b/u.test(name)) return 'bar';
  if (/\b(?:café|cafe|coffee)(?=\W|$)/u.test(name)) return 'cafe';
  if (/\b(?:restaurant|bistro|grill|pizzeria|sushi|brasserie)\b/u.test(name)) return 'restaurant';
  if (/\b(?:library|kirjasto|bibliotek)\b/u.test(name)) return 'library';
  if (/\b(?:coworking|workspace)\b/u.test(name)) return 'coworking';
  if (/\b(?:park|garden|botanical)\b/u.test(name)) return 'park';
  if (/\b(?:gym|fitness)\b/u.test(name)) return 'gym';
  if (/\b(?:airport)\b/u.test(name)) return 'airport';
  return 'hospitality';
}
const descriptions: Record<VenuePhotoKind, string> = {
  hospitality: 'interior', cafe: 'café', bar: 'bar', restaurant: 'restaurant', library: 'library',
  coworking: 'workspace', park: 'park', gym: 'gym', airport: 'airport',
};
export function getVenuePhotoFallbackLabel(kind: VenuePhotoKind) {
  return t(`Illustrative ${descriptions[kind]} photo`);
}
