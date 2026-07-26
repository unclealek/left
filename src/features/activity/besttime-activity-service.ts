import { supabase } from "../../lib/supabase";
import type { VenueActivityEnvelope } from "./activity-types";

type VenueActivityResponse = {
  venues?: VenueActivityEnvelope[];
};

export async function fetchVenueActivity(venueIds: string[]) {
  if (!venueIds.length) return [];

  const { data, error } = await supabase.functions.invoke<VenueActivityResponse>("venue-activity", {
    body: { venueIds },
  });

  if (error) {
    console.warn("[activity] venue-activity invoke failed", error.message);
    return [];
  }

  return data?.venues ?? [];
}

export async function initializeBestTimeVenue(venueId: string) {
  const { data, error } = await supabase.functions.invoke("initialize-besttime-venue", {
    body: { venueId },
  });

  if (error) {
    console.warn("[activity] initialize-besttime-venue invoke failed", error.message);
    return null;
  }

  return data;
}
