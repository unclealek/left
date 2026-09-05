import { supabase } from "../../lib/supabase";
import type { VenueExperience, VenueType } from "../../types/left-domain";

export type SavedVenueEntry = {
  venueId: string;
  venueName: string;
  venueType: VenueType;
  formattedAddress: string | null;
  savedAt: string;
};

export type ExperienceProposalInput = {
  venueId: string;
  title: string;
  description: string;
  startsAt: string;
  capacity: number;
  accessibilityNotes: string;
  costNotes: string;
};

type SavedVenueRow = {
  venue_id: string;
  created_at: string;
  venues: {
    name?: string | null;
    type?: VenueType | null;
    formatted_address?: string | null;
  } | null;
};

type ExperienceRow = {
  id: string;
  host_user_id: string;
  host_first_name: string;
  venue_id: string;
  venue_name: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string | null;
  capacity: number;
  attendee_count: number;
  viewer_attending: boolean | null;
  accessibility_notes: string;
  cost_notes: string;
};

function isUuid(value: string | null | undefined) {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function fetchSavedVenues(userId: string): Promise<SavedVenueEntry[]> {
  if (!isUuid(userId)) return [];

  const { data, error } = await supabase
    .from("saved_venues")
    .select("venue_id, created_at, venues(name, type, formatted_address)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[discovery] saved venues unavailable", error.message);
    return [];
  }

  return ((data ?? []) as unknown as SavedVenueRow[]).map((row) => ({
    venueId: row.venue_id,
    venueName: row.venues?.name?.trim() || "Saved venue",
    venueType: row.venues?.type ?? "other",
    formattedAddress: row.venues?.formatted_address ?? null,
    savedAt: row.created_at,
  }));
}

export async function setVenueSaved(userId: string, venueId: string, saved: boolean) {
  if (!isUuid(userId) || !isUuid(venueId)) return false;

  const query = saved
    ? supabase.from("saved_venues").upsert({ user_id: userId, venue_id: venueId }, { onConflict: "user_id,venue_id" })
    : supabase.from("saved_venues").delete().eq("user_id", userId).eq("venue_id", venueId);
  const { error } = await query;

  if (error) {
    console.warn("[discovery] saved venue update failed", error.message);
    return false;
  }
  return true;
}

export async function fetchPublishedExperiences(venueIds: string[]): Promise<VenueExperience[]> {
  const safeVenueIds = venueIds.filter(isUuid);
  const { data, error } = await supabase.rpc("get_published_experiences", {
    p_venue_ids: safeVenueIds.length ? safeVenueIds : null,
  });

  if (error) {
    console.warn("[discovery] experiences unavailable", error.message);
    return [];
  }

  return ((data ?? []) as ExperienceRow[]).map((row) => ({
    id: row.id,
    hostUserId: row.host_user_id,
    hostFirstName: row.host_first_name,
    venueId: row.venue_id,
    venueName: row.venue_name,
    title: row.title,
    description: row.description,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    capacity: row.capacity,
    attendeeCount: row.attendee_count,
    viewerAttending: row.viewer_attending ?? false,
    accessibilityNotes: row.accessibility_notes,
    costNotes: row.cost_notes,
  }));
}

export async function setExperienceAttendance(experienceId: string, attending: boolean) {
  if (!isUuid(experienceId)) return null;
  const { data, error } = await supabase.rpc("set_experience_attendance", {
    p_experience_id: experienceId,
    p_attending: attending,
  });
  if (error) {
    console.warn("[discovery] attendance update failed", error.message);
    return null;
  }
  return data === true;
}

export type HostedExperience = {
  id: string;
  title: string;
  starts_at: string;
  status: "draft" | "pending_review" | "published" | "rejected" | "cancelled" | "completed";
};

export async function fetchHostedExperiences(): Promise<HostedExperience[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Sign in again to see your plans.");
  const { data, error } = await supabase.from("experiences")
    .select("id,title,starts_at,status").eq("host_user_id", user.id)
    .order("created_at", { ascending: false }).limit(30);
  if (error) throw new Error("Couldn’t load your plans. Try again.");
  return (data ?? []) as HostedExperience[];
}

export async function submitExperienceProposal(input: ExperienceProposalInput) {
  if (!isUuid(input.venueId)) throw new Error("Choose a verified nearby venue.");
  if (!Number.isFinite(Date.parse(input.startsAt)) || Date.parse(input.startsAt) <= Date.now()) {
    throw new Error("Choose a future start time.");
  }
  const { data, error } = await supabase.rpc("submit_experience_proposal", {
    p_venue_id: input.venueId,
    p_title: input.title.trim(),
    p_description: input.description.trim(),
    p_starts_at: input.startsAt,
    p_capacity: input.capacity,
    p_accessibility_notes: input.accessibilityNotes.trim(),
    p_cost_notes: input.costNotes.trim(),
  });
  if (error) {
    const messages: Record<string, string> = {
      "authentication required": "Sign in again before submitting your plan.",
      "complete your profile before hosting": "Complete your profile before hosting a gathering.",
      "choose an active venue": "This venue is no longer available. Choose another place.",
      "choose a future start time": "Choose a future start time.",
    };
    if (messages[error.message]) throw new Error(messages[error.message]);
    if (error.code === "42501" || error.code === "PGRST301") throw new Error("Your session can’t submit this plan. Sign in again and retry.");
    if (error.code === "23514" || error.code === "23502") throw new Error("Check the title, description, time, and group size before submitting.");
    throw new Error("Couldn’t submit your plan. Please try again.");
  }
  if (!data) throw new Error("The server did not confirm submission. Please check your plans before retrying.");
  return data as string;
}
