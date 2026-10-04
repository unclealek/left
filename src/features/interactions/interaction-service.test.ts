import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  return { rpc: vi.fn(async () => ({ data: true, error: null })) };
});

vi.mock("../../lib/supabase", () => ({
  supabase: { rpc: mocks.rpc },
}));

import { markApproachCancelled, markApproachExpired } from "./interaction-service";

describe("approach lifecycle persistence", () => {
  beforeEach(() => {
    mocks.rpc.mockClear();
  });

  it("finishes cancellation through the validated server action", async () => {
    const cancelledAt = "2026-08-10T20:00:00.000Z";
    const updated = await markApproachCancelled({
      approachId: "3f88f9f4-864b-4d51-8e50-42159b8bf031",
      cancelledAt,
    });

    expect(updated).toBe(true);
    expect(mocks.rpc).toHaveBeenCalledWith("finish_approach_attempt", {
      p_approach_id: "3f88f9f4-864b-4d51-8e50-42159b8bf031",
      p_status: "cancelled",
    });
  });

  it("finishes expiry through the validated server action", async () => {
    const updated = await markApproachExpired({
      approachId: "b0e58b6a-70a8-480c-8eb7-154d1b47af9a",
      expiredAt: "2026-08-10T20:00:00.000Z",
    });

    expect(updated).toBe(true);
    expect(mocks.rpc).toHaveBeenCalledWith("finish_approach_attempt", {
      p_approach_id: "b0e58b6a-70a8-480c-8eb7-154d1b47af9a",
      p_status: "expired",
    });
  });

  it("rejects non-database approach identifiers", async () => {
    const updated = await markApproachCancelled({
      approachId: "approach-1",
      cancelledAt: "2026-08-10T20:00:00.000Z",
    });

    expect(updated).toBe(false);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
