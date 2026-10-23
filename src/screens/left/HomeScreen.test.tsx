vi.mock("../../features/preferences/use-distance", () => ({ useDistanceFormatter: () => (distance: number | null) => distance == null ? null : `${Math.round(distance)} m away` }));
import React from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ values: [] as unknown[], cursor: 0 }));
vi.mock('react', async actual => ({ ...await actual<typeof import('react')>(),
  useState: (initial: unknown) => {
    const index = state.cursor++;
    if (!(index in state.values)) state.values[index] = initial;
    return [state.values[index], (value: unknown) => { state.values[index] = typeof value === 'function' ? (value as Function)(state.values[index]) : value; }];
  }, useRef: (value: unknown) => ({ current: value }), useEffect: vi.fn(),
}));
vi.mock('react-native', () => ({ View: 'View', Text: 'Text', Pressable: 'Pressable', Image: 'Image', ActivityIndicator: 'Spinner', StyleSheet: { create: (value: unknown) => value, absoluteFillObject: {} },
  useWindowDimensions: () => ({ fontScale: 1 }), Linking: { openURL: vi.fn() }, FlatList: (props: any) => <>{props.data.map((item: unknown) => props.renderItem({ item }))}</> }));
vi.mock('expo-status-bar', () => ({ StatusBar: 'StatusBar' }));
vi.mock('expo-linear-gradient', () => ({ LinearGradient: 'Gradient' }));
vi.mock('../../components/theme', () => ({ T: {} }));
vi.mock('../../app/leftTheme', () => ({ styles: {} }));
vi.mock('../../components/left/venue-illustrations', () => ({ getVenuePhotoFallbackSource: () => 777 }));
vi.mock('../../components/icons', () => ({ LeftIcon: 'Icon' }));
vi.mock('../../components/buttons', () => ({ PrimaryButton: 'PrimaryButton', GhostButton: 'GhostButton' }));
vi.mock('../../components/left/LeftLogoMark', () => ({ LeftLogoMark: 'Logo' }));
vi.mock('../../features/venues/venue-details-service', () => ({ fetchVenuePracticalDetails: vi.fn() }));
import { HomeScreen } from './HomeScreen';
import type { RuntimeVenueCandidate } from '../../features/location/location-storage';
import type { NearbyFeedItem, VenueContextSummary } from '../../types/left-domain';
function nodes(value: unknown): Array<React.ReactElement<any>> {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (!React.isValidElement(value)) return [];
  const node = value as React.ReactElement<any>;
  if (typeof node.type === 'function') return nodes((node.type as Function)(node.props));
  return [node, ...nodes(node.props.children)];
}
const current = { id: '12345678-1234-4234-8234-123456789abc', name: 'Actual venue', venueType: 'cafe', distanceMeters: 103 } as RuntimeVenueCandidate;
function render(overrides: Partial<Parameters<typeof HomeScreen>[0]> = {}) {
  const callbacks = { onBecomeVisible: vi.fn(), onGoPrivate: vi.fn(), onOpenPeople: vi.fn(), onOpenAllVenues: vi.fn(),
    onOpenVenueDetail: vi.fn(), onOpenExperience: vi.fn(), onCreateExperience: vi.fn(), onOpenSafety: vi.fn() };
  const props = { ...callbacks, venue: { venueId: current.id, venueName: current.name } as VenueContextSummary,
    nearbyVenues: [current, { ...current, id: 'nearby', name: 'Other venue' }], venueActivityById: {}, experiences: [],
    feed: [{ firstName: 'SECRET NAME', hintText: 'SECRET HINT', avatarStyle: 'geometric' } as NearbyFeedItem],
    sessionVisible: false, venueHidden: false, ...overrides };
  state.cursor = 0;
  const elements = nodes(HomeScreen(props));
  const text = elements.filter(e => e.type === 'Text').map(e => e.props.children).flat().join(' ');
  return { callbacks, elements, text, rerender: () => { state.cursor = 0; return nodes(HomeScreen(props)); }, primary: elements.find(e => e.type === 'PrimaryButton' || e.type === 'GhostButton')! };
}
beforeEach(() => { state.values = []; state.cursor = 0; vi.stubGlobal('React', React); });
it('keeps one visibility action and permits private hosting without activating presence', () => {
  const screen = render();
  expect(screen.primary.props.label).toBe('Go visible');
  expect(screen.elements.filter(e => e.type === 'PrimaryButton')).toHaveLength(1);
  expect(screen.text).toContain("Profiles are hidden while you're private");
  screen.elements.find(e => e.props.accessibilityLabel === 'Host something small')!.props.onPress();
  expect(screen.callbacks.onCreateExperience).toHaveBeenCalledOnce();
  expect(screen.callbacks.onBecomeVisible).not.toHaveBeenCalled();
});
it('shows no names, avatars, hints or small-group counts when visible; See all uses existing discovery', () => {
  const screen = render({ sessionVisible: true });
  expect(screen.primary.props.label).toBe('Go private');
  expect(screen.text).not.toContain('SECRET');
  expect(screen.text).toContain('You stay anonymous');
  expect(screen.text).toContain('Networking');
  expect(screen.text).toContain('Group discussion');
  screen.primary.props.onPress();
  expect(screen.callbacks.onGoPrivate).toHaveBeenCalledOnce();
  screen.elements.find(e => e.props.accessibilityLabel === 'See all people here')!.props.onPress();
  expect(screen.callbacks.onOpenPeople).toHaveBeenCalledOnce();
});
it('keeps hidden venues private and disables visibility until a current venue is confirmed', () => {
  const screen = render({ sessionVisible: true, venueHidden: true, venue: { venueId: '', venueName: '' } as VenueContextSummary });
  expect(screen.primary.props.label).toBe('Go visible');
  expect(screen.primary.props.disabled).toBe(true);
  expect(screen.text).toContain('Here you are');
  expect(screen.text).not.toContain('You are HERE');
});
it('keeps loading/errors reviewable and forwards real venue navigation', () => {
  const screen = render({ visibilityPending: true, visibilityError: 'Please retry' });
  expect(screen.primary.props.loading).toBe(true);
  expect(screen.text).toContain('Please retry');
  screen.elements.find(e => e.props.accessibilityLabel === 'View Other venue')!.props.onPress();
  expect(screen.callbacks.onOpenVenueDetail).toHaveBeenCalledWith(expect.objectContaining({ id: 'nearby' }));
  expect(screen.text).toContain('103 m away');
  expect(screen.text).not.toContain('min walk');
});

