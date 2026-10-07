import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";

const mocks = vi.hoisted(() => ({
  signInAsync: vi.fn(),
  signInWithIdToken: vi.fn(),
  randomUUID: vi.fn(() => "test-apple-nonce"),
}));

vi.mock("expo-apple-authentication", () => ({
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
  signInAsync: mocks.signInAsync,
}));

vi.mock("expo-crypto", () => ({
  randomUUID: mocks.randomUUID,
  CryptoDigestAlgorithm: { SHA256: "SHA-256" },
  digestStringAsync: async (_algorithm: string, value: string) => createHash("sha256").update(value).digest("hex"),
}));

vi.mock("expo-auth-session", () => ({ makeRedirectUri: vi.fn() }));
vi.mock("expo-auth-session/build/QueryParams", () => ({ getQueryParams: vi.fn() }));
vi.mock("expo-web-browser", () => ({ maybeCompleteAuthSession: vi.fn(), openAuthSessionAsync: vi.fn() }));

vi.mock("react-native", () => ({ Platform: { OS: "ios" } }));

vi.mock("../../lib/supabase", () => ({
  supabase: { auth: { signInWithIdToken: mocks.signInWithIdToken } },
}));

import { startAppleAuthSession } from "./auth-service";

describe("startAppleAuthSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.randomUUID.mockReturnValue("test-apple-nonce");
  });

  it("sends the SHA-256 nonce to Apple and the original nonce to Supabase", async () => {
    mocks.signInAsync.mockResolvedValue({ identityToken: "apple-id-token" });
    mocks.signInWithIdToken.mockResolvedValue({ data: { session: {} }, error: null });

    await expect(startAppleAuthSession()).resolves.toEqual({ status: "completed" });

    expect(mocks.signInAsync).toHaveBeenCalledWith({
      nonce: createHash("sha256").update("test-apple-nonce").digest("hex"),
      requestedScopes: [0, 1],
    });
    expect(mocks.signInWithIdToken).toHaveBeenCalledWith({
      provider: "apple",
      token: "apple-id-token",
      nonce: "test-apple-nonce",
    });
  });

  it("treats a dismissed Apple sheet as a cancellation", async () => {
    mocks.signInAsync.mockRejectedValue({ code: "ERR_REQUEST_CANCELED" });

    await expect(startAppleAuthSession()).resolves.toEqual({ status: "cancelled" });
    expect(mocks.signInWithIdToken).not.toHaveBeenCalled();
  });

  it("does not call Supabase when Apple returns no identity token", async () => {
    mocks.signInAsync.mockResolvedValue({ identityToken: null });

    await expect(startAppleAuthSession()).resolves.toEqual({
      status: "failed",
      message: "Apple sign-in did not return an identity token.",
    });
    expect(mocks.signInWithIdToken).not.toHaveBeenCalled();
  });
});
