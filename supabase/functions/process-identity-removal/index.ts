// @ts-nocheck
import { withSupabase } from "npm:@supabase/server";

type RequestBody = {
  requestId?: string;
};

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const requestId = body.requestId;

    if (!requestId) {
      return Response.json({ error: "Missing requestId" }, { status: 400 });
    }

    const { data: ownedRequest, error: requestLookupError } = await ctx.supabase
      .from("identity_removal_requests")
      .select("id, status")
      .eq("id", requestId)
      .single();

    if (requestLookupError || !ownedRequest) {
      return Response.json({ error: "Identity removal request not found" }, { status: 404 });
    }

    const { data, error } = await ctx.supabaseAdmin.rpc("process_identity_removal_request", {
      p_request_id: requestId,
      p_requesting_user_id: ctx.userClaims?.sub ?? null,
    });

    if (error) {
      return Response.json(
        { error: "Identity removal processing failed", details: error.message },
        { status: 500 },
      );
    }

    return Response.json({ ok: true, request: data });
  }),
};
