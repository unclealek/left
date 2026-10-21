import { beforeEach, expect, it, vi } from 'vitest';
const m = vi.hoisted(() => ({
  platform: 'ios', values: [] as boolean[], cursor: 0, effects: [] as Array<() => (() => void) | undefined>,
  listeners: {} as Record<string, (value: boolean) => void>, remove: vi.fn(),
  transparency: vi.fn(), motion: vi.fn(),
}));
vi.mock('react', () => ({
  useState: (initial: boolean) => {
    const index = m.cursor++; m.values[index] = initial;
    return [initial, (value: boolean) => { m.values[index] = value; }];
  },
  useEffect: (effect: () => (() => void)) => { m.effects.push(effect); },
}));
vi.mock('react-native', () => ({
  Platform: { get OS() { return m.platform; } },
  AccessibilityInfo: {
    isReduceTransparencyEnabled: m.transparency, isReduceMotionEnabled: m.motion,
    addEventListener: (name: string, listener: (value: boolean) => void) => {
      m.listeners[name] = listener; return { remove: m.remove };
    },
  },
}));
import { useNavigationAccessibility, useReducedTransparency } from './use-navigation-accessibility';
function mount() {
  const cleanups = m.effects.map(effect => effect());
  return () => cleanups.forEach(cleanup => cleanup?.());
}
beforeEach(() => {
  vi.clearAllMocks(); m.values = []; m.cursor = 0; m.listeners = {}; m.effects = []; m.platform = 'ios';
  m.transparency.mockResolvedValue(false); m.motion.mockResolvedValue(false);
});
it('starts opaque and still, then reads both accessibility settings', async () => {
  expect(useNavigationAccessibility()).toEqual({ reduceTransparency: true, reduceMotion: true });
  mount(); await Promise.resolve();
  expect(m.values).toEqual([false, false]);
});
it('applies live accessibility changes without an older query overriding them', async () => {
  let transparency!: (value: boolean) => void; let motion!: (value: boolean) => void;
  m.transparency.mockImplementation(() => new Promise(resolve => { transparency = resolve; }));
  m.motion.mockImplementation(() => new Promise(resolve => { motion = resolve; }));
  useNavigationAccessibility(); mount();
  m.listeners.reduceTransparencyChanged(true); m.listeners.reduceMotionChanged(true);
  transparency(false); motion(false); await Promise.resolve();
  expect(m.values).toEqual([true, true]);
});
it('cleans up listeners and ignores a query completing after unmount', async () => {
  useNavigationAccessibility(); const cleanup = mount(); cleanup(); await Promise.resolve();
  expect(m.remove).toHaveBeenCalledTimes(2); expect(m.values).toEqual([true, true]);
});
it('keeps a safe fallback if preference queries fail', async () => {
  m.transparency.mockRejectedValue(new Error('Unavailable')); m.motion.mockRejectedValue(new Error('Unavailable'));
  useNavigationAccessibility(); mount(); await Promise.resolve(); await Promise.resolve();
  expect(m.values).toEqual([true, true]);
});
it('does not request the iOS transparency API on Android', async () => {
  m.platform = 'android'; useNavigationAccessibility(); const cleanup = mount(); await Promise.resolve(); cleanup();
  expect(m.transparency).not.toHaveBeenCalled(); expect(m.remove).toHaveBeenCalledOnce();
  expect(m.values).toEqual([true, false]);
});

it('shares transparency handling with Android blur surfaces without a motion subscription', async () => {
  m.platform = 'android'; useReducedTransparency(); mount(); await Promise.resolve();
  expect(m.transparency).toHaveBeenCalledOnce(); expect(m.motion).not.toHaveBeenCalled();
  expect(m.values).toEqual([false]);
});
it('does not subscribe to unsupported native preferences on web', () => {
  m.platform = 'web'; expect(useReducedTransparency()).toBe(false); mount();
  expect(m.transparency).not.toHaveBeenCalled(); expect(m.listeners).toEqual({});
});
