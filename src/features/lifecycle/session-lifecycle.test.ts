import { describe, expect, it } from "vitest";
import { getRemainingSeconds, hasExpired } from "./session-lifecycle";

describe("session lifecycle", () => {
  const now = Date.parse("2026-08-10T20:00:00.000Z");

  it("rounds a partially elapsed second up for countdown display", () => {
    expect(getRemainingSeconds("2026-08-10T20:00:01.250Z", now)).toBe(2);
  });

  it("never returns a negative countdown", () => {
    expect(getRemainingSeconds("2026-08-10T19:59:00.000Z", now)).toBe(0);
  });

  it("treats the exact expiry instant as expired", () => {
    expect(hasExpired("2026-08-10T20:00:00.000Z", now)).toBe(true);
  });

  it("does not expire a missing timestamp", () => {
    expect(hasExpired(null, now)).toBe(false);
  });

  it("fails closed for malformed expiry values", () => {
    expect(getRemainingSeconds("not-a-date", now)).toBe(0);
    expect(hasExpired("not-a-date", now)).toBe(true);
  });
});
