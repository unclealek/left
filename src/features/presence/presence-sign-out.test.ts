import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ session: vi.fn(), list: vi.fn(), rpc: vi.fn() }));
vi.mock("../../lib/supabase", () => ({ supabase: { auth: { getSession: m.session }, rpc: m.rpc, from: () => {
  const q: any = { select: () => q, eq: () => q, is: () => q, in: m.list }; return q;
} } }));
import { endOwnPresenceBeforeSignOut } from "./presence-service";
beforeEach(() => {
  vi.clearAllMocks(); m.session.mockResolvedValue({ data: { session: { user: { id: "owner" } } }, error: null });
  m.list.mockResolvedValue({ data: [{ id: "one" }, { id: "two" }], error: null }); m.rpc.mockResolvedValue({ data: true, error: null });
});
it("ends every server presence even without a UI session ID", async () => {
  expect(await endOwnPresenceBeforeSignOut()).toBe(true);
  expect(m.rpc.mock.calls.map(call => call[1].p_session_id)).toEqual(["one", "two"]);
});
it.each(["read", "write"])("fails closed on %s error", async kind => {
  if (kind === "read") m.list.mockResolvedValue({ data: null, error: {} });
  else m.rpc.mockResolvedValue({ error: {} });
  expect(await endOwnPresenceBeforeSignOut()).toBe(false);
});
it("has nothing to end without a local session", async () => {
  m.session.mockResolvedValue({ data: { session: null }, error: null });
  expect(await endOwnPresenceBeforeSignOut()).toBe(true); expect(m.rpc).not.toHaveBeenCalled();
});
