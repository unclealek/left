// @ts-nocheck
import { withSupabase } from "npm:@supabase/server";
import { handleCors, json, parseJson } from "../_shared/http.ts";
import { normalizeActivityEnvelope } from "../_shared/activity-normalizer.ts";
import { activityRefreshDue, ensureBestTimeForecastForVenue } from "../_shared/ensure-besttime-forecast.ts";
import { getLeftPresenceCounts } from "../_shared/presence.ts";
import { loadActivityCacheRows, loadVenueRowsByIds } from "../_shared/venue-store.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";

type RequestBody = {
  venueIds?: string[];
};

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    const body = await parseJson<RequestBody>(req);
    const venueIds = Array.isArray(body.venueIds)
      ? body.venueIds.filter((value): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value))
      : [];

    if (venueIds.length > 10) return json({ error: "At most 10 venues per request" }, 400);
    if (!venueIds.length) {
      return json({ error: "Missing venueIds" }, 400);
    }

    const rateLimitResponse = await enforceRateLimit(ctx.supabase, "venue-activity");
    if (rateLimitResponse) return rateLimitResponse;

    const [venues, cacheRows, leftPresenceByVenueId] = await Promise.all([
      loadVenueRowsByIds(ctx.supabaseAdmin, venueIds),
      loadActivityCacheRows(ctx.supabaseAdmin, venueIds),
      getLeftPresenceCounts(ctx.supabaseAdmin, venueIds),
    ]);

    const cacheByVenueId = new Map(cacheRows.map((row: any) => [row.venue_id, row]));
    const responses = [];
    let next = 0;
    async function worker() {
      while (next < venues.length) {
        const venue = venues[next++];
        let cache = cacheByVenueId.get(venue.id) ?? null;
        let currentVenue = venue;

        if (activityRefreshDue(venue, cache, true).any) {
          const refresh = ensureBestTimeForecastForVenue(ctx.supabaseAdmin, venue, cache, Deno.env.toObject(), true);
          if (cache?.raw_forecast && typeof EdgeRuntime !== "undefined") {
            EdgeRuntime.waitUntil(refresh.catch(() => console.warn("[activity] Background refresh failed")));
            cache = { ...cache, refresh_status: "refreshing" };
          } else {
            try {
              const ensured = await refresh;
              currentVenue = ensured.venue;
              cache = ensured.cache ?? cache;
            } catch {
              console.warn("[activity] Venue refresh failed");
            }
          }
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
    }
    await Promise.all(Array.from({ length: Math.min(3, venues.length) }, () => worker()));
    return json({ venues: responses });
  }),
};
