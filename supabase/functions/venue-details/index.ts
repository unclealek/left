// @ts-nocheck
import { withSupabase } from "npm:@supabase/server";
import { handleCors, json, parseJson } from "../_shared/http.ts";

const PLACE_DETAIL_FIELDS = [
  "id",
  "formattedAddress",
  "websiteUri",
  "nationalPhoneNumber",
  "rating",
  "userRatingCount",
  "priceLevel",
  "businessStatus",
  "currentOpeningHours",
  "regularOpeningHours",
  "accessibilityOptions",
].join(",");
const DETAILS_TTL_MS = 24 * 60 * 60 * 1000;

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    const { venueId } = await parseJson<{ venueId?: string }>(req);
    if (!venueId) return json({ error: "Missing venueId" }, 400);

    const { data: storedVenue, error } = await ctx.supabaseAdmin
      .from("venues")
      .select(`
        id,
        google_place_id,
        formatted_address,
        website_uri,
        phone_number,
        rating,
        user_rating_count,
        price_level,
        business_status,
        opening_hours,
        accessibility_options,
        last_google_sync_at
      `)
      .eq("id", venueId)
      .single();

    if (error || !storedVenue) return json({ error: "Venue not found" }, 404);

    let venue = storedVenue;
    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    const lastSyncMs = storedVenue.last_google_sync_at
      ? new Date(storedVenue.last_google_sync_at).getTime()
      : 0;
    const shouldRefresh = !lastSyncMs || Date.now() - lastSyncMs >= DETAILS_TTL_MS;

    if (apiKey && storedVenue.google_place_id && shouldRefresh) {
      try {
        const response = await fetch(
          `https://places.googleapis.com/v1/places/${encodeURIComponent(storedVenue.google_place_id)}`,
          {
            headers: {
              "X-Goog-Api-Key": apiKey,
              "X-Goog-FieldMask": PLACE_DETAIL_FIELDS,
            },
          },
        );
        if (!response.ok) throw new Error(`Google Place Details failed (${response.status})`);
        const place = await response.json();
        const openingHours = place.currentOpeningHours ?? place.regularOpeningHours ?? null;
        const { data: refreshedVenue, error: updateError } = await ctx.supabaseAdmin
          .from("venues")
          .update({
            formatted_address: place.formattedAddress ?? storedVenue.formatted_address,
            website_uri: place.websiteUri ?? null,
            phone_number: place.nationalPhoneNumber ?? null,
            rating: place.rating ?? null,
            user_rating_count: place.userRatingCount ?? null,
            price_level: place.priceLevel ?? null,
            business_status: place.businessStatus ?? null,
            opening_hours: openingHours,
            accessibility_options: place.accessibilityOptions ?? null,
            last_google_sync_at: new Date().toISOString(),
          })
          .eq("id", venueId)
          .select(`
            id,
            google_place_id,
            formatted_address,
            website_uri,
            phone_number,
            rating,
            user_rating_count,
            price_level,
            business_status,
            opening_hours,
            accessibility_options,
            last_google_sync_at
          `)
          .single();
        if (updateError) throw updateError;
        venue = refreshedVenue;
      } catch (detailsError) {
        console.warn("[venue-details] refresh failed", detailsError?.message ?? detailsError);
      }
    }

    return json({
      venueId: venue.id,
      formattedAddress: venue.formatted_address ?? null,
      websiteUri: venue.website_uri ?? null,
      phoneNumber: venue.phone_number ?? null,
      rating: venue.rating ?? null,
      userRatingCount: venue.user_rating_count ?? null,
      priceLevel: venue.price_level ?? null,
      businessStatus: venue.business_status ?? null,
      openingHours: venue.opening_hours
        ? {
            openNow: venue.opening_hours.openNow ?? null,
            weekdayDescriptions: venue.opening_hours.weekdayDescriptions ?? [],
          }
        : null,
      accessibilityOptions: venue.accessibility_options ?? null,
    });
  }),
};
