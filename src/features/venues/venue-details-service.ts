import { supabase } from "../../lib/supabase";
import type { RuntimeVenueCandidate } from "../location/location-storage";

type VenueDetailsResponse = Pick<
  RuntimeVenueCandidate,
  | "photo"
  | "formattedAddress"
  | "websiteUri"
  | "phoneNumber"
  | "rating"
  | "userRatingCount"
  | "priceLevel"
  | "businessStatus"
  | "openingHours"
  | "accessibilityOptions"
> & { venueId?: string };

function isUuid(value: string | null | undefined) {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function fetchVenuePracticalDetails(venueId: string): Promise<VenueDetailsResponse | null> {
  if (!isUuid(venueId)) return null;
  const { data, error } = await supabase.functions.invoke<VenueDetailsResponse>("venue-details", {
    body: { venueId },
  });
  if (error) {
    console.warn("[venues] venue details unavailable", error.message);
    return null;
  }
  return data ?? null;
}
