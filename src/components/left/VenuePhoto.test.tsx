import React from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ values: [] as unknown[], cursor: 0 }));
vi.mock('react', async actual => ({ ...await actual<typeof import('react')>(), useState: (initial: unknown) => {
  const index = state.cursor++;
  if (!(index in state.values)) state.values[index] = initial;
  return [state.values[index], (value: unknown) => { state.values[index] = value; }];
} }));
vi.mock('react-native', () => ({ Image: 'Image', Text: 'Text', View: 'View', Pressable: 'Pressable', Linking: { openURL: vi.fn() },
  StyleSheet: { create: (value: unknown) => value, absoluteFillObject: {} } }));
vi.mock('../theme', () => ({ T: {} }));
vi.mock('./venue-illustrations', () => ({ getVenuePhotoFallbackSource: () => 777 }));
import { VenuePhoto } from './VenuePhoto';
function nodes(value: unknown): Array<React.ReactElement<any>> {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (!React.isValidElement(value)) return [];
  const node = value as React.ReactElement<any>;
  return [node, ...nodes(node.props.children)];
}
function render(props: Parameters<typeof VenuePhoto>[0]) { state.cursor = 0; return nodes(VenuePhoto(props)); }
beforeEach(() => { vi.stubGlobal('React', React); state.values = []; state.cursor = 0; });
it('gives a missing-photo panel the existing illustrative café image', () => {
  const elements = render({ variant: 'panel', venue: { name: 'A café', venueType: 'cafe' } });
  expect(elements.some(node => node.type === 'Image' && node.props.source === 777)).toBe(true);
  expect(elements.some(node => node.type === 'Text' && node.props.children === 'Illustrative café photo')).toBe(true);
});
it('supports a community photo URL and falls back after a failed load', () => {
  const onPhotoError = vi.fn(); const props = { uri: 'https://example.com/community.jpg', onPhotoError };
  const image = render(props).find(node => node.type === 'Image' && node.props.source.uri)!;
  image.props.onError();
  expect(onPhotoError).toHaveBeenCalledOnce();
  expect(render(props).some(node => node.type === 'Image' && node.props.source.uri)).toBe(false);
  expect(render(props).some(node => node.type === 'Image' && node.props.source === 777)).toBe(true);
});
it('prefers the real venue photo and removes the illustrative label only after loading', () => {
  const onPhotoLoad = vi.fn(); const props = { photo: { uri: 'https://example.com/actual.jpg', attributions: [] }, uri: 'https://example.com/other.jpg', onPhotoLoad };
  const image = render(props).find(node => node.type === 'Image' && node.props.source.uri)!;
  expect(image.props.source.uri).toBe(props.photo.uri);
  image.props.onLoad();
  expect(onPhotoLoad).toHaveBeenCalledOnce();
  expect(render(props).some(node => node.type === 'Text' && node.props.children === 'Illustrative café photo')).toBe(false);
});

it.each([
  ['library', 'Illustrative library photo'], ['coworking_space', 'Illustrative workspace photo'],
  ['gym', 'Illustrative gym photo'], ['airport', 'Illustrative airport photo'],
] as const)('retains the correct %s placeholder after a real photo fails', (venueType, label) => {
  const props = { venue: { name: 'A place', venueType }, uri: 'https://example.com/failed.jpg' };
  render(props).find(node => node.type === 'Image' && node.props.source.uri)!.props.onError();
  expect(render(props).some(node => node.type === 'Text' && node.props.children === label)).toBe(true);
});
it('uses the neutral interior when no place is perceived', () => {
  expect(render({}).some(node => node.type === 'Text' && node.props.children === 'Illustrative interior photo')).toBe(true);
});
