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
  const nearbyVenues: any[] = [];
  let afterId: string | null = null;
  // Page by the stable primary key before filtering, including legacy rows
  // whose coordinates live only in geofence_json. A global limit hides places.
  while (true) {
    let query = supabaseAdmin
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
        community_added_by_name,
        community_notes,
        community_photo_path,
        geofence_json
      `)
      .eq("is_active", true)
      .order("id", { ascending: true })
      .limit(200);
    if (afterId !== null) query = query.gt("id", afterId);
    const { data, error } = await query;

    if (error) throw error;

    const page = data ?? [];
    nearbyVenues.push(...page
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
      .filter(Boolean));
    if (page.length < 200) break;
    afterId = page[page.length - 1].id;
  }
  return nearbyVenues.sort((a: any, b: any) => a.distance_metres - b.distance_metres);
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
        // New rows use the database default true; refreshes preserve disablement.
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
  const { data, error } = await supabaseAdmin.from("venues")
    .select("id, google_place_id, name").in("id", venueIds).eq("is_active", true);
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
