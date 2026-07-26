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
        message: "Presence lifecycle Edge Functions are planned but not migrated in this phase.",
      },
      501,
    );
  }),
};
