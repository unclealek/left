// @ts-nocheck
import { withSupabase } from "npm:@supabase/server";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@6.2.12";
import { revokeAppleAuthorization } from "../_shared/apple-revocation.ts";
import { readBoundedJson } from "../_shared/bounded-json.ts";
import { handleCors, json } from "../_shared/http.ts";

const appleKeys = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

type RequestBody = {
  requestId?: string;
  appleAuthorizationCode?: string;
};

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const cors = handleCors(req);
    if (cors) return cors;
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
    const { data: { user }, error: userError } = await ctx.supabase.auth.getUser();
    if (userError || !user || user.app_metadata?.identity_removed) return json({ error: "Active account required" }, 401);
    let body: RequestBody;
    try { body = await readBoundedJson(req, 8192) as RequestBody; }
    catch { return json({ error: "Invalid request" }, 400); }
    const requestId = body?.requestId;

    if (typeof requestId !== "string" || !/^[0-9a-f-]{36}$/i.test(requestId)) {
      return Response.json({ error: "Missing requestId" }, { status: 400 });
    }

    const { data: ownedRequest, error: requestLookupError } = await ctx.supabase
      .from("identity_removal_requests")
      .select("id, status")
      .eq("id", requestId)
      .eq("user_id", user.id)
      .single();

    if (requestLookupError || !ownedRequest) {
      return Response.json({ error: "Identity removal request not found" }, { status: 404 });
    }
    if (!["pending", "processing"].includes(ownedRequest.status)) return json({ error: "Request is not pending" }, 409);

    const appleIdentity = user.identities?.find((identity) => identity.provider === "apple");
    if (appleIdentity) {
      try {
        await revokeAppleAuthorization(body.appleAuthorizationCode, appleIdentity.identity_data?.sub ?? appleIdentity.id, {
          clientId: Deno.env.get("APPLE_CLIENT_ID") ?? "",
          clientSecret: Deno.env.get("APPLE_CLIENT_SECRET") ?? "",
        }, {
          fetcher: fetch,
          verify: async (token, audience) => (await jwtVerify(token, appleKeys, {
            issuer: "https://appleid.apple.com", audience, algorithms: ["RS256"],
          })).payload,
        });
      } catch {
        return json({ error: "Apple authorization could not be revoked. Reauthorize and retry removal." }, 409);
      }
    }

    const { data, error } = await ctx.supabaseAdmin.rpc("process_identity_removal_request", {
      p_request_id: requestId,
      p_requesting_user_id: user.id,
    });

    if (error) {
      return Response.json(
        { error: "Identity removal processing failed" },
        { status: 500 },
      );
    }

    return Response.json({ ok: true, request: data });
  }),
};
