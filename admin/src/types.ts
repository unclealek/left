export type VenueType =
  | "cafe"
  | "library"
  | "coworking_space"
  | "airport"
  | "gym"
  | "university"
  | "other";

export type VenueSubmissionStatus = "pending" | "approved" | "rejected" | "duplicate";

export type VenueSubmission = {
  id: string;
  submitted_by: string;
  name: string;
  type: VenueType;
  address_text: string;
  notes: string | null;
  proposed_geofence_json: Record<string, unknown>;
  status: VenueSubmissionStatus;
  matched_venue_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Venue = {
  id: string;
  name: string;
  type: VenueType;
  city: string | null;
  geofence_json: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
