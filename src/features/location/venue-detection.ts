import type { LocationObjectCoords } from "expo-location";

export type DetectedVenue = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  source: "google_places" | "local_catalog";
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

const LOCAL_VENUE_CATALOG: DetectedVenue[] = [
  {
    id: "venue-regatta",
    name: "Café Regatta",
    latitude: 60.1536,
    longitude: 24.9136,
    radiusMeters: 120,
    source: "local_catalog",
  },
];

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number) {
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

function normalizeGooglePlace(place: {
  id?: string;
  displayName?: { text?: string };
  location?: { latitude?: number; longitude?: number };
}): DetectedVenue | null {
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
  };
}

async function lookupGooglePlaces(coords: LocationObjectCoords) {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.location",
    },
    body: JSON.stringify({
      includedTypes: SOCIAL_GOOGLE_TYPES,
      maxResultCount: 1,
      locationRestriction: {
        circle: {
          center: {
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
          radius: 75,
        },
      },
    }),
  });

  if (!response.ok) {
    console.warn("[location] Google Places lookup failed", response.status);
    return null;
  }

  const payload = (await response.json()) as { places?: Array<Record<string, unknown>> };
  const place = payload.places?.[0] as
    | {
        id?: string;
        displayName?: { text?: string };
        location?: { latitude?: number; longitude?: number };
      }
    | undefined;
  return place ? normalizeGooglePlace(place) : null;
}

function lookupLocalVenue(coords: LocationObjectCoords) {
  for (const venue of LOCAL_VENUE_CATALOG) {
    const distance = distanceMeters(coords.latitude, coords.longitude, venue.latitude, venue.longitude);
    if (distance <= venue.radiusMeters) return venue;
  }
  return null;
}

export async function detectVenueFromCoords(coords: LocationObjectCoords) {
  const googleVenue = await lookupGooglePlaces(coords);
  if (googleVenue) return googleVenue;
  return lookupLocalVenue(coords);
}