it('shows a bundled real café photo without inventing a current venue', () => {
  const screen = render({ nearbyVenues: [], venue: { venueId: '', venueName: '' } as VenueContextSummary });
  expect(screen.elements.some(e => e.type === 'Image' && e.props.source === 777)).toBe(true);
  expect(screen.text).not.toContain('Illustrative interior photo');
  expect(screen.text).not.toContain('You are HERE');
  expect(screen.primary.props.disabled).toBe(true);
});
it('keeps actual venue photos while private, and falls back when a remote image fails', () => {
  const actual = { ...current, photo: { uri: 'https://example.com/venue.jpg', attributions: [] } };
  const screen = render({ nearbyVenues: [actual] });
  const image = screen.elements.find(e => e.type === 'Image' && e.props.source?.uri === actual.photo.uri)!;
  expect(image).toBeDefined();
  image.props.onLoad();
  const loaded = screen.rerender();
  expect(loaded.some(e => e.type === 'Text' && e.props.children === 'Illustrative café photo')).toBe(false);
  loaded.find(e => e.type === 'Image' && e.props.source?.uri === actual.photo.uri)!.props.onError();
  const failed = screen.rerender();
  expect(failed.some(e => e.type === 'Image' && e.props.source === 777)).toBe(true);
  expect(failed.some(e => e.type === 'Image' && e.props.source?.uri === actual.photo.uri)).toBe(false);
  expect(failed.some(e => e.type === 'Text' && e.props.children === 'Illustrative café photo')).toBe(false);
});

it('simplifies the unconfirmed venue state and keeps visibility and people discovery gated', () => {
  const screen = render({ nearbyVenues: [], venue: { venueId: '', venueName: '' } as VenueContextSummary });
  expect(screen.text).toContain('Private right now');
  expect(screen.text).toContain('Confirm your venue to become visible and discover people nearby.');
  expect(screen.text).not.toContain("You're private at this venue");
  expect(screen.primary.props.disabled).toBe(true);
  expect(screen.elements.some(e => e.props.accessibilityLabel === 'Host something small')).toBe(true);
});
it('uses the actual confirmed venue data and keeps the nearby carousel available', () => {
  const screen = render();
  expect(screen.text).toContain('You are HERE');
  expect(screen.text).toContain('Actual venue');
  expect(screen.text).toContain('Café');
  expect(screen.text).toContain('103 m away');
  expect(screen.primary.props.disabled).toBe(false);
  expect(screen.elements.some(e => e.props.accessibilityLabel === 'View Other venue')).toBe(true);
});
it('guest Home sends visibility to sign-in instead of enabling member presence', () => {
  const screen = render({ guest: true, nearbyVenues: [], venue: { venueId: '', venueName: '' } as VenueContextSummary });
  expect(screen.primary.props.label).toBe('Sign in to go visible');
  expect(screen.primary.props.disabled).toBe(false);
  screen.primary.props.onPress();
  expect(screen.callbacks.onBecomeVisible).toHaveBeenCalledOnce();
  expect(screen.text).toContain('Guest preview');
  expect(screen.text).not.toContain('You are HERE');
});
