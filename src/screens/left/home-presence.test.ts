import { describe, expect, it } from "vitest";
import { getNearbyPeopleCount } from "./home-presence";

describe("nearby people count", () => {
  it("does not count the visible viewer as another nearby person", () => {
    expect(getNearbyPeopleCount(1, true)).toBe(0);
    expect(getNearbyPeopleCount(4, true)).toBe(3);
  });

  it("keeps the full count when the viewer is hidden", () => {
    expect(getNearbyPeopleCount(2, false)).toBe(2);
  });

  it("never returns a fabricated or negative count", () => {
    expect(getNearbyPeopleCount(undefined, true)).toBe(0);
    expect(getNearbyPeopleCount(-4, false)).toBe(0);
  });
});
