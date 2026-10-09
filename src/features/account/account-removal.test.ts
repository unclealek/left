import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ auth: vi.fn(), apple: vi.fn(), invoke: vi.fn(), single: vi.fn(), maybeSingle: vi.fn() }));
vi.mock("expo-apple-authentication", () => ({ signInAsync: m.apple }));
vi.mock("../../lib/supabase", () => ({ supabase: {
  auth: { getUser: m.auth }, functions: { invoke: m.invoke }, from: () => {
    const q: any = { insert: () => q, select: () => q, eq: () => q, in: () => q, single: m.single, maybeSingle: m.maybeSingle };
    return q;
  },
} }));
import { submitIdentityRemovalRequest } from "./account-service";
const user = { id: "owner", authProvider: "apple", firstName: "Test" } as any;
beforeEach(() => {
  vi.clearAllMocks();
  m.auth.mockResolvedValue({ data: { user: { id: "owner", identities: [{ provider: "apple" }] } }, error: null });
  m.apple.mockResolvedValue({ authorizationCode: "fresh-code" });
  m.maybeSingle.mockResolvedValue({ data: null, error: null });
  m.single.mockResolvedValue({ data: { id: "request" }, error: null });
  m.invoke.mockResolvedValue({ data: { ok: true }, error: null });
});
it("sends fresh Apple authorization to the removal endpoint", async () => {
  expect(await submitIdentityRemovalRequest(user)).toBe("processed");
  expect(m.invoke).toHaveBeenCalledWith("process-identity-removal", { body: { requestId: "request", appleAuthorizationCode: "fresh-code" } });
});
it("retries a pending request instead of permanently rejecting duplicates", async () => {
  m.maybeSingle.mockResolvedValue({ data: { id: "pending" }, error: null });
  expect(await submitIdentityRemovalRequest(user)).toBe("processed");
  expect(m.invoke.mock.calls[0][1].body.requestId).toBe("pending");
  expect(m.single).not.toHaveBeenCalled();
});
it("does not queue removal when Apple reauthorization is cancelled", async () => {
  m.apple.mockRejectedValue({ code: "ERR_REQUEST_CANCELED" });
  expect(await submitIdentityRemovalRequest(user)).toBe("cancelled");
  expect(m.invoke).not.toHaveBeenCalled();
  expect(m.single).not.toHaveBeenCalled();
});
it("rejects a stale UI account", async () => {
  m.auth.mockResolvedValue({ data: { user: { id: "different" } }, error: null });
  expect(await submitIdentityRemovalRequest(user)).toBe("failed");
  expect(m.apple).not.toHaveBeenCalled();
});
