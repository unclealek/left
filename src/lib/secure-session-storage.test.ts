import { beforeEach, expect, it, vi } from "vitest";
import { createSecureSessionStorage } from "./secure-session-storage";
function store() {
  const data = new Map<string, string>();
  return { data, getItem: vi.fn(async (k: string) => data.get(k) ?? null),
    setItem: vi.fn(async (k: string, v: string) => { data.set(k, v); }),
    removeItem: vi.fn(async (k: string) => { data.delete(k); }) };
}
let secure = store(), legacy = store(), storage: ReturnType<typeof createSecureSessionStorage>;
let generation = 0;
beforeEach(() => { secure = store(); legacy = store(); generation = 0; storage = createSecureSessionStorage(secure, legacy, () => `generation-${++generation}`); });
it("migrates legacy tokens only after a successful secure write", async () => {
  legacy.data.set("session", "private-token");
  expect(await storage.getItem("session")).toBe("private-token");
  expect(legacy.data.has("session")).toBe(false);
  expect(await storage.getItem("session")).toBe("private-token");
});
it("fails closed without deleting a legacy session if secure storage is unavailable", async () => {
  legacy.data.set("session", "private-token");
  secure.setItem.mockRejectedValue(new Error("locked"));
  await expect(storage.getItem("session")).rejects.toThrow("locked");
  expect(legacy.data.get("session")).toBe("private-token");
});
it("supports large Unicode sessions without oversized Keychain items", async () => {
  const value = JSON.stringify({ token: "🔐".repeat(3000) });
  await storage.setItem("session", value);
  expect(await storage.getItem("session")).toBe(value);
  expect([...secure.data.values()].every(part => new TextEncoder().encode(part).length < 2048)).toBe(true);
  expect(legacy.data.size).toBe(0);
});
it("removes all secure chunks and legacy data on logout", async () => {
  await storage.setItem("session", "x".repeat(6000));
  legacy.data.set("session", "old");
  await storage.removeItem("session");
  expect(secure.data.size).toBe(0);
  expect(legacy.data.size).toBe(0);
  expect(await storage.getItem("session")).toBeNull();
});
it("keeps the previous session intact after a partial write fails", async () => {
  await storage.setItem("session", "old-token");
  secure.setItem.mockRejectedValueOnce(new Error("storage failed"));
  await expect(storage.setItem("session", "new-token")).rejects.toThrow();
  expect(await storage.getItem("session")).toBe("old-token");
});
it("serializes concurrent refresh and logout", async () => {
  await Promise.all([storage.setItem("session", "new-token"), storage.removeItem("session")]);
  expect(await storage.getItem("session")).toBeNull();
});
