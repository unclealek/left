import { supabase } from "../../lib/supabase";
import type { SocialInteractionEventType } from "../../types/left-domain";

export type SocialMomentumState = "observing" | "warming_up" | "engaging" | "connected";

export type SocialMomentumViewModel = {
  state: SocialMomentumState;
  title: string;
  body: string;
  primaryLabel: string;
};

type SocialMomentumEventRow = {
  event_type: SocialInteractionEventType;
};

function isUuid(value: string | null | undefined) {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function deriveSocialMomentum(input: {
  sessionVisible: boolean;
  elapsedSessionSeconds: number;
  eventTypes: SocialInteractionEventType[];
}): SocialMomentumViewModel | null {
  const { elapsedSessionSeconds, eventTypes, sessionVisible } = input;
  if (!sessionVisible) return null;
  if (eventTypes.includes("prompt_dismissed")) return null;
  if (eventTypes.includes("user_blocked") || eventTypes.includes("user_reported")) return null;

  const profileViews = eventTypes.filter((eventType) => eventType === "profile_viewed").length;
  const hasDirectAction = eventTypes.some((eventType) => eventType === "approach_started");
  const hasConnected = eventTypes.includes("approach_connected");
  let state: SocialMomentumState = "observing";
  if (hasConnected) state = "connected";
  else if (hasDirectAction) state = "engaging";
  else if (profileViews > 0) state = "warming_up";

  if (state === "connected") {
    return {
      state,
      title: "You made a connection.",
      body: "Stay present and keep safety controls close if anything feels off.",
      primaryLabel: "Open nearby feed",
    };
  }

  if (state === "engaging") {
    return {
      state,
      title: "You’re engaging.",
      body: "You’ve already made a small move. Keep going at your own pace.",
      primaryLabel: "View people",
    };
  }

  if (state === "warming_up") {
    return {
      state,
      title: "You’re warming up.",
      body: "You’ve been checking people out. Open a profile when someone feels worth approaching.",
      primaryLabel: "View people",
    };
  }

  if (elapsedSessionSeconds < 120) return null;
  return {
    state,
    title: "You’re mostly observing.",
    body: "Want to make a small move? Browse the room and approach when someone feels right.",
    primaryLabel: "View people",
  };
}

export async function fetchSocialMomentumEvents(actorUserId: string, visibilitySessionId: string) {
  if (!isUuid(actorUserId) || !isUuid(visibilitySessionId)) return [];

  const { data, error } = await supabase
    .from("social_interaction_events")
    .select("event_type")
    .eq("actor_user_id", actorUserId)
    .eq("visibility_session_id", visibilitySessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("[social-momentum] event refresh failed", error.message);
    return [];
  }

  return ((data ?? []) as SocialMomentumEventRow[]).map((row) => row.event_type);
}

export async function recordSocialInteractionEvent(input: {
  actorUserId: string;
  eventType: SocialInteractionEventType;
  targetUserId?: string | null;
  visibilitySessionId?: string | null;
  venueId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  if (!isUuid(input.actorUserId)) return false;

  const { error } = await supabase.from("social_interaction_events").insert({
    actor_user_id: input.actorUserId,
    target_user_id: isUuid(input.targetUserId) ? input.targetUserId : null,
    venue_id: isUuid(input.venueId) ? input.venueId : null,
    visibility_session_id: isUuid(input.visibilitySessionId) ? input.visibilitySessionId : null,
    event_type: input.eventType,
    metadata: input.metadata ?? {},
  });

  if (error) {
    console.warn("[social-momentum] event insert failed", error.message);
    return false;
  }

  return true;
}
