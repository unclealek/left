// @ts-nocheck
import { withSupabase } from "npm:@supabase/server";
import { handleCors, json, parseJson } from "../_shared/http.ts";
import { normalizeActivityEnvelope } from "../_shared/activity-normalizer.ts";
import { ensureBestTimeForecastForVenue } from "../_shared/ensure-besttime-forecast.ts";
import { getLeftPresenceCounts } from "../_shared/presence.ts";
import { loadActivityCacheRows, loadVenueRowsByIds } from "../_shared/venue-store.ts";

type RequestBody = {
  venueIds?: string[];
};

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    const body = await parseJson<RequestBody>(req);
    const venueIds = Array.isArray(body.venueIds)
      ? body.venueIds.filter((value): value is string => typeof value === "string" && value.length > 0)
      : [];

    if (!venueIds.length) {
      return json({ error: "Missing venueIds" }, 400);
    }

    const [venues, cacheRows, leftPresenceByVenueId] = await Promise.all([
      loadVenueRowsByIds(ctx.supabaseAdmin, venueIds),
      loadActivityCacheRows(ctx.supabaseAdmin, venueIds),
      getLeftPresenceCounts(ctx.supabaseAdmin, venueIds),
    ]);

    const cacheByVenueId = new Map(cacheRows.map((row: any) => [row.venue_id, row]));
    const responses = [];

    for (const venue of venues) {
      let cache = cacheByVenueId.get(venue.id) ?? null;
      let currentVenue = venue;

      if (venue.besttime_status !== "unavailable") {
        const ensured = await ensureBestTimeForecastForVenue(
          ctx.supabaseAdmin,
          venue,
          cache,
          Deno.env.toObject(),
        );
        currentVenue = ensured.venue;
        cache = ensured.cache ?? cache;
      }

      const leftPresence =
        leftPresenceByVenueId.get(venue.id) ?? {
          total: 0,
          visible: 0,
          openToMeet: 0,
        };

      responses.push({
        googlePlaceId: currentVenue.google_place_id ?? null,
        name: currentVenue.name,
        ...normalizeActivityEnvelope({
          venueId: currentVenue.id,
          besttimeStatus: currentVenue.besttime_status,
          timezone: currentVenue.timezone,
          cache,
          leftPresence,
        }),
      });
    }

    return json({ venues: responses });
  }),
};
