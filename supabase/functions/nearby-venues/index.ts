// @ts-nocheck
import { withSupabase } from "npm:@supabase/server";
import { findNearbyVenueRows, upsertVenueFromGooglePlace } from "../_shared/venue-store.ts";
import { searchNearbyPlaces } from "../_shared/google-places.ts";
import { handleCors, json, parseJson } from "../_shared/http.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";

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

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return json({ error: "Valid latitude and longitude are required" }, 400);
    }

    const rateLimitResponse = await enforceRateLimit(ctx.supabase, "nearby-venues");
    if (rateLimitResponse) return rateLimitResponse;

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

    const responseVenues = await Promise.all(venues.map(async (venue: any) => {
      const communityPhotoUrl = venue.community_photo_path
        ? (await ctx.supabaseAdmin.storage.from("community-venue-photos")
            .createSignedUrl(venue.community_photo_path, 3600)).data?.signedUrl ?? null
        : null;
      return {
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
        communityAddedByName: venue.community_added_by_name ?? null,
        communityNotes: venue.community_notes ?? null,
        communityPhotoUrl,
        timezone: venue.timezone ?? null,
        photo: venue.google_photo_name
          ? {
              photoName: venue.google_photo_name,
            }
          : null,
      };
    }));

    return json({
      venues: responseVenues,
    });
  }),
};
