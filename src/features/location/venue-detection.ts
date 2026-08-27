import type { LocationObjectCoords } from "expo-location";
import { supabase } from "../../lib/supabase";
import type { VenueType } from "../../types/left-domain";
import { fetchNearbyVenuesFromServer } from "./nearby-venues-service";
import {
  isVenueWithinConfirmationRange,
  VENUE_CONFIRMATION_MAX_DISTANCE_METERS,
  VENUE_DISCOVERY_RADIUS_METERS,
} from "./venue-distance-policy";

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

const VENUE_SEARCH_RADIUS_METERS = VENUE_DISCOVERY_RADIUS_METERS;
const VENUE_CANDIDATE_MAX_DISTANCE_METERS = VENUE_CONFIRMATION_MAX_DISTANCE_METERS;
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
  const serverVenues = await fetchNearbyVenuesFromServer(coords, VENUE_SEARCH_RADIUS_METERS);
  if (serverVenues.length > 0) {
    const normalizedServerVenues: DetectedVenue[] = serverVenues.map((venue) => ({
      ...venue,
      venueType: venue.venueType ?? "other",
      photoUrl: venue.photoUrl ?? null,
    }));
    console.info(
      "[location][venues] using nearby-venues edge function",
      normalizedServerVenues.map((venue) => ({
        venueId: venue.id,
        venueName: venue.name,
        distanceMeters: venue.distanceMeters ? Math.round(venue.distanceMeters) : null,
        source: venue.source,
      })),
    );
    return dedupeVenues(normalizedServerVenues);
  }

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

  console.info("[location][venues] no confirmed venue match for current coordinates");
  return [];
}

export async function detectVenueFromCoords(
  coords: LocationObjectCoords,
  preferredVenueId?: string | null,
  discoveredVenues?: DetectedVenue[],
) {
  const venues = discoveredVenues ?? await getNearbyVenues(coords);
  const confirmableVenues = venues.filter(isVenueWithinConfirmationRange);
  if (!confirmableVenues.length) {
    console.info("[location][venues] nearby venues require user confirmation", {
      discoveredCount: venues.length,
    });
    return null;
  }

  const preferredVenue = preferredVenueId
    ? confirmableVenues.find((venue) => venue.id === preferredVenueId)
    : null;
  const chosenVenue = preferredVenue ?? confirmableVenues[0];

  console.info("[location][venues] using venue candidate", {
    venueId: chosenVenue.id,
    venueName: chosenVenue.name,
    source: chosenVenue.source,
    distanceMeters: chosenVenue.distanceMeters ? Math.round(chosenVenue.distanceMeters) : null,
    selectedByUser: !!preferredVenue,
  });

  return chosenVenue;
}
