import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const query: {
    update: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    then: (resolve: (value: { error: null }) => unknown) => Promise<unknown>;
  } = {
    update: vi.fn(),
    eq: vi.fn(),
    then: (resolve) => Promise.resolve({ error: null }).then(resolve),
  };
  query.update.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  return { query, from: vi.fn(() => query) };
});

vi.mock("../../lib/supabase", () => ({
  supabase: { from: mocks.from },
}));

import { markApproachCancelled, markApproachExpired } from "./interaction-service";

describe("approach lifecycle persistence", () => {
  beforeEach(() => {
    mocks.from.mockClear();
    mocks.query.update.mockClear();
    mocks.query.eq.mockClear();
  });

  it("persists cancellation with its timestamp and only updates a started attempt", async () => {
    const cancelledAt = "2026-08-10T20:00:00.000Z";
    const updated = await markApproachCancelled({
      approachId: "3f88f9f4-864b-4d51-8e50-42159b8bf031",
      cancelledAt,
    });

    expect(updated).toBe(true);
    expect(mocks.from).toHaveBeenCalledWith("approach_attempts");
    expect(mocks.query.update).toHaveBeenCalledWith({ status: "cancelled", cancelled_at: cancelledAt });
    expect(mocks.query.eq).toHaveBeenNthCalledWith(1, "id", "3f88f9f4-864b-4d51-8e50-42159b8bf031");
    expect(mocks.query.eq).toHaveBeenNthCalledWith(2, "status", "started");
  });

  it("persists expiry without changing the original expiry timestamp", async () => {
    const updated = await markApproachExpired({
      approachId: "b0e58b6a-70a8-480c-8eb7-154d1b47af9a",
      expiredAt: "2026-08-10T20:00:00.000Z",
    });

    expect(updated).toBe(true);
    expect(mocks.query.update).toHaveBeenCalledWith({ status: "expired" });
  });

  it("rejects non-database approach identifiers", async () => {
    const updated = await markApproachCancelled({
      approachId: "approach-1",
      cancelledAt: "2026-08-10T20:00:00.000Z",
    });

    expect(updated).toBe(false);
    expect(mocks.from).not.toHaveBeenCalled();
  });
});
