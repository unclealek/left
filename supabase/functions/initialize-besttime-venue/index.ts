// @ts-nocheck
import { withSupabase } from "npm:@supabase/server";
import { handleCors, json } from "../_shared/http.ts";

export default {
  fetch: withSupabase({ auth: "user" }, async (req) => {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;
    return json({ error: "This endpoint is not available to app users." }, 403);
  }),
};
