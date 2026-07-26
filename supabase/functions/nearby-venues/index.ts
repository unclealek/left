// @ts-nocheck
import { withSupabase } from "npm:@supabase/server";
import { findNearbyVenueRows, upsertVenueFromGooglePlace } from "../_shared/venue-store.ts";
import { searchNearbyPlaces } from "../_shared/google-places.ts";
import { handleCors, json, parseJson } from "../_shared/http.ts";

type RequestBody = {
  latitude?: number;
  longitude?: number;
  radiusMetres?: number;
};

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    const body = await parseJson<RequestBody>(req);
    const latitude = body.latitude;
    const longitude = body.longitude;
    const radiusMetres = Math.min(Math.max(body.radiusMetres ?? 100, 50), 1000);

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return json({ error: "Missing latitude or longitude" }, 400);
    }

    let venues = await findNearbyVenueRows(ctx.supabaseAdmin, {
      latitude,
      longitude,
      radiusMetres,
    });

    if (!venues.length) {
      const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
      if (apiKey) {
        const places = await searchNearbyPlaces({
          apiKey,
          latitude,
          longitude,
          radiusMetres,
        }).catch((error) => {
          console.warn("[nearby-venues] Google Places lookup failed", error?.message ?? error);
          return [];
        });

        for (const place of places) {
          try {
            await upsertVenueFromGooglePlace(ctx.supabaseAdmin, place);
          } catch (error) {
            console.warn("[nearby-venues] canonical venue upsert failed", error?.message ?? error, {
              googlePlaceId: place?.id ?? null,
            });
          }
        }

        venues = await findNearbyVenueRows(ctx.supabaseAdmin, {
          latitude,
          longitude,
          radiusMetres,
        });
      }
    }

    return json({
      venues: venues.map((venue: any) => ({
        id: venue.id,
        googlePlaceId: venue.google_place_id ?? null,
        name: venue.name,
        venueType: venue.type ?? "other",
        latitude: venue.latitude,
        longitude: venue.longitude,
        radiusMeters: venue.radius_meters ?? radiusMetres,
        source: venue.source ?? "google_places",
        distanceMetres: Math.round(venue.distance_metres ?? 0),
        formattedAddress: venue.formatted_address ?? null,
        timezone: venue.timezone ?? null,
        photo: venue.google_photo_name
          ? {
              photoName: venue.google_photo_name,
            }
          : null,
      })),
    });
  }),
};
