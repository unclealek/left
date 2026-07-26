// @ts-nocheck
import { withSupabase } from "npm:@supabase/server";
import { handleCors, json } from "../_shared/http.ts";

export default {
  fetch: withSupabase({ auth: "user" }, async (req) => {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    return json(
      {
        ok: false,
        message: "Phase 2 function placeholder. Live BestTime refresh and refresh-lock behavior are not implemented yet.",
      },
      501,
    );
  }),
};
