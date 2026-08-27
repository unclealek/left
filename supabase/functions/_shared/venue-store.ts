// @ts-nocheck

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number) {
  const earthRadius = 6371000;
  const dLat = toRadians(bLat - aLat);
  const dLng = toRadians(bLng - aLng);
  const lat1 = toRadians(aLat);
  const lat2 = toRadians(bLat);
  const haversine =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(haversine));
}

export async function findNearbyVenueRows(
  supabaseAdmin: any,
  input: { latitude: number; longitude: number; radiusMetres: number },
) {
  const { data, error } = await supabaseAdmin
    .from("venues")
    .select(`
      id,
      name,
      type,
      source,
      google_place_id,
      formatted_address,
      latitude,
      longitude,
      timezone,
      primary_type,
      google_photo_name,
      geofence_json
    `)
    .eq("is_active", true)
    .limit(200);

  if (error) throw error;

  return (data ?? [])
    .map((row: any) => {
      const latitude =
        row.latitude ??
        row.geofence_json?.center?.latitude ??
        null;
      const longitude =
        row.longitude ??
        row.geofence_json?.center?.longitude ??
        null;
      if (typeof latitude !== "number" || typeof longitude !== "number") return null;
      const distanceMetres = distanceMeters(
        input.latitude,
        input.longitude,
        latitude,
        longitude,
      );
      const radiusMeters =
        typeof row.geofence_json?.radius_meters === "number"
          ? row.geofence_json.radius_meters
          : 120;
      if (distanceMetres > input.radiusMetres) return null;

      return {
        ...row,
        latitude,
        longitude,
        radius_meters: radiusMeters,
        distance_metres: distanceMetres,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => a.distance_metres - b.distance_metres);
}

export async function upsertVenueFromGooglePlace(supabaseAdmin: any, place: any) {
  const latitude = place?.location?.latitude;
  const longitude = place?.location?.longitude;
  if (typeof latitude !== "number" || typeof longitude !== "number" || !place?.id || !place?.displayName?.text) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("venues")
    .upsert(
      {
        google_place_id: place.id,
        name: place.displayName.text,
        formatted_address: place.formattedAddress ?? null,
        latitude,
        longitude,
        type: mapVenueType(place.primaryType),
        primary_type: place.primaryType ?? null,
        google_types: Array.isArray(place.types) ? place.types : [],
        google_photo_name: place.photos?.[0]?.name ?? null,
        google_photo_attribution: place.photos?.[0]?.authorAttributions ?? null,
        geofence_json: {
          center: { latitude, longitude },
          radius_meters: 120,
          source: "google_places",
        },
        source: "google_places",
        source_payload: {
          primaryType: place.primaryType ?? null,
          types: Array.isArray(place.types) ? place.types : [],
          photoName: place.photos?.[0]?.name ?? null,
        },
        is_active: true,
        last_verified_at: new Date().toISOString(),
        last_google_sync_at: new Date().toISOString(),
      },
      {
        onConflict: "google_place_id",
      },
    )
    .select(`
      id,
      name,
      type,
      source,
      google_place_id,
      formatted_address,
      latitude,
      longitude,
      timezone,
      primary_type,
      google_photo_name,
      geofence_json
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function loadVenueRowsByIds(supabaseAdmin: any, venueIds: string[]) {
  if (!venueIds.length) return [];
  const { data, error } = await supabaseAdmin
    .from("venues")
    .select(`
      id,
      google_place_id,
      besttime_venue_id,
      besttime_status,
      name,
      formatted_address,
      latitude,
      longitude,
      timezone,
      primary_type,
      google_types,
      google_photo_name,
      last_besttime_forecast_at
    `)
    .in("id", venueIds);

  if (error) throw error;
  return data ?? [];
}

export async function loadActivityCacheRows(supabaseAdmin: any, venueIds: string[]) {
  if (!venueIds.length) return [];
  const { data, error } = await supabaseAdmin
    .from("venue_activity_cache")
    .select("*")
    .in("venue_id", venueIds);

  if (error) throw error;
  return data ?? [];
}

function mapVenueType(primaryType?: string | null) {
  switch (primaryType) {
    case "cafe":
    case "coffee_shop":
      return "cafe";
    case "library":
      return "library";
    case "coworking_space":
      return "coworking_space";
    case "university":
      return "university";
    default:
      return "other";
  }
}
