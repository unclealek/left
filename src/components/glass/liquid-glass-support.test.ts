import { describe, expect, it, vi } from 'vitest';
import { canUseLiquidGlass } from './liquid-glass-support';

describe('Liquid Glass compatibility', () => {
  it.each(['android', 'web'])('never probes native APIs on %s', platform => {
    const available = vi.fn(() => true);
    expect(canUseLiquidGlass(platform, false, available, available)).toBe(false);
    expect(available).not.toHaveBeenCalled();
  });
  it('uses the opaque fallback when Reduce Transparency is on', () => {
    const available = vi.fn(() => true);
    expect(canUseLiquidGlass('ios', true, available, available)).toBe(false);
    expect(available).not.toHaveBeenCalled();
  });
  it('requires both compiled and runtime availability', () => {
    expect(canUseLiquidGlass('ios', false, () => true, () => true)).toBe(true);
    expect(canUseLiquidGlass('ios', false, () => false, () => true)).toBe(false);
    expect(canUseLiquidGlass('ios', false, () => true, () => false)).toBe(false);
  });
  it('falls back safely when the development build lacks the native module', () => {
    expect(canUseLiquidGlass('ios', false, () => { throw new Error('Missing module'); }, () => true)).toBe(false);
    expect(canUseLiquidGlass('ios', false, () => true, () => { throw new Error('Unavailable API'); })).toBe(false);
  });
});
