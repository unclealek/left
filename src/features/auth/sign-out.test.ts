import { describe, expect, it, vi } from "vitest";
import { signOutSafely } from "./sign-out";

describe("signOutSafely", () => {
  it("confirms presence before revoking credentials and clearing local state", async () => {
    const order: string[] = [];
    await signOutSafely({
      endPresence: async () => { order.push("presence"); return true; },
      signOut: async () => { order.push("auth"); return { error: null }; },
      clearLocal: async () => { order.push("local"); },
    });
    expect(order).toEqual(["presence", "auth", "local"]);
  });

  it("keeps credentials and local state for retry when visibility cannot end", async () => {
    const signOut = vi.fn();
    const clearLocal = vi.fn();
    await expect(signOutSafely({ endPresence: async () => false, signOut, clearLocal }))
      .rejects.toThrow("visibility");
    expect(signOut).not.toHaveBeenCalled();
    expect(clearLocal).not.toHaveBeenCalled();
  });

  it("does not claim logout succeeded when auth sign-out fails", async () => {
    const clearLocal = vi.fn();
    await expect(signOutSafely({
      endPresence: async () => true,
      signOut: async () => ({ error: new Error("offline") }), clearLocal,
    })).rejects.toThrow("offline");
    expect(clearLocal).not.toHaveBeenCalled();
  });
});
