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
  const proposedGeofenceJson = {
    center: {
      latitude: input.latitude,
      longitude: input.longitude,
    },
    radius_meters: 60,
    source: "user_submission",
  };

  const { data: submission, error: submissionError } = await supabase
    .from("venue_submissions")
    .insert({
      submitted_by: input.submittedBy,
      name: input.name,
      type: input.type,
      address_text: input.addressText,
      notes: input.notes,
      proposed_geofence_json: proposedGeofenceJson,
      status: "pending",
    })
    .select("id")
    .single();

  if (submissionError || !submission) return null;

  const { data: canonicalVenue, error: canonicalVenueError } = await supabase
    .from("venues")
    .insert({
      name: input.name,
      type: input.type,
      city: null,
      geofence_json: proposedGeofenceJson,
      is_active: true,
      source: "manual",
      source_payload: {
        addressText: input.addressText,
        notes: input.notes,
        submittedBy: input.submittedBy,
        submissionId: submission.id,
      },
      last_verified_at: new Date().toISOString(),
    })
    .select("id, name")
    .single();

  if (canonicalVenueError || !canonicalVenue) return null;

  return {
    id: canonicalVenue.id as string,
    name: canonicalVenue.name as string,
  };
}
