import { describe, expect, it, vi } from "vitest";
import { revokeAppleAuthorization } from "./apple-revocation";

describe("Apple removal authorization", () => {
  const config = { clientId: "com.left.mobile", clientSecret: "server-secret" };
  it("exchanges the one-use code, verifies ownership, then revokes the refresh token", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(Response.json({ id_token: "signed", refresh_token: "refresh" }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    await revokeAppleAuthorization("code", "owner", config, { fetcher, verify: async () => ({ sub: "owner" }) });
    const body = fetcher.mock.calls[1][1].body as URLSearchParams;
    expect(body.get("token")).toBe("refresh");
    expect(body.get("token_type_hint")).toBe("refresh_token");
    expect(fetcher.mock.calls[1][0]).toBe("https://appleid.apple.com/auth/revoke");
  });
  it("does not revoke a different Apple identity", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(Response.json({ id_token: "signed", refresh_token: "refresh" }));
    await expect(revokeAppleAuthorization("code", "owner", config, { fetcher, verify: async () => ({ sub: "other" }) }))
      .rejects.toThrow("identity");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it.each(["config", "exchange", "missing-token", "signature", "revoke"])("fails closed on %s failure", async (failure) => {
    const fetcher = vi.fn().mockResolvedValueOnce(failure === "exchange" ? new Response(null, { status: 400 }) :
      Response.json({ id_token: "signed", ...(failure === "missing-token" ? {} : { refresh_token: "refresh" }) }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }));
    const verify = async () => { if (failure === "signature") throw new Error("signature"); return { sub: "owner" }; };
    await expect(revokeAppleAuthorization("code", "owner", failure === "config" ? { clientId: "", clientSecret: "" } : config, { fetcher, verify }))
      .rejects.toThrow();
  });
});
