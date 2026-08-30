// @ts-nocheck
import { withSupabase } from "npm:@supabase/server";
import { handleCors, json } from "../_shared/http.ts";

export default {
  fetch: withSupabase({ auth: "user" }, async (req) => {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    return json(
      {
        ok: true,
        refreshed: false,
        available: false,
        message: "Live venue activity refresh is not enabled for this environment.",
      },
      200,
    );
  }),
};
