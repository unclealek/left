// @ts-nocheck
import { withSupabase } from "npm:@supabase/server";
import { handleCors, json, parseJson } from "../_shared/http.ts";
import { ensureBestTimeForecastForVenue } from "../_shared/ensure-besttime-forecast.ts";

type RequestBody = {
  venueId?: string;
};

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    const body = await parseJson<RequestBody>(req);
    if (!body.venueId) {
      return json({ error: "Missing venueId" }, 400);
    }

    const { data: venue, error } = await ctx.supabaseAdmin
      .from("venues")
      .select("*")
      .eq("id", body.venueId)
      .single();

    if (error || !venue) {
      return json({ error: "Venue not found" }, 404);
    }

    const { data: existingCache } = await ctx.supabaseAdmin
      .from("venue_activity_cache")
      .select("*")
      .eq("venue_id", venue.id)
      .maybeSingle();

    const result = await ensureBestTimeForecastForVenue(
      ctx.supabaseAdmin,
      venue,
      existingCache,
      Deno.env.toObject(),
    );

    return json({
      ok: true,
      venueId: result.venue.id,
      besttimeStatus: result.venue.besttime_status,
      providerStatus: result.providerStatus,
      cache: result.cache
        ? {
            forecastScore: result.cache.forecast_score ?? null,
            forecastFetchedAt: result.cache.forecast_fetched_at ?? null,
            forecastExpiresAt: result.cache.forecast_expires_at ?? null,
          }
        : null,
      reason: result.reason ?? null,
    });
  }),
};
