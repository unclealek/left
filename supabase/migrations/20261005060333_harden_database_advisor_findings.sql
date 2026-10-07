begin;
-- Deterministic name resolution for existing pure helpers and timestamp trigger.
alter function public.set_updated_at() set search_path = public, pg_temp;
alter function public.compute_shared_alignment(public.intent_type,text[],public.intent_type,text[]) set search_path = public, pg_temp;
alter function public.derive_energy_level(integer) set search_path = public, pg_temp;
alter function public.normalize_venue_name(text) set search_path = public, pg_temp;
alter function public.venue_distance_meters(double precision,double precision,double precision,double precision) set search_path = public, pg_temp;

-- The existing own-row policy is sufficient; no privileged membership oracle needed.
alter function public.is_admin_reviewer(uuid) security invoker;
revoke all on function public.is_admin_reviewer(uuid) from public, anon;
grant execute on function public.is_admin_reviewer(uuid) to authenticated, service_role;

-- Trigger functions are called by their triggers, never as client RPCs.
revoke all on function public.rls_auto_enable() from public, anon, authenticated;
revoke all on function public.broadcast_venue_presence_change() from public, anon, authenticated;
revoke all on function public.end_active_presence_when_venue_hidden() from public, anon, authenticated;
-- Aggregate is used exclusively by the Edge Function's administrative client.
revoke all on function public.get_left_presence_counts(uuid[]) from public, anon, authenticated;
grant execute on function public.get_left_presence_counts(uuid[]) to service_role;

-- Keep legitimate signed-in RPCs and their existing per-user/reviewer guards.
revoke all on function public.approve_venue_submission(uuid,uuid) from public, anon;
revoke all on function public.reject_venue_submission(uuid) from public, anon;
revoke all on function public.record_current_legal_acceptance(text,text,text) from public, anon;
revoke all on function public.set_experience_attendance(uuid,boolean) from public, anon;
revoke all on function public.get_published_experiences(uuid[]) from public, anon;
grant execute on function public.approve_venue_submission(uuid,uuid), public.reject_venue_submission(uuid),
 public.record_current_legal_acceptance(text,text,text), public.set_experience_attendance(uuid,boolean),
 public.get_published_experiences(uuid[]) to authenticated, service_role;

-- Preserve moderation's cross-user joins without broadening table RLS for clients.
-- Only this guarded function may read the privileged view; schema is not API-exposed.
create schema if not exists moderation_private;
revoke all on schema moderation_private from public, anon, authenticated;
grant usage on schema moderation_private to authenticated;
alter view public.safety_report_review set schema moderation_private;
revoke all on moderation_private.safety_report_review from public, anon, authenticated;
create function moderation_private.read_safety_report_review()
returns setof moderation_private.safety_report_review
language plpgsql stable security definer set search_path = pg_catalog, pg_temp as $$
begin
  if auth.uid() is null or not public.is_admin_reviewer(auth.uid()) then
    return;
  end if;
  return query select * from moderation_private.safety_report_review;
end;
$$;
revoke all on function moderation_private.read_safety_report_review() from public, anon;
grant execute on function moderation_private.read_safety_report_review() to authenticated, service_role;
create view public.safety_report_review with (security_invoker=true) as
 select * from moderation_private.read_safety_report_review();
revoke all on public.safety_report_review from public, anon, authenticated;
grant select on public.safety_report_review to authenticated, service_role;
comment on function moderation_private.read_safety_report_review() is
 'Intentional privileged moderation projection: requires current auth.uid() in admin_reviewers, returns no rows otherwise. Not an exposed RPC schema.';
commit;
