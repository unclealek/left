import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("../../lib/supabase", () => ({ supabase: { rpc: mocks.rpc } }));
import { submitExperienceProposal } from "./discovery-service";
const draft = {
  hostUserId: "untrusted-client-identity",
  venueId: "3f88f9f4-864b-4d51-8e50-42159b8bf031",
  title: " Coffee and conversation ", description: "A small gathering to share ideas and meet other locals.",
  startsAt: "2099-09-06T15:00:00Z", capacity: 6, accessibilityNotes: "", costNotes: "",
};
beforeEach(() => mocks.rpc.mockReset());
describe("event hosting", () => {
  it("lets the server derive host identity and requires confirmation", async () => {
    mocks.rpc.mockResolvedValue({ data: "event-id", error: null });
    expect(await submitExperienceProposal(draft)).toBe("event-id");
    const params = mocks.rpc.mock.calls[0][1];
    expect(JSON.stringify(params)).not.toContain(draft.hostUserId);
    expect(params.p_title).toBe("Coffee and conversation");
  });
  it("rejects expired schedule choices without a network request", async () => {
    await expect(submitExperienceProposal({ ...draft, startsAt: "2000-01-01" })).rejects.toThrow("future start");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("explains incomplete profile eligibility", async () => {
    mocks.rpc.mockResolvedValue({ error: { message: "complete your profile before hosting" } });
    await expect(submitExperienceProposal(draft)).rejects.toThrow("Complete your profile");
  });
  it("explains session permissions without exposing backend details", async () => {
    mocks.rpc.mockResolvedValue({ error: { code: "42501", message: "internal policy detail" } });
    await expect(submitExperienceProposal(draft)).rejects.toThrow("Sign in again");
  });
  it("does not report success without a confirmed event id", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: null });
    await expect(submitExperienceProposal(draft)).rejects.toThrow("did not confirm");
  });
});
