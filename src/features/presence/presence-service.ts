import { supabase } from "../../lib/supabase";
import type {
  DistanceBucket,
  EnergyLevel,
  IntentType,
  NearbyFeedItem,
  VenueContextSummary,
} from "../../types/left-domain";

export type ActivePresenceSession = {
  id: string;
  venueId: string;
  venueName: string | null;
  intent: IntentType;
  vibes: string[];
  hintText: string | null;
  startedAt: string;
  expiresAt: string;
  durationMinutes: number;
};

type PresenceSessionRow = {
  id: string;
  venue_id: string;
  intent: IntentType;
  vibes: string[];
  hint_text: string | null;
  started_at: string;
  expires_at: string;
  status: string;
  venues?: { name?: string | null } | null;
};

type VenueContextSummaryRow = {
  venue_id: string;
  venue_name: string;
  visible_count: number;
  energy_level: EnergyLevel;
  active_vibes: string[];
  popular_intents: IntentType[];
  pulse_copy: string | null;
};

type NearbyFeedRow = {
  profile_user_id: string;
  presence_session_id: string;
  first_name: string;
  intent: IntentType;
  hint_text: string | null;
  primary_vibe: string | null;
  session_duration_remaining: string | Record<string, number> | null;
  distance_bucket: DistanceBucket;
  venue_name: string;
  energy_level: EnergyLevel;
  session_expires_at: string;
};

function isUuid(value: string | null | undefined) {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function fetchActivePresenceSession(userId: string): Promise<ActivePresenceSession | null> {
  if (!isUuid(userId)) return null;

  const { data, error } = await supabase
    .from("presence_sessions")
    .select("id, venue_id, intent, vibes, hint_text, started_at, expires_at, status, venues(name)")
    .eq("user_id", userId)
    .is("ended_at", null)
    .gt("expires_at", new Date().toISOString())
    .in("status", ["visible", "discoverable", "expiring"])
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn("[presence] active session recovery failed", error.message);
    return null;
  }

  const activeSession = data as PresenceSessionRow | null;
  if (!activeSession) return null;

  const durationMinutes = Math.max(
    1,
    Math.round((new Date(activeSession.expires_at).getTime() - new Date(activeSession.started_at).getTime()) / 60_000),
  );

  return {
    id: activeSession.id,
    venueId: activeSession.venue_id,
    venueName: activeSession.venues?.name ?? null,
    intent: activeSession.intent,
    vibes: activeSession.vibes,
    hintText: activeSession.hint_text,
    startedAt: activeSession.started_at,
    expiresAt: activeSession.expires_at,
    durationMinutes,
  };
}

export async function endOpenPresenceSessionsForUser(userId: string) {
  if (!isUuid(userId)) return false;

  const { error } = await supabase
    .from("presence_sessions")
    .update({ status: "session_ended", ended_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("ended_at", null)
    .in("status", ["activating", "visible", "discoverable", "expiring", "paused"]);

  if (error) {
    console.warn("[presence] open session cleanup failed", error.message);
    return false;
  }

  return true;
}

export async function createPresenceSession(input: {
  userId: string;
  venueId: string;
  intent: IntentType;
  vibes: string[];
  hintText: string | null;
  startedAt: string;
  expiresAt: string;
}) {
  if (!isUuid(input.userId) || !isUuid(input.venueId)) return null;

  const { data, error } = await supabase
    .from("presence_sessions")
    .insert({
      user_id: input.userId,
      venue_id: input.venueId,
      intent: input.intent,
      vibes: input.vibes,
      hint_text: input.hintText,
      status: "visible",
      prompt_state: "none",
      started_at: input.startedAt,
      expires_at: input.expiresAt,
    })
    .select("id")
    .single();

  if (error) {
    console.warn("[presence] session create failed", error.message);
    return null;
  }

  return data.id as string;
}

export async function updatePresenceSessionEndState(sessionId: string, status: "paused" | "session_ended") {
  if (!isUuid(sessionId)) return false;

  const endedAt = new Date().toISOString();
  const { error } = await supabase
    .from("presence_sessions")
    .update({
      status,
      paused_at: status === "paused" ? endedAt : null,
      ended_at: status === "session_ended" ? endedAt : null,
    })
    .eq("id", sessionId);

  if (error) {
    console.warn("[presence] session end update failed", error.message);
    return false;
  }

  return true;
}

export async function fetchVenueContextSummary(venueId: string): Promise<VenueContextSummary | null> {
  if (!isUuid(venueId)) return null;

  const { data, error } = await supabase
    .from("venue_context_summary")
    .select("venue_id, venue_name, visible_count, energy_level, active_vibes, popular_intents, pulse_copy")
    .eq("venue_id", venueId)
    .maybeSingle();

  if (error) {
    console.warn("[presence] venue context refresh failed", error.message);
    return null;
  }

  const context = data as VenueContextSummaryRow | null;
  if (!context) return null;

  return {
    venueId: context.venue_id,
    venueName: context.venue_name,
    visibleCount: context.visible_count,
    energyLevel: context.energy_level,
    activeVibes: context.active_vibes,
    popularIntents: context.popular_intents,
    pulseCopy: context.pulse_copy ?? "No pulse yet.",
  };
}

export async function fetchNearbyFeed(userId: string, venueId: string): Promise<NearbyFeedItem[]> {
  if (!isUuid(userId) || !isUuid(venueId)) return [];

  const { data, error } = await supabase.rpc("get_nearby_feed", {
    p_viewer_user_id: userId,
    p_venue_id: venueId,
  });

  if (error) {
    console.warn("[presence] nearby feed refresh failed", error.message);
    return [];
  }

  return ((data ?? []) as NearbyFeedRow[]).map(mapNearbyFeedRow);
}

function mapNearbyFeedRow(row: NearbyFeedRow): NearbyFeedItem {
  return {
    profileUserId: row.profile_user_id,
    presenceSessionId: row.presence_session_id,
    firstName: row.first_name,
    intent: row.intent,
    hintText: row.hint_text,
    primaryVibe: row.primary_vibe,
    sessionDurationRemaining: formatIntervalValue(row.session_duration_remaining),
    distanceBucket: row.distance_bucket,
    venueName: row.venue_name,
    energyLevel: row.energy_level,
    sessionExpiresAt: row.session_expires_at,
  };
}

function formatIntervalValue(value: NearbyFeedRow["session_duration_remaining"]) {
  if (!value) return "00:00:00";
  if (typeof value === "string") return value;

  const hours = value.hours ?? 0;
  const minutes = value.minutes ?? 0;
  const seconds = Math.floor(value.seconds ?? 0);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
