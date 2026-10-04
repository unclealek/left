import { supabase } from "../../lib/supabase";
import type { VenueActivityEnvelope } from "./activity-types";

type VenueActivityResponse = {
  venues?: VenueActivityEnvelope[];
};

export async function fetchVenueActivity(venueIds: string[]): Promise<VenueActivityEnvelope[]> {
  if (!venueIds.length) return [];
  if (venueIds.length > 10) {
    const results: VenueActivityEnvelope[] = [];
    for (let start = 0; start < venueIds.length; start += 10) {
      results.push(...await fetchVenueActivity(venueIds.slice(start, start + 10)));
    }
    return results;
  }

  const { data, error } = await supabase.functions.invoke<VenueActivityResponse>("venue-activity", {
    body: { venueIds },
  });

  if (error) {
    console.warn("[activity] venue-activity invoke failed", error.message);
    return [];
  }

  return data?.venues ?? [];
}
