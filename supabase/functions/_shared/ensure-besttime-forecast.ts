// @ts-nocheck

import { createBestTimeClient } from "./besttime.ts";

export async function ensureBestTimeForecastForVenue(
  supabaseAdmin: any,
  venue: any,
  existingCache: any,
  env: Record<string, string | undefined>,
) {
  if (
    venue.besttime_status === "available" &&
    existingCache?.forecast_expires_at &&
    new Date(existingCache.forecast_expires_at).getTime() > Date.now()
  ) {
    return {
      venue,
      cache: existingCache,
      providerStatus: "cache_hit",
    };
  }

  const client = createBestTimeClient(env);
  const result = await client.initializeVenue({
    besttimeVenueId: venue.besttime_venue_id,
    googlePlaceId: venue.google_place_id,
    venueName: venue.name,
    venueAddress: venue.formatted_address,
    latitude: venue.latitude,
    longitude: venue.longitude,
    timezone: venue.timezone,
  });

  if (result.status === "unconfigured") {
    return {
      venue,
      cache: existingCache,
      providerStatus: "unconfigured",
      reason: result.reason,
    };
  }

  if (result.status === "unavailable") {
    const nextVenuePatch = {
      besttime_status: "unavailable",
    };
    const { data: updatedVenue, error: venueError } = await supabaseAdmin
      .from("venues")
      .update(nextVenuePatch)
      .eq("id", venue.id)
      .select("*")
      .single();

    if (venueError) throw venueError;

    const { data: updatedCache, error: cacheError } = await supabaseAdmin
      .from("venue_activity_cache")
      .upsert(
        {
          venue_id: venue.id,
          forecast_score: null,
          forecast_fetched_at: new Date().toISOString(),
          forecast_expires_at: result.expiresAt,
          last_error: result.reason,
          refresh_status: "idle",
        },
        { onConflict: "venue_id" },
      )
      .select("*")
      .single();

    if (cacheError) throw cacheError;

    return {
      venue: updatedVenue,
      cache: updatedCache,
      providerStatus: "unavailable",
      reason: result.reason,
    };
  }

  if (result.status === "failed") {
    const retryAt = new Date(Date.now() + result.retryAfterSeconds * 1000).toISOString();
    const { data: updatedCache, error: cacheError } = await supabaseAdmin
      .from("venue_activity_cache")
      .upsert(
        {
          venue_id: venue.id,
          forecast_expires_at: retryAt,
          last_error: result.reason,
          refresh_status: "failed",
          consecutive_failures: (existingCache?.consecutive_failures ?? 0) + 1,
        },
        { onConflict: "venue_id" },
      )
      .select("*")
      .single();

    if (cacheError) throw cacheError;

    return {
      venue,
      cache: updatedCache,
      providerStatus: "failed",
      reason: result.reason,
    };
  }

  const { data: updatedVenue, error: venueError } = await supabaseAdmin
    .from("venues")
    .update({
      besttime_venue_id: result.besttimeVenueId,
      besttime_status: "available",
      timezone: result.timezone ?? venue.timezone ?? null,
      last_besttime_forecast_at: result.fetchedAt,
    })
    .eq("id", venue.id)
    .select("*")
    .single();

  if (venueError) throw venueError;

  const { data: updatedCache, error: cacheError } = await supabaseAdmin
    .from("venue_activity_cache")
    .upsert(
      {
        venue_id: venue.id,
        forecast_score: result.forecastScore,
        raw_forecast: result.rawForecast,
        forecast_fetched_at: result.fetchedAt,
        forecast_expires_at: result.expiresAt,
        refresh_status: "idle",
        refresh_started_at: null,
        last_error: null,
        consecutive_failures: 0,
      },
      { onConflict: "venue_id" },
    )
    .select("*")
    .single();

  if (cacheError) throw cacheError;

  return {
    venue: updatedVenue,
    cache: updatedCache,
    providerStatus: "refreshed",
  };
}
