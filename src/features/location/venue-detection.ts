import type { LocationObjectCoords } from "expo-location";
import { supabase } from "../../lib/supabase";
import type { VenueType } from "../../types/left-domain";

export type DetectedVenue = {
  id: string;
  name: string;
  venueType: VenueType;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  source: "google_places" | "local_catalog" | "user_submission";
  distanceMeters: number | null;
  photoUrl: string | null;
};

const SOCIAL_GOOGLE_TYPES = [
  "cafe",
  "bar",
  "library",
  "coffee_shop",
  "coworking_space",
  "restaurant",
  "university",
] as const;

const VENUE_SEARCH_RADIUS_METERS = 100;
const VENUE_CANDIDATE_MAX_DISTANCE_METERS = 120;
const GOOGLE_MAX_RESULTS = 5;
const DB_VENUE_NAME_DEDUPE_DISTANCE_METERS = 35;

type VenueGeofenceJson = {
  center?: {
    latitude?: number;
    longitude?: number;
  };
  radius_meters?: number;
  source?: string;
};

type DbVenueRow = {
  id: string;
  name: string;
  type?: VenueType;
  city?: string | null;
  geofence_json: VenueGeofenceJson | null;
  google_place_id?: string | null;
  source?: string | null;
  source_payload?: Record<string, unknown> | null;
};

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  location?: { latitude?: number; longitude?: number };
  photos?: Array<{ name?: string }>;
  primaryType?: string;
};

const LOCAL_VENUE_CATALOG: DetectedVenue[] = [];

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

