import type { LocationObjectCoords } from "expo-location";
import { supabase } from "../../lib/supabase";
import type { RuntimeVenueCandidate } from "./location-storage";

type NearbyVenueResponse = {
  venues?: Array<{
    id: string;
    googlePlaceId: string | null;
    name: string;
    venueType?: RuntimeVenueCandidate["venueType"];
    latitude: number;
    longitude: number;
    radiusMeters: number;
    source: RuntimeVenueCandidate["source"];
    distanceMetres: number | null;
    formattedAddress?: string | null;
  }>;
};

export async function fetchNearbyVenuesFromServer(
  coords: LocationObjectCoords,
  radiusMetres = 100,
): Promise<RuntimeVenueCandidate[]> {
  const { data, error } = await supabase.functions.invoke<NearbyVenueResponse>("nearby-venues", {
    body: {
      latitude: coords.latitude,
      longitude: coords.longitude,
      radiusMetres,
    },
  });

  if (error) {
    console.warn("[location][venues] nearby-venues invoke failed", error.message);
    return [];
  }

  return (data?.venues ?? []).map((venue) => ({
    id: venue.id,
    name: venue.name,
    venueType: venue.venueType ?? "other",
    latitude: venue.latitude,
    longitude: venue.longitude,
    radiusMeters: venue.radiusMeters,
    source: venue.source,
    distanceMeters: venue.distanceMetres,
    photoUrl: null,
    formattedAddress: venue.formattedAddress ?? null,
  }));
}
