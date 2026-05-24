import type { LocationObjectCoords } from "expo-location";
import { supabase } from "../../lib/supabase";

export type DetectedVenue = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  source: "google_places" | "local_catalog" | "user_submission";
  distanceMeters: number | null;
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

const LOCAL_VENUE_CATALOG: DetectedVenue[] = [
  {
    id: "venue-regatta",
    name: "Café Regatta",
    latitude: 60.1536,
    longitude: 24.9136,
    radiusMeters: 120,
    source: "local_catalog",
    distanceMeters: null,
  },
];

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

function normalizeGooglePlace(
  place: {
    id?: string;
    displayName?: { text?: string };
    location?: { latitude?: number; longitude?: number };
  },
  coords: LocationObjectCoords,
): DetectedVenue | null {
  const id = place.id;
  const name = place.displayName?.text;
  const latitude = place.location?.latitude;
  const longitude = place.location?.longitude;
  if (!id || !name || typeof latitude !== "number" || typeof longitude !== "number") return null;
  return {
    id,
    name,
    latitude,
    longitude,
    radiusMeters: 120,
    source: "google_places",
    distanceMeters: distanceMeters(coords.latitude, coords.longitude, latitude, longitude),
  };
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
  row: {
    id: string;
    name: string;
    geofence_json: VenueGeofenceJson | null;
  },
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
    latitude,
    longitude,
    radiusMeters,
    source: row.geofence_json?.source === "user_submission" ? "user_submission" : "local_catalog",
    distanceMeters: venueDistanceMeters,
  };
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
      "X-Goog-FieldMask": "places.id,places.displayName,places.location",
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
    places?: Array<{
      id?: string;
      displayName?: { text?: string };
      location?: { latitude?: number; longitude?: number };
    }>;
  };

  const venues = (payload.places ?? [])
    .map((place) => normalizeGooglePlace(place, coords))
    .filter((venue): venue is DetectedVenue => !!venue)
    .filter(
      (venue) =>
        (venue.distanceMeters ?? Number.MAX_SAFE_INTEGER) <= VENUE_CANDIDATE_MAX_DISTANCE_METERS,
    )
    .sort((a, b) => (a.distanceMeters ?? Number.MAX_SAFE_INTEGER) - (b.distanceMeters ?? Number.MAX_SAFE_INTEGER));

  console.info(
    "[location][venues] Google Places candidates",
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

async function lookupDbVenues(coords: LocationObjectCoords) {
  const { data, error } = await supabase
    .from("venues")
    .select("id, name, geofence_json")
    .eq("is_active", true)
    .limit(100);

  if (error) {
    console.warn("[location][venues] Supabase venue lookup failed", error.message);
    return [];
  }

  const venues = (data ?? [])
    .map((row) =>
      normalizeDbVenue(
        row as {
          id: string;
          name: string;
          geofence_json: VenueGeofenceJson | null;
        },
        coords,
      ),
    )
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
  const dbVenues = await lookupDbVenues(coords);
  const googleVenues = await lookupGooglePlaces(coords);
  const mergedNetworkVenues = dedupeVenues([...dbVenues, ...googleVenues]);
  if (mergedNetworkVenues.length > 0) return mergedNetworkVenues;

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
