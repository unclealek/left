import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ user: vi.fn(), single: vi.fn(), rpc: vi.fn(), revoke: vi.fn(), ctx: {} as any }));
vi.mock("npm:@supabase/server", () => ({ withSupabase: (_: unknown, handler: any) => (req: Request) => handler(req, m.ctx) }));
vi.mock("npm:jose@6.2.12", () => ({ createRemoteJWKSet: vi.fn(), jwtVerify: vi.fn() }));
vi.mock("../_shared/apple-revocation.ts", () => ({ revokeAppleAuthorization: m.revoke }));
import endpoint from "./index";
const request = () => new Request("https://local/remove", { method: "POST", body: JSON.stringify({ requestId: "11111111-1111-4111-8111-111111111111", appleAuthorizationCode: "code" }) });
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("Deno", { env: { get: () => "configured" } });
  m.user.mockResolvedValue({ data: { user: { id: "owner", identities: [{ provider: "apple", id: "apple-owner" }] } }, error: null });
  m.single.mockResolvedValue({ data: { id: "request", status: "pending" }, error: null });
  m.revoke.mockResolvedValue(undefined);
  m.rpc.mockResolvedValue({ data: {}, error: null });
  const q: any = { select: () => q, eq: () => q, single: m.single };
  m.ctx = { supabase: { auth: { getUser: m.user }, from: () => q }, supabaseAdmin: { rpc: m.rpc } };
});
it("only removes the authenticated owner's data after Apple revocation succeeds", async () => {
  expect((await endpoint.fetch(request())).status).toBe(200);
  expect(m.revoke.mock.invocationCallOrder[0]).toBeLessThan(m.rpc.mock.invocationCallOrder[0]);
  expect(m.rpc.mock.calls[0][1].p_requesting_user_id).toBe("owner");
});
it("does not report removal or mutate the database on Apple revocation failure", async () => {
  m.revoke.mockRejectedValue(new Error("provider failed"));
  expect((await endpoint.fetch(request())).status).toBe(409);
  expect(m.rpc).not.toHaveBeenCalled();
});
it("rejects already-removed accounts before privileged work", async () => {
  m.user.mockResolvedValue({ data: { user: { id: "owner", app_metadata: { identity_removed: true } } }, error: null });
  expect((await endpoint.fetch(request())).status).toBe(401);
  expect(m.rpc).not.toHaveBeenCalled();
});
it("does not revoke Apple credentials for a request the caller cannot read", async () => {
  m.single.mockResolvedValue({ data: null, error: {} });
  expect((await endpoint.fetch(request())).status).toBe(404);
  expect(m.revoke).not.toHaveBeenCalled();
});
