import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ rpc: vi.fn(), getUser: vi.fn() }));
vi.mock("../../lib/supabase", () => ({ supabase: { rpc: m.rpc, auth: { getUser: m.getUser } } }));
import { collectAccountData, EXPORT_CATEGORIES } from "./settings-service";
const id = "11111111-1111-4111-8111-111111111111";
beforeEach(() => {
  vi.clearAllMocks();
  m.getUser.mockResolvedValue({ data: { user: { id, email: "test@example.com" } } });
  m.rpc.mockResolvedValue({ data: [], error: null });

});
it("exports every category, paginates and never requests someone else's ID", async () => {
  m.rpc.mockResolvedValueOnce({ data: Array(500).fill({ own: true }) }).mockResolvedValueOnce({ data: [{ final: true }] });
  const result = await collectAccountData();
  expect(result.records.profile).toHaveLength(501);
  expect(Object.keys(result.records)).toEqual([...EXPORT_CATEGORIES]);
  expect(m.rpc.mock.calls[1][1]).toEqual({ p_category: "profile", p_offset: 500 });
  expect(JSON.stringify(result)).not.toContain("access_token");
});
it("rejects incomplete exports and account changes", async () => {
  m.rpc.mockResolvedValueOnce({ error: new Error("offline") });
  await expect(collectAccountData()).rejects.toThrow("complete");
  m.getUser.mockResolvedValueOnce({ data: { user: { id } } }).mockResolvedValueOnce({ data: { user: { id: "other" } } });
  await expect(collectAccountData()).rejects.toThrow("changed");
});
it("denies signed-out and anonymous exports", async () => {
  m.getUser.mockResolvedValue({ data: { user: null } });
  await expect(collectAccountData()).rejects.toThrow("Sign in");
  m.getUser.mockResolvedValue({ data: { user: { id, is_anonymous: true } } });
  await expect(collectAccountData()).rejects.toThrow("Sign in");
});
