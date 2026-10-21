import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ collect: vi.fn(), share: vi.fn(), available: vi.fn(), create: vi.fn(), write: vi.fn(), remove: vi.fn() }));
vi.mock("react-native", () => ({ Platform: { OS: "ios" } }));
vi.mock("./settings-service", () => ({ collectAccountData: m.collect }));
vi.mock("expo-sharing", () => ({ shareAsync: m.share, isAvailableAsync: m.available }));
vi.mock("expo-file-system", () => ({ Paths: { cache: "cache" }, File: class { uri = "cache/export.json"; exists = true; create = m.create; write = m.write; delete = m.remove; } }));
import { downloadAccountData } from "./data-download";
beforeEach(() => { vi.clearAllMocks(); m.collect.mockResolvedValue({ own: true }); m.available.mockResolvedValue(true); m.share.mockResolvedValue(undefined); });
it("writes only the completed export and removes the temporary copy after sharing", async () => {
  await downloadAccountData();
  expect(JSON.parse(m.write.mock.calls[0][0])).toEqual({ own: true });
  expect(m.share).toHaveBeenCalledWith("cache/export.json", { mimeType: "application/json", UTI: "public.json" });
  expect(m.remove).toHaveBeenCalledTimes(1);
});
it("removes the temporary file if the share sheet fails", async () => {
  m.share.mockRejectedValue(new Error("failed"));
  await expect(downloadAccountData()).rejects.toThrow();
  expect(m.remove).toHaveBeenCalled();
});
it("does not write or share a partial export", async () => {
  m.collect.mockRejectedValue(new Error("offline"));
  await expect(downloadAccountData()).rejects.toThrow();
  expect(m.write).not.toHaveBeenCalled(); expect(m.share).not.toHaveBeenCalled();
});
it("reports unsupported sharing before creating personal-data files", async () => {
  m.available.mockResolvedValue(false);
  await expect(downloadAccountData()).rejects.toThrow("unavailable");
  expect(m.create).not.toHaveBeenCalled();
});
