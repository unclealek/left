import { expect, it, vi } from "vitest";
import { completePkceCallback } from "./oauth-callback";
const redirect = "left://auth/callback";
it("exchanges only a code from the exact expected callback", async () => {
  const exchange = vi.fn().mockResolvedValue({ error: null });
  await completePkceCallback(`${redirect}?code=one-use-code`, redirect, exchange);
  expect(exchange).toHaveBeenCalledWith("one-use-code");
});
it.each([
  "left://evil/callback?code=code", "https://evil.invalid/auth/callback?code=code",
  "left://auth/callback/extra?code=code", "left://auth/callback#access_token=access&refresh_token=refresh",
  "left://auth/callback?code=code&access_token=access", "left://auth/callback?code=a&code=b",
  "left://auth/callback?error=access_denied", "not a URL",
])("rejects untrusted or implicit callback %s", async (url) => {
  const exchange = vi.fn();
  await expect(completePkceCallback(url, redirect, exchange)).rejects.toThrow();
  expect(exchange).not.toHaveBeenCalled();
});
it("propagates verifier mismatch or replay rejection without creating a session", async () => {
  await expect(completePkceCallback(`${redirect}?code=used`, redirect, async () => ({ error: new Error("invalid verifier") })))
    .rejects.toThrow("invalid verifier");
});
