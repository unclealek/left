// @ts-nocheck
import { createBestTimeClient } from "./besttime.ts";

const future = (value: string | null | undefined) => !!value && Date.parse(value) > Date.now();
export function activityRefreshDue(venue: any, cache: any, includeLive = false) {
  const forecast = !future(cache?.forecast_retry_at) && !future(cache?.forecast_expires_at);
  const live = includeLive && venue.besttime_status === "available" && !!venue.besttime_venue_id &&
    !future(cache?.live_retry_at) && !future(cache?.live_expires_at);
  return { forecast, live, any: forecast || live };
}

export async function ensureBestTimeForecastForVenue(
  db: any, venue: any, existingCache: any, env: Record<string, string | undefined>, includeLive = false,
) {
  let cache = existingCache;
  const snapshot = (providerStatus: string, reason?: string) => ({ venue, cache, providerStatus, reason });
  if (!activityRefreshDue(venue, cache, includeLive).any) return snapshot("cache_hit");
  const { error: insertError } = await db.from("venue_activity_cache")
    .upsert({ venue_id: venue.id }, { onConflict: "venue_id", ignoreDuplicates: true });
  if (insertError) throw insertError;
  const { data: claimed, error: claimError } = await db.rpc("claim_activity_refresh", { target_venue_id: venue.id });
  if (claimError) throw claimError;
  if (!claimed) return { ...snapshot("refreshing"), cache: { ...cache, refresh_status: "refreshing" } };

  let lease: string | null = null;
  let phase = "forecast";
  let providerStatus = "cache_hit";
  let reason: string | undefined;
  try {
    // Re-read after taking ownership: another request may have just filled the cache.
    const [{ data: freshVenue, error: venueError }, { data: freshCache, error: cacheError }] = await Promise.all([
      db.from("venues").select("*").eq("id", venue.id).single(),
      db.from("venue_activity_cache").select("*").eq("venue_id", venue.id).single(),
    ]);
    if (venueError || cacheError) throw venueError || cacheError;
    venue = freshVenue;
    cache = freshCache;
    lease = cache.refresh_started_at;
    const client = createBestTimeClient(env);
    async function save(patch: any) {
      const { data, error } = await db.from("venue_activity_cache").update(patch)
        .eq("venue_id", venue.id).eq("refresh_started_at", lease).select("*").single();
      if (error) throw error;
      cache = data;
    }
    if (activityRefreshDue(venue, cache, includeLive).forecast) {
      const result = await client.initializeVenue({ besttimeVenueId: venue.besttime_venue_id,
        venueName: venue.name, venueAddress: venue.formatted_address,
        latitude: venue.latitude, longitude: venue.longitude, timezone: venue.timezone });
      providerStatus = result.status;
      if (result.status === "available") {
        const { data, error } = await db.from("venues").update({ besttime_venue_id: result.besttimeVenueId,
          besttime_status: "available", timezone: result.timezone, last_besttime_forecast_at: result.fetchedAt })
          .eq("id", venue.id).select("*").single();
        if (error) throw error;
        venue = data;
        await save({ raw_forecast: result.rawForecast, forecast_score: result.forecastScore,
          forecast_fetched_at: result.fetchedAt, forecast_expires_at: result.expiresAt,
          forecast_retry_at: null, last_error: null, consecutive_failures: 0 });
        providerStatus = "refreshed";
      } else if (result.status === "unavailable") {
        const { data, error } = await db.from("venues").update({ besttime_status: "unavailable" })
          .eq("id", venue.id).select("*").single();
        if (error) throw error;
        venue = data;
        reason = result.reason;
        await save({ raw_forecast: null, forecast_score: null, live_score: null, live_available: false,
          raw_live: null, live_expires_at: null, forecast_fetched_at: new Date().toISOString(),
          forecast_expires_at: result.expiresAt, forecast_retry_at: null, last_error: reason });
      } else {
        reason = result.reason;
        await save({ forecast_retry_at: new Date(Date.now() + result.retryAfterSeconds * 1000).toISOString(),
          last_error: reason, consecutive_failures: cache.consecutive_failures + 1 });
      }
    }
    phase = "live";
    if (activityRefreshDue(venue, cache, includeLive).live) {
      const result = await client.refreshLive(venue.besttime_venue_id, venue.timezone);
      if (result.status === "available") {
        await save({ raw_live: result.rawLive, live_score: result.liveScore, live_available: result.liveAvailable,
          live_fetched_at: result.fetchedAt, live_expires_at: result.expiresAt, live_retry_at: null,
          ...(!reason ? { last_error: null, consecutive_failures: 0 } : {}) });
        if (!reason) providerStatus = "refreshed";
      } else {
        providerStatus = result.status;
        reason = result.reason;
        await save({ live_retry_at: new Date(Date.now() + result.retryAfterSeconds * 1000).toISOString(),
          last_error: reason, consecutive_failures: cache.consecutive_failures + 1 });
      }
    }
    await save({ refresh_status: reason ? "failed" : "idle", refresh_started_at: null });
    return snapshot(providerStatus, reason);
  } catch {
    // Keep previously usable data on transient failures, with a separate retry deadline.
    const patch = { refresh_status: "failed", refresh_started_at: null,
      [phase === "forecast" ? "forecast_retry_at" : "live_retry_at"]: new Date(Date.now() + 900_000).toISOString(),
      last_error: "Activity refresh failed; retry scheduled." };
    if (lease) {
      const { data } = await db.from("venue_activity_cache").update(patch).eq("venue_id", venue.id)
        .eq("refresh_started_at", lease).select("*").maybeSingle();
      if (data) cache = data;
    }
    return snapshot("failed", patch.last_error);
  }
}
