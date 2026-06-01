import { supabase } from "../../lib/supabase";
import type { ReportCategory } from "../../types/left-domain";

function isUuid(value: string | null | undefined): value is string {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function sendWaveToUser(input: {
  fromUserId: string;
  toUserId: string;
  presenceSessionId: string;
}) {
  if (!isUuid(input.fromUserId) || !isUuid(input.toUserId) || !isUuid(input.presenceSessionId)) return false;

  const { error } = await supabase
    .from("waves")
    .upsert(
      {
        from_user_id: input.fromUserId,
        to_user_id: input.toUserId,
        presence_session_id: input.presenceSessionId,
        status: "sent",
      },
      { onConflict: "from_user_id,to_user_id,presence_session_id" },
    );

  if (error) {
    console.warn("[interactions] wave send failed", error.message);
    return false;
  }

  return true;
}

export async function createApproachAttempt(input: {
  fromUserId: string;
  toUserId: string;
  presenceSessionId: string;
  startedAt: string;
  expiresAt: string;
}) {
  if (!isUuid(input.fromUserId) || !isUuid(input.toUserId) || !isUuid(input.presenceSessionId)) return null;

  const { data, error } = await supabase
    .from("approach_attempts")
    .insert({
      from_user_id: input.fromUserId,
      to_user_id: input.toUserId,
      presence_session_id: input.presenceSessionId,
      status: "started",
      started_at: input.startedAt,
      expires_at: input.expiresAt,
    })
    .select("id")
    .single();

  if (error) {
    console.warn("[interactions] approach create failed", error.message);
    return null;
  }

  return data.id as string;
}

export async function markApproachConnected(input: {
  approachId: string;
  completedAt: string;
}) {
  if (!isUuid(input.approachId)) return false;

  const { error } = await supabase
    .from("approach_attempts")
    .update({ status: "connected", completed_at: input.completedAt })
    .eq("id", input.approachId);

  if (error) {
    console.warn("[interactions] approach connected update failed", error.message);
    return false;
  }

  return true;
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
