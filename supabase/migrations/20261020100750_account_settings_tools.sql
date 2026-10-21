begin;
-- Narrow wrappers are exposed; privileged implementations live outside the API schema.
-- Export only records owned/submitted by the caller, never incoming reports,
-- other people's profiles, contact exchanges, auth tokens or moderation notes.
create or replace function security_private.export_my_data(p_category text, p_offset integer default 0)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_table text;
  v_owner text;
  v_rows jsonb;
begin
  perform security_private.require_active_account();
  if exists (select 1 from auth.users where id = v_user and is_anonymous) then raise exception 'member account required' using errcode = '42501'; end if;
  if v_user is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_offset is null or p_offset < 0 or p_offset > 10000000 then raise exception 'invalid offset'; end if;
  select t, c into v_table, v_owner from (values
    ('profile', 'users', 'id'),
    ('presence', 'presence_sessions', 'user_id'),
    ('prompts', 'prompt_events', 'user_id'),
    ('approaches', 'approach_attempts', 'from_user_id'),
    ('waves_sent', 'waves', 'from_user_id'),
    ('contact_choices', 'contact_exchange_intents', 'user_id'),
    ('reports_submitted', 'reports', 'actor_user_id'),
    ('removal_requests', 'identity_removal_requests', 'user_id'),
    ('saved_places', 'saved_venues', 'user_id'),
    ('gatherings_hosted', 'experiences', 'host_user_id'),
    ('gatherings_joined', 'experience_attendees', 'user_id'),
    ('venue_preferences', 'venue_preferences', 'user_id'),
    ('legal_acknowledgements', 'legal_acceptances', 'user_id'),
    ('hidden_people', 'hidden_users', 'actor_user_id'),
    ('blocked_people', 'blocks', 'actor_user_id'),
    ('social_interactions', 'social_interaction_events', 'actor_user_id'),
    ('safety_zones', 'safety_zones', 'user_id')
  ) as categories(category, t, c) where category = p_category;
  if v_table is null then raise exception 'invalid category'; end if;
  -- Stable ordering across pages; identifiers come exclusively from the fixed map.
  execute format($export$select coalesce(jsonb_agg(item), '[]'::jsonb) from
    (select to_jsonb(r) - 'reviewed_by' - 'reviewer_id' - 'review_notes' - 'moderation_notes' - 'failure_reason' as item from public.%I r where %I = $1
     order by to_jsonb(r)::text limit 500 offset $2) page$export$, v_table, v_owner)
    into v_rows using v_user, p_offset;
  return v_rows;
end;
$$;
revoke all on function security_private.export_my_data(text, integer) from public, anon;
grant execute on function security_private.export_my_data(text, integer) to authenticated;
create or replace function public.export_my_data(p_category text, p_offset integer default 0)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select security_private.export_my_data(p_category, p_offset);
$$;
revoke all on function public.export_my_data(text, integer) from public, anon;
grant execute on function public.export_my_data(text, integer) to authenticated;
commit;
