import React from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
const m = vi.hoisted(() => ({ platform: 'ios', available: vi.fn(() => true), api: vi.fn(() => true) }));
vi.mock('react-native', () => ({
  Platform: { get OS() { return m.platform; } }, View: 'View', StyleSheet: { create: (value: unknown) => value, absoluteFill: {}, flatten: (value: any) => Object.assign({}, ...(Array.isArray(value) ? value : [value])) },
}));
vi.mock('expo-glass-effect', () => ({ GlassView: 'GlassView', isLiquidGlassAvailable: m.available, isGlassEffectAPIAvailable: m.api }));
vi.mock('expo-blur', () => ({ BlurView: 'BlurView' }));
vi.mock('../theme', () => ({ T: { glassLight: 'tint', surfaceCard: 'white', glassLightMedium: 'scrim', borderBlackSoft: 'border' } }));
vi.mock('../left/use-navigation-accessibility', () => ({ useNavigationAccessibility: () => ({ reduceTransparency: false, reduceMotion: false }), useReducedTransparency: () => false }));
import { GlassMaterial, LeftGlass } from './LeftGlass';
const props = { reduceTransparency: false, fallbackColor: 'ivory', colorScheme: 'light' as const, children: 'Content' };
beforeEach(() => { vi.stubGlobal('React', React); vi.clearAllMocks(); m.platform = 'ios'; m.available.mockReturnValue(true); m.api.mockReturnValue(true); });
it('shares genuine native glass without forcing a dark appearance or adding a scrim', () => {
  const tree = GlassMaterial({ ...props, glassEffectStyle: 'clear', tintColor: 'moss' }) as React.ReactElement<any>;
  expect(tree.type).toBe('GlassView'); expect(tree.props.colorScheme).toBe('light');
  expect(tree.props.tintColor).toBe('moss'); expect(tree.props.children).toBe('Content');
});
it('keeps Reduce Transparency opaque without querying native glass APIs', () => {
  const tree = GlassMaterial({ ...props, reduceTransparency: true, blurFallback: true }) as React.ReactElement<any>;
  expect(tree.type).toBe('View'); expect(m.available).not.toHaveBeenCalled();
});
it('allows the existing navigation system-blur fallback on older iOS', () => {
  m.available.mockReturnValue(false);
  const tree = GlassMaterial({ ...props, colorScheme: 'dark', blurFallback: true }) as React.ReactElement<any>;
  expect(tree.type).toBe('BlurView'); expect(tree.props.tint).toBe('systemMaterialDark');
});
it('keeps the existing card fallback solid unless blur is explicitly requested', () => {
  m.available.mockReturnValue(false);
  expect(GlassMaterial(props).type).toBe('View');
});
it.each(['android', 'web'])('avoids iOS effects on %s', platform => {
  m.platform = platform;
  expect(GlassMaterial({ ...props, blurFallback: true }).type).toBe('View');
  expect(m.available).not.toHaveBeenCalled();
});

it('preserves existing card tint, rounded scrim and content through the shared material', () => {
  const card = LeftGlass({ children: 'Card content', radius: 22, isInteractive: true }) as React.ReactElement<any>;
  expect(card.type).toBe(GlassMaterial);
  expect(card.props).toMatchObject({ colorScheme: 'light', glassEffectStyle: 'clear', scrimColor: 'scrim', fallbackColor: 'white', isInteractive: true });
  const surface = GlassMaterial(card.props) as React.ReactElement<any>;
  const overlay = surface.props.children.props.children[0] as React.ReactElement<any>;
  expect(overlay.props.style[1]).toMatchObject({ borderRadius: 22, backgroundColor: 'scrim' });
});
it('uses the light system material for the older-iOS light appearance', () => {
  m.available.mockReturnValue(false);
  expect(GlassMaterial({ ...props, blurFallback: true }).props.tint).toBe('systemMaterialLight');
});
