import { supabase } from "../../lib/supabase";
import type { VenueType } from "../../types/left-domain";

export async function submitVenueForReview(input: {
  submittedBy: string;
  name: string;
  type: VenueType;
  addressText: string;
  notes: string | null;
  latitude: number;
  longitude: number;
}) {
  const { data, error } = await supabase
    .from("venue_submissions")
    .insert({
      submitted_by: input.submittedBy,
      name: input.name,
      type: input.type,
      address_text: input.addressText,
      notes: input.notes,
      proposed_geofence_json: {
        center: {
          latitude: input.latitude,
          longitude: input.longitude,
        },
        radius_meters: 60,
        source: "user_submission",
      },
      status: "pending",
    })
    .select("id, name")
    .single();

  if (error || !data) return null;

  return {
    id: data.id as string,
    name: data.name as string,
  };
}
