import type { FooterDestination } from '../../app/leftConfig';

export const TAB_DESTINATIONS = [
  { key: 'home', label: 'Here', icon: 'home', symbol: 'house', selectedSymbol: 'house.fill' },
  { key: 'nearby', label: 'Map', icon: 'map', symbol: 'map', selectedSymbol: 'map.fill' },
  { key: 'session', label: 'Venues', icon: 'venue', symbol: 'building.2', selectedSymbol: 'building.2.fill' },
  { key: 'account', label: 'Profile', icon: 'user', symbol: 'person.crop.circle', selectedSymbol: 'person.crop.circle.fill' },
] as const satisfies ReadonlyArray<{key: FooterDestination; label: string; icon: string; symbol: string; selectedSymbol: string}>;

export function getTabBarGeometry(width: number, fontScale: number, rtl: boolean) {
  const height = 64 + Math.ceil(Math.max(0, Math.min(fontScale, 1.5) - 1) * 24);
  const slotWidth = Math.max(0, width - 12) / TAB_DESTINATIONS.length;
  const positions = TAB_DESTINATIONS.map((_, index) => 6 + (rtl ? 3 - index : index) * slotWidth);
  return { height, slotWidth, positions };
}

/** Bar, home-indicator clearance and breathing room for the final content item. */
export function getTabBarContentInset(bottomInset: number, fontScale: number) {
  return getTabBarGeometry(0, fontScale, false).height + Math.max(bottomInset, 12) + 24;
}
