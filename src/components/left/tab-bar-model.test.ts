import { describe, expect, it } from 'vitest';
import { TAB_DESTINATIONS, getTabBarGeometry, getTabBarContentInset } from './tab-bar-model';

describe('floating tab bar layout', () => {
  it('retains the four existing destinations in order', () => {
    expect(TAB_DESTINATIONS.map(item => [item.key, item.label])).toEqual([
      ['home', 'Here'], ['nearby', 'Map'], ['session', 'Venues'], ['account', 'Profile'],
    ]);
  });
  it.each([272, 320, 393, 430])('keeps all four touch targets and the indicator inside a %s point bar', width => {
    const result = getTabBarGeometry(width, 1, false);
    expect(result.slotWidth).toBeGreaterThanOrEqual(44);
    expect(result.height).toBe(64);
    expect(result.positions[0]).toBe(6);
    expect(result.positions[3] + result.slotWidth).toBe(width - 6);
  });
  it('mirrors the glass indicator along with the row in RTL', () => {
    const ltr = getTabBarGeometry(360, 1, false);
    const rtl = getTabBarGeometry(360, 1, true);
    expect(rtl.positions).toEqual([...ltr.positions].reverse());
  });
  it('reserves space for large text and the home indicator', () => {
    expect(getTabBarGeometry(360, 2, false).height).toBeGreaterThan(64);
    expect(getTabBarContentInset(34, 2)).toBeGreaterThan(getTabBarContentInset(0, 1));
    expect(getTabBarContentInset(34, 2)).toBeGreaterThan(getTabBarGeometry(360, 2, false).height + 34);
  });
  it('handles the initial unmeasured layout without negative widths', () => {
    expect(getTabBarGeometry(0, 1, false).slotWidth).toBe(0);
  });
});