function buildGooglePlacePhotoUrl(photoName: string | undefined) {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!photoName || !apiKey) return null;
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=400&key=${apiKey}`;
}

function normalizeGooglePlace(place: GooglePlace, coords: LocationObjectCoords): DetectedVenue | null {
  const id = place.id;
  const name = place.displayName?.text;
  const latitude = place.location?.latitude;
  const longitude = place.location?.longitude;
  if (!id || !name || typeof latitude !== "number" || typeof longitude !== "number") return null;
  return {
    id,
    name,
    venueType: mapGooglePlaceType(place.primaryType),
    latitude,
    longitude,
    radiusMeters: 120,
    source: "google_places",
    distanceMeters: distanceMeters(coords.latitude, coords.longitude, latitude, longitude),
    photoUrl: buildGooglePlacePhotoUrl(place.photos?.[0]?.name),
  };
}

function mapGooglePlaceType(primaryType: string | undefined): VenueType {
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

function normalizeVenueName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function isSamePhysicalVenue(a: DetectedVenue, b: DetectedVenue) {
  if (a.id === b.id) return true;
  if (normalizeVenueName(a.name) !== normalizeVenueName(b.name)) return false;

  const directDistance = distanceMeters(a.latitude, a.longitude, b.latitude, b.longitude);
  return directDistance <= DB_VENUE_NAME_DEDUPE_DISTANCE_METERS;
}

function normalizeDbVenue(
  row: DbVenueRow,
  coords: LocationObjectCoords,
): DetectedVenue | null {
  const latitude = row.geofence_json?.center?.latitude;
  const longitude = row.geofence_json?.center?.longitude;
  if (typeof latitude !== "number" || typeof longitude !== "number") return null;

  const radiusMeters = Math.min(
    typeof row.geofence_json?.radius_meters === "number"
      ? row.geofence_json.radius_meters
      : VENUE_CANDIDATE_MAX_DISTANCE_METERS,
    VENUE_CANDIDATE_MAX_DISTANCE_METERS,
  );
  const venueDistanceMeters = distanceMeters(coords.latitude, coords.longitude, latitude, longitude);
  if (venueDistanceMeters > radiusMeters) return null;

  return {
    id: row.id,
    name: row.name,
    venueType: row.type ?? "other",
    latitude,
    longitude,
    radiusMeters,
    source:
      row.source === "google_places"
        ? "google_places"
        : row.geofence_json?.source === "user_submission"
          ? "user_submission"
          : "local_catalog",
    distanceMeters: venueDistanceMeters,
    photoUrl: null,
  };
}

async function fetchActiveVenueRows() {
  const { data, error } = await supabase
    .from("venues")
    .select("id, name, type, city, geofence_json, google_place_id, source, source_payload")
    .eq("is_active", true)
    .limit(200);

  if (error) {
    console.warn("[location][venues] Supabase venue lookup failed", error.message);
    return [];
  }

  return (data ?? []) as DbVenueRow[];
}

async function createCanonicalVenueFromGooglePlace(place: GooglePlace) {
  const normalized = normalizeGooglePlace(place, {
    latitude: place.location?.latitude ?? 0,
    longitude: place.location?.longitude ?? 0,
    accuracy: null,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  });
  if (!normalized || !place.id) return null;

  const { data, error } = await supabase
    .from("venues")
    .upsert(
      {
        name: normalized.name,
        type: mapGooglePlaceType(place.primaryType),
        city: null,
        geofence_json: {
          center: {
            latitude: normalized.latitude,
            longitude: normalized.longitude,
          },
          radius_meters: normalized.radiusMeters,
          source: "google_places",
        },
        is_active: true,
        google_place_id: place.id,
        source: "google_places",
        source_payload: {
          primaryType: place.primaryType ?? null,
          photoName: place.photos?.[0]?.name ?? null,
        },
        last_verified_at: new Date().toISOString(),
      },
      {
        onConflict: "google_place_id",
      },
    )
    .select("id, name, type, city, geofence_json, google_place_id, source, source_payload")
    .single();

  if (error) {
    console.warn("[location][venues] canonical venue upsert failed", error.message, {
      googlePlaceId: place.id,
      placeName: normalized.name,
    });
    return null;
  }

  return data as DbVenueRow;
}

async function canonicalizeGooglePlaces(places: GooglePlace[], existingVenueRows: DbVenueRow[]) {
  const existingByGooglePlaceId = new Map(
    existingVenueRows
      .filter((venue) => !!venue.google_place_id)
      .map((venue) => [venue.google_place_id as string, venue]),
  );

  const canonicalRows: DbVenueRow[] = [];
  for (const place of places) {
    if (!place.id) continue;
    const existingVenue = existingByGooglePlaceId.get(place.id);
    if (existingVenue) {
      canonicalRows.push(existingVenue);
      continue;
    }

    const createdVenue = await createCanonicalVenueFromGooglePlace(place);
    if (!createdVenue) continue;
    existingByGooglePlaceId.set(place.id, createdVenue);
    canonicalRows.push(createdVenue);
  }

  return canonicalRows;
}

async function lookupGooglePlaces(coords: LocationObjectCoords) {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.info("[location][venues] Google Places key missing, using local fallback catalog");
    return [];
  }

  console.info("[location][venues] querying Google Places", {
    latitude: coords.latitude,
    longitude: coords.longitude,
  });

  const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.location,places.photos.name,places.primaryType",
    },
    body: JSON.stringify({
      includedTypes: SOCIAL_GOOGLE_TYPES,
      maxResultCount: GOOGLE_MAX_RESULTS,
      locationRestriction: {
        circle: {
          center: {
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
          radius: VENUE_SEARCH_RADIUS_METERS,
        },
      },
    }),
  });

  if (!response.ok) {
    console.warn("[location] Google Places lookup failed", response.status);
    return [];
  }

  const payload = (await response.json()) as {
    places?: GooglePlace[];
  };

  return payload.places ?? [];
}

function normalizeCanonicalVenue(
  row: DbVenueRow,
  place: GooglePlace,
  coords: LocationObjectCoords,
): DetectedVenue | null {
  const normalizedFromPlace = normalizeGooglePlace(place, coords);
  if (!normalizedFromPlace) return null;
  return {
    ...normalizedFromPlace,
    id: row.id,
    name: row.name,
    venueType: row.type ?? normalizedFromPlace.venueType,
    radiusMeters:
      typeof row.geofence_json?.radius_meters === "number"
        ? Math.min(row.geofence_json.radius_meters, VENUE_CANDIDATE_MAX_DISTANCE_METERS)
        : normalizedFromPlace.radiusMeters,
    source: "google_places",
  };
}

async function lookupCanonicalizedGoogleVenues(
  coords: LocationObjectCoords,
  existingVenueRows: DbVenueRow[],
) {
  const places = await lookupGooglePlaces(coords);
  const canonicalRows = await canonicalizeGooglePlaces(places, existingVenueRows);
  const canonicalByGooglePlaceId = new Map(
    canonicalRows
      .filter((row) => !!row.google_place_id)
      .map((row) => [row.google_place_id as string, row]),
  );

  const venues = places
    .map((place) => {
      const row = place.id ? canonicalByGooglePlaceId.get(place.id) : null;
      if (!row) return null;
      return normalizeCanonicalVenue(row, place, coords);
    })
    .filter((venue): venue is DetectedVenue => !!venue)
    .filter(
      (venue) =>
        (venue.distanceMeters ?? Number.MAX_SAFE_INTEGER) <= VENUE_CANDIDATE_MAX_DISTANCE_METERS,
    )
    .sort((a, b) => (a.distanceMeters ?? Number.MAX_SAFE_INTEGER) - (b.distanceMeters ?? Number.MAX_SAFE_INTEGER));

  console.info(
    "[location][venues] canonical Google Places candidates",
    venues.length
      ? venues.map((venue) => ({
          venueId: venue.id,
          venueName: venue.name,
          distanceMeters: venue.distanceMeters ? Math.round(venue.distanceMeters) : null,
        }))
      : { result: "none" },
  );

  return venues;
}

function lookupDbVenues(coords: LocationObjectCoords, rows: DbVenueRow[]) {
  const venues = rows
    .map((row) => normalizeDbVenue(row, coords))
    .filter((venue): venue is DetectedVenue => !!venue)
    .sort(
      (a, b) => (a.distanceMeters ?? Number.MAX_SAFE_INTEGER) - (b.distanceMeters ?? Number.MAX_SAFE_INTEGER),
    );

  console.info(
    "[location][venues] Supabase venue candidates",
    venues.length
      ? venues.map((venue) => ({
          venueId: venue.id,
          venueName: venue.name,
          source: venue.source,
          distanceMeters: venue.distanceMeters ? Math.round(venue.distanceMeters) : null,
        }))
      : { result: "none" },
  );

  return venues;
}

function lookupLocalVenues(coords: LocationObjectCoords) {
  const matches = LOCAL_VENUE_CATALOG
    .map((venue) => ({
      ...venue,
      distanceMeters: distanceMeters(coords.latitude, coords.longitude, venue.latitude, venue.longitude),
    }))
    .filter(
      (venue) =>
        (venue.distanceMeters ?? Number.MAX_SAFE_INTEGER) <=
        Math.min(venue.radiusMeters, VENUE_CANDIDATE_MAX_DISTANCE_METERS),
    )
    .sort((a, b) => (a.distanceMeters ?? Number.MAX_SAFE_INTEGER) - (b.distanceMeters ?? Number.MAX_SAFE_INTEGER));

  if (matches.length) {
    console.info(
      "[location][venues] local fallback venues matched",
      matches.map((venue) => ({
        venueId: venue.id,
        venueName: venue.name,
        distanceMeters: venue.distanceMeters ? Math.round(venue.distanceMeters) : null,
      })),
    );
  } else {
    console.info("[location][venues] no local fallback venue matched");
  }

  return matches;
}

function dedupeVenues(venues: DetectedVenue[]) {
  const deduped: DetectedVenue[] = [];
  for (const venue of venues) {
    const existingIndex = deduped.findIndex((current) => isSamePhysicalVenue(current, venue));
    if (existingIndex === -1) {
      deduped.push(venue);
      continue;
    }

    const existing = deduped[existingIndex];
    const shouldReplace =
      (existing.source !== "user_submission" && venue.source === "user_submission") ||
      ((existing.distanceMeters ?? Number.MAX_SAFE_INTEGER) >
        (venue.distanceMeters ?? Number.MAX_SAFE_INTEGER));

    if (shouldReplace) {
      deduped[existingIndex] = venue;
    }
  }
  return deduped.sort(
    (a, b) => (a.distanceMeters ?? Number.MAX_SAFE_INTEGER) - (b.distanceMeters ?? Number.MAX_SAFE_INTEGER),
  );
}

export async function getNearbyVenues(coords: LocationObjectCoords) {
  const activeVenueRows = await fetchActiveVenueRows();
  const dbVenues = lookupDbVenues(coords, activeVenueRows);
  if (dbVenues.length > 0) {
    console.info(
      "[location][venues] using database venues before Google fallback",
      dbVenues.map((venue) => ({
        venueId: venue.id,
        venueName: venue.name,
        distanceMeters: venue.distanceMeters ? Math.round(venue.distanceMeters) : null,
        source: venue.source,
      })),
    );
    return dedupeVenues(dbVenues);
  }

  const googleVenues = await lookupCanonicalizedGoogleVenues(coords, activeVenueRows);
  if (googleVenues.length > 0) return dedupeVenues(googleVenues);

  const fallbackVenues = lookupLocalVenues(coords);
  if (!fallbackVenues.length) {
    console.info("[location][venues] no venue match for current coordinates");
  }
  return dedupeVenues(fallbackVenues);
}

export async function detectVenueFromCoords(coords: LocationObjectCoords, preferredVenueId?: string | null) {
  const venues = await getNearbyVenues(coords);
  if (!venues.length) return null;

  const preferredVenue = preferredVenueId ? venues.find((venue) => venue.id === preferredVenueId) : null;
  const chosenVenue = preferredVenue ?? venues[0];

  console.info("[location][venues] using venue candidate", {
    venueId: chosenVenue.id,
    venueName: chosenVenue.name,
    source: chosenVenue.source,
    distanceMeters: chosenVenue.distanceMeters ? Math.round(chosenVenue.distanceMeters) : null,
    selectedByUser: !!preferredVenue,
  });

  return chosenVenue;
}
