import { supabase } from "../../lib/supabase";
import type { ReportCategory } from "../../types/left-domain";

function isUuid(value: string | null | undefined): value is string {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function createApproachAttempt(input: {
  presenceSessionId: string;
}) {
  if (!isUuid(input.presenceSessionId)) return null;

  const { data, error } = await supabase
    .rpc("start_approach_attempt", { p_presence_session_id: input.presenceSessionId });

  if (error) {
    console.warn("[interactions] approach create failed", error.message);
    return null;
  }

  const attempt = Array.isArray(data) ? data[0] : data;
  return attempt?.approach_id as string | null;
}

export async function markApproachConnected(input: { approachId: string; completedAt: string }) {
  if (!isUuid(input.approachId)) return false;

  const { data, error } = await supabase.rpc("finish_approach_attempt", {
    p_approach_id: input.approachId,
    p_status: "connected",
  });

  if (error) {
    console.warn("[interactions] approach connected update failed", error.message);
    return false;
  }

  return Boolean(data);
}

async function markApproachFinished(input: {
  approachId: string;
  status: "cancelled" | "expired";
  finishedAt: string;
}) {
  if (!isUuid(input.approachId)) return false;

  const { data, error } = await supabase.rpc("finish_approach_attempt", {
    p_approach_id: input.approachId,
    p_status: input.status,
  });

  if (error) {
    console.warn(`[interactions] approach ${input.status} update failed`, error.message);
    return false;
  }

  return Boolean(data);
}

export function markApproachCancelled(input: { approachId: string; cancelledAt: string }) {
  return markApproachFinished({
    approachId: input.approachId,
    status: "cancelled",
    finishedAt: input.cancelledAt,
  });
}

export function markApproachExpired(input: { approachId: string; expiredAt: string }) {
  return markApproachFinished({
    approachId: input.approachId,
    status: "expired",
    finishedAt: input.expiredAt,
  });
}

export async function hideUserForActor(input: {
  actorUserId: string;
  targetUserId: string;
}) {
  if (!isUuid(input.actorUserId) || !isUuid(input.targetUserId)) return false;

  const { error } = await supabase
    .from("hidden_users")
    .upsert(
      { actor_user_id: input.actorUserId, target_user_id: input.targetUserId },
      { onConflict: "actor_user_id,target_user_id" },
    );

  if (error) {
    console.warn("[interactions] hide user failed", error.message);
    return false;
  }

  return true;
}

export async function blockUserForActor(input: {
  actorUserId: string;
  targetUserId: string;
  reason: string;
}) {
  if (!isUuid(input.actorUserId) || !isUuid(input.targetUserId)) return false;

  const { error } = await supabase
    .from("blocks")
    .upsert(
      {
        actor_user_id: input.actorUserId,
        target_user_id: input.targetUserId,
        reason: input.reason,
      },
      { onConflict: "actor_user_id,target_user_id" },
    );

  if (error) {
    console.warn("[interactions] block user failed", error.message);
    return false;
  }

  return true;
}

export async function reportUserForActor(input: {
  actorUserId: string;
  targetUserId: string;
  presenceSessionId: string | null;
  category: ReportCategory;
  notes: string | null;
}) {
  if (!isUuid(input.actorUserId) || !isUuid(input.targetUserId)) return false;

  const { error } = await supabase.from("reports").insert({
    actor_user_id: input.actorUserId,
    target_user_id: input.targetUserId,
    presence_session_id: isUuid(input.presenceSessionId) ? input.presenceSessionId : null,
    category: input.category,
    notes: input.notes?.trim() || null,
  });

  if (error) {
    console.warn("[interactions] report user failed", error.message);
    return false;
  }

  return true;
}
