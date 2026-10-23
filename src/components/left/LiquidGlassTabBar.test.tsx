import React from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
const m = vi.hoisted(() => ({
  platform: 'ios', scheme: 'light', transparency: false, motion: false,
  available: vi.fn(() => true), api: vi.fn(() => true), spring: vi.fn(),
  setValue: vi.fn(), effects: [] as Array<() => unknown>, width: 360,
}));
vi.mock('react', async actual => ({ ...await actual<typeof import('react')>(),
  useState: () => [m.width, vi.fn()], useRef: (value: unknown) => ({ current: value }),
  useEffect: (effect: () => unknown) => m.effects.push(effect),
}));
vi.mock('react-native', () => ({
  View: 'View', Text: 'Text', Pressable: 'Pressable',
  Platform: { get OS() { return m.platform; } }, I18nManager: { isRTL: false },
  useColorScheme: () => m.scheme, useWindowDimensions: () => ({ fontScale: 1 }),
  StyleSheet: { create: (value: unknown) => value, absoluteFill: {} },
  Animated: { View: 'AnimatedView', spring: m.spring, Value: class {
    setValue = m.setValue; stopAnimation = vi.fn(); interpolate = vi.fn(() => 0);
  } },
}));
vi.mock('expo-glass-effect', () => ({ GlassView: 'NativeGlass', isLiquidGlassAvailable: m.available, isGlassEffectAPIAvailable: m.api }));
vi.mock('expo-blur', () => ({ BlurView: 'SystemBlur' }));
vi.mock('expo-symbols', () => ({ SymbolView: 'SFSymbol' }));
vi.mock('../icons', () => ({ LeftIcon: 'LeftIcon' }));
vi.mock('./use-navigation-accessibility', () => ({ useNavigationAccessibility: () => ({ reduceTransparency: m.transparency, reduceMotion: m.motion }) }));
import { LiquidGlassTabBar } from './LiquidGlassTabBar';
function nodes(value: unknown): Array<React.ReactElement<any>> {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (!React.isValidElement(value)) return [];
  const element = value as React.ReactElement<any>;
  if (typeof element.type === "function") return nodes((element.type as Function)(element.props));
  const children = typeof element.props.children === 'function' ? element.props.children({ pressed: false }) : element.props.children;
  return [element, ...nodes(children)];
}
function render(activeDestination: 'home' | 'nearby' | 'session' | 'account' = 'home') {
  const navigate = vi.fn();
  return { navigate, elements: nodes(LiquidGlassTabBar({ activeDestination, onNavigate: navigate })) };
}
beforeEach(() => {
  vi.clearAllMocks(); vi.stubGlobal('React', React); m.platform = 'ios'; m.scheme = 'light';
  m.transparency = false; m.motion = false; m.effects = []; m.available.mockReturnValue(true); m.api.mockReturnValue(true);
  m.spring.mockReturnValue({ start: vi.fn(), stop: vi.fn() });
});
it.each(['home', 'nearby', 'session', 'account'] as const)('keeps %s selected and all four existing callbacks functional', selected => {
  const { navigate, elements } = render(selected);
  const tabs = elements.filter(node => node.props.accessibilityRole === 'tab');
  expect(tabs.map(tab => tab.props.accessibilityLabel)).toEqual(['Here', 'Map', 'Venues', 'Profile']);
  tabs.forEach(tab => tab.props.onPress());
  expect(navigate.mock.calls.flat()).toEqual(['home', 'nearby', 'session', 'account']);
  expect(tabs.filter(tab => tab.props.accessibilityState.selected)).toHaveLength(1);
  expect(tabs[['home', 'nearby', 'session', 'account'].indexOf(selected)].props.accessibilityState.selected).toBe(true);
});
it('uses native glass with the custom navigation icons on iOS', () => {
  const { elements } = render();
  expect(elements.filter(node => node.type === 'NativeGlass')).toHaveLength(2);
  const icons = elements.filter(node => node.type === 'LeftIcon');
  expect(icons.map(icon => icon.props.name)).toEqual(['home', 'map', 'venue', 'user']);
  expect(icons.map(icon => icon.props.active)).toEqual([true, false, false, false]);
  expect(elements.some(node => node.type === 'SystemBlur')).toBe(false);
});
it('uses system blur on an older iOS build', () => {
  m.available.mockReturnValue(false);
  const { elements } = render();
  expect(elements.some(node => node.type === 'NativeGlass')).toBe(false);
  expect(elements.some(node => node.type === 'SystemBlur')).toBe(true);
});
it('keeps Reduce Transparency fully opaque and avoids native glass probes', () => {
  m.transparency = true;
  const { elements } = render();
  expect(elements.some(node => ['NativeGlass', 'SystemBlur'].includes(node.type as string))).toBe(false);
  expect(m.available).not.toHaveBeenCalled();
});
it('uses the Android icons and avoids all iOS effects', () => {
  m.platform = 'android';
  const { elements } = render();
  expect(elements.filter(node => node.type === 'LeftIcon')).toHaveLength(4);
  expect(elements.some(node => ['NativeGlass', 'SystemBlur', 'SFSymbol'].includes(node.type as string))).toBe(false);
  expect(m.available).not.toHaveBeenCalled();
});
it('adapts both native surfaces to dark appearance', () => {
  m.scheme = 'dark';
  expect(render().elements.filter(node => node.type === 'NativeGlass').every(node => node.props.colorScheme === 'dark')).toBe(true);
});
it('disables the selection spring when Reduce Motion is enabled', () => {
  m.motion = true; render('session'); m.effects.forEach(effect => effect());
  expect(m.setValue).toHaveBeenCalledWith(2); expect(m.spring).not.toHaveBeenCalled();
});
it('uses native-driver animation for normal selection changes', () => {
  render('account'); m.effects.forEach(effect => effect());
  expect(m.spring).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ useNativeDriver: true, toValue: 3 }));
});
