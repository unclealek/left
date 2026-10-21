import { describe, expect, it } from "vitest";
import { completePresenceEnd, getRemainingSeconds, hasExpired } from "./session-lifecycle";

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

describe('confirmed visibility transitions', () => {
  it('keeps the visible UI until the server confirms the change', async () => {
    let resolve!: (value: boolean) => void;
    let cleared = false;
    const pending = new Promise<boolean>(done => { resolve = done; });
    const transition = completePresenceEnd({ endPresence: () => pending, clearLocal: () => { cleared = true; }, expired: false });
    expect(cleared).toBe(false);
    resolve(true); await transition;
    expect(cleared).toBe(true);
  });
  it('preserves the current state on rejection or failed confirmation', async () => {
    for (const endPresence of [async () => false, async (): Promise<boolean> => { throw new Error('offline'); }]) {
      let cleared = false;
      await expect(completePresenceEnd({ endPresence, clearLocal: () => { cleared = true; }, expired: false })).rejects.toThrow();
      expect(cleared).toBe(false);
    }
  });
  it('still honors an already confirmed session expiry while offline', async () => {
    let cleared = false;
    await completePresenceEnd({ endPresence: async () => { throw new Error('offline'); }, clearLocal: () => { cleared = true; }, expired: true });
    expect(cleared).toBe(true);
  });
});
