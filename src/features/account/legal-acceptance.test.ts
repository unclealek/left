import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ from: vi.fn(), rpc: vi.fn() }));
vi.mock("../../lib/supabase", () => ({ supabase: mocks }));
vi.mock("expo-apple-authentication", () => ({}));
import { hasAcceptedLegalVersions, recordLegalAcceptance, upsertOnboardingProfile } from "./account-service";
import type { AppUser } from "../../types/left-domain";
const versions = { terms: "t2", privacy: "p2", community: "c2" };

describe("existing legal acceptance storage", () => {
  beforeEach(() => vi.resetAllMocks());
  it("recognizes current acceptance regardless of historical row order", async () => {
    const rows = Object.entries(versions).flatMap(([document_id, document_version]) => [
      { document_id, document_version }, { document_id, document_version: "older" },
    ]);
    mocks.from.mockReturnValue({ select: () => ({ eq: async () => ({ data: rows, error: null }) }) });
    expect((await hasAcceptedLegalVersions("user", versions)).accepted).toBe(true);
    expect((await hasAcceptedLegalVersions("user", { ...versions, terms: "t3" })).accepted).toBe(false);
  });
  it("fails closed on acceptance lookup errors", async () => {
    mocks.from.mockReturnValue({ select: () => ({ eq: async () => ({ data: null, error: new Error("offline") }) }) });
    expect((await hasAcceptedLegalVersions("user", versions)).accepted).toBe(false);
  });
  it("uses the existing version-checked RPC and reports save failure", async () => {
    mocks.rpc.mockResolvedValue({ error: new Error("versions changed") });
    expect((await recordLegalAcceptance(versions)).ok).toBe(false);
    expect(mocks.rpc).toHaveBeenCalledWith("record_current_legal_acceptance", {
      expected_terms_version: "t2", expected_privacy_version: "p2", expected_community_version: "c2",
    });
  });
  it("creates the referenced profile before acceptance and marks completion only after success", async () => {
    const order: string[] = [];
    const upsert = vi.fn(async (row) => { expect(row.onboarding_completed).toBe(false); order.push("profile"); return { error: null }; });
    const update = vi.fn(() => ({ eq: async () => { order.push("complete"); return { error: null }; } }));
    mocks.from.mockReturnValue({ upsert, update });
    mocks.rpc.mockImplementation(async () => { order.push("acceptance"); return { error: null }; });
    expect((await upsertOnboardingProfile({ id: "user", onboardingCompleted: true } as AppUser, { versions })).ok).toBe(true);
    expect(order).toEqual(["profile", "acceptance", "complete"]);
  });
  it("leaves onboarding incomplete if acceptance cannot be saved", async () => {
    const update = vi.fn();
    mocks.from.mockReturnValue({ upsert: async () => ({ error: null }), update });
    mocks.rpc.mockResolvedValue({ error: new Error("offline") });
    expect((await upsertOnboardingProfile({ id: "user", onboardingCompleted: true } as AppUser, { versions })).ok).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });
});
