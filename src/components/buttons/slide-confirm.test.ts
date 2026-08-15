import { describe, expect, it } from "vitest";
import { hasCompletedSlide, SLIDE_CONFIRM_THRESHOLD } from "./slide-confirm";

describe("slide confirmation threshold", () => {
  it("rejects taps and partial drags", () => {
    expect(hasCompletedSlide(0, 100)).toBe(false);
    expect(hasCompletedSlide(77, 100)).toBe(false);
  });

  it("accepts a drag at or beyond the threshold", () => {
    expect(hasCompletedSlide(SLIDE_CONFIRM_THRESHOLD * 100, 100)).toBe(true);
    expect(hasCompletedSlide(100, 100)).toBe(true);
  });

  it("does not complete before the track is measured", () => {
    expect(hasCompletedSlide(0, 0)).toBe(false);
  });
});
