// @ts-nocheck
import { withSupabase } from "npm:@supabase/server";
import { handleCors, json } from "../_shared/http.ts";
import { readBoundedJson, PayloadTooLargeError } from "../_shared/bounded-json.ts";
import { getLeftPresenceCounts } from "../_shared/presence.ts";
import { loadVenueRowsByIds } from "../_shared/venue-store.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";

// Presence-only compatibility envelope. Popular times has its own cached/Realtime path.
export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;
    if (req.method !== "POST") return json({ error: "POST required" }, 405);
    try {
      const limited = await enforceRateLimit(ctx.supabase, "venue-activity");
      if (limited) return limited;
      let body;
      try { body = await readBoundedJson(req, 4096); }
      catch (error) { return json({error: "Invalid request body"}, error instanceof PayloadTooLargeError ? 413 : 400); }
      if (!Array.isArray(body?.venueIds) || !body.venueIds.length || body.venueIds.length > 10 ||
        body.venueIds.some(value => typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value))) {
        return json({ error: "Between 1 and 10 valid venueIds are required" }, 400);
      }
      const venueIds = [...new Set(body.venueIds)];
      const [venues, counts] = await Promise.all([
        loadVenueRowsByIds(ctx.supabaseAdmin, venueIds), getLeftPresenceCounts(ctx.supabaseAdmin, venueIds),
      ]);
      return json({ venues: venues.map(venue => ({
        venueId: venue.id, googlePlaceId: venue.google_place_id ?? null, name: venue.name,
        activity: {
          label: "unknown", displayText: "Popular times unavailable", score: null, forecastScore: null,
          liveAvailable: false, comparison: "unknown", comparisonText: "", updatedAt: null,
          isStale: false, refreshing: false, source: "left",
        },
        leftPresence: counts.get(venue.id) ?? {total: 0, visible: 0, openToMeet: 0},
      })) });
    } catch {
      return json({error: "Venue activity temporarily unavailable"}, 503);
    }
  }),
};
