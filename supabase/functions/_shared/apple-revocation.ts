import { readBoundedJson } from "./bounded-json.ts";

/** Reauthorize at deletion time: no long-lived Apple token needs to be stored. */
export async function revokeAppleAuthorization(
  code: string,
  expectedSubject: string,
  config: { clientId: string; clientSecret: string },
  deps: {
    fetcher: typeof fetch;
    verify: (token: string, audience: string) => Promise<{ sub?: string }>;
  },
) {
  if (!config.clientId || !config.clientSecret || typeof code !== "string" || !code || code.length > 4096 ||
      typeof expectedSubject !== "string" || !expectedSubject) {
    throw new Error("Apple revocation configuration or authorization missing");
  }
  const response = await deps.fetcher("https://appleid.apple.com/auth/token", {
    method: "POST", signal: AbortSignal.timeout(10_000),
    body: new URLSearchParams({ client_id: config.clientId, client_secret: config.clientSecret,
      grant_type: "authorization_code", code }),
  });
  if (!response.ok) throw new Error("Apple authorization exchange failed");
  const tokens = await readBoundedJson(response, 32_768) as Record<string, unknown>;
  if (typeof tokens.id_token !== "string" || typeof tokens.refresh_token !== "string") {
    throw new Error("Apple authorization token missing");
  }
  const claims = await deps.verify(tokens.id_token, config.clientId);
  if (claims.sub !== expectedSubject) throw new Error("Apple identity does not match this account");
  const revoked = await deps.fetcher("https://appleid.apple.com/auth/revoke", {
    method: "POST", signal: AbortSignal.timeout(10_000),
    body: new URLSearchParams({ client_id: config.clientId, client_secret: config.clientSecret,
      token: tokens.refresh_token, token_type_hint: "refresh_token" }),
  });
  if (!revoked.ok) throw new Error("Apple revocation failed");
}
