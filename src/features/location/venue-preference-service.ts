import { supabase } from "../../lib/supabase";
import type { VenuePreference } from "./location-storage";

type VenuePreferenceRow = {
  venue_id: string;
  venue_name: string;
  hidden: boolean;
  muted: boolean;
  cooldown_until: string | null;
  updated_at: string;
};

function isUuid(value: string | null | undefined) {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function mapVenuePreference(row: VenuePreferenceRow): VenuePreference {
  return {
    venueId: row.venue_id,
    venueName: row.venue_name,
    hidden: row.hidden,
    muted: row.muted,
    cooldownUntil: row.cooldown_until,
    updatedAt: row.updated_at,
  };
}

export async function fetchVenuePreferencesForUser(userId: string) {
  if (!isUuid(userId)) return null;

  const { data, error } = await supabase
    .from("venue_preferences")
    .select("venue_id, venue_name, hidden, muted, cooldown_until, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.warn("[venue-preferences] fetch failed", error.message);
    return null;
  }

  return Object.fromEntries(
    ((data ?? []) as VenuePreferenceRow[]).map((row) => [row.venue_id, mapVenuePreference(row)]),
  ) as Record<string, VenuePreference>;
}

export async function upsertVenuePreferenceForUser(input: {
  userId: string;
  venueId: string;
  venueName: string;
  hidden?: boolean;
  muted?: boolean;
  cooldownUntil?: string | null;
}) {
  if (!isUuid(input.userId) || !isUuid(input.venueId)) return null;

  const { data, error } = await supabase
    .from("venue_preferences")
    .upsert(
      {
        user_id: input.userId,
        venue_id: input.venueId,
        venue_name: input.venueName,
        ...(input.hidden === undefined ? {} : { hidden: input.hidden }),
        ...(input.muted === undefined ? {} : { muted: input.muted }),
        ...(input.cooldownUntil === undefined ? {} : { cooldown_until: input.cooldownUntil }),
      },
      { onConflict: "user_id,venue_id" },
    )
    .select("venue_id, venue_name, hidden, muted, cooldown_until, updated_at")
    .single();

  if (error) {
    console.warn("[venue-preferences] upsert failed", error.message);
    return null;
  }

  return mapVenuePreference(data as VenuePreferenceRow);
}
