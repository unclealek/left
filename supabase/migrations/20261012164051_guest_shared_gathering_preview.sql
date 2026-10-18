-- Public, read-only preview by exact gathering ID. No member/profile enumeration.
create or replace function public.get_shared_gathering(p_experience_id uuid)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'id',e.id,'venueId',e.venue_id,'venueName',v.name,
    'title',e.title,'description',e.description,'startsAt',e.starts_at,'endsAt',e.ends_at,
    'capacity',e.capacity,'attendeeCount',(select count(*) from public.experience_attendees a where a.experience_id=e.id),
    'accessibilityNotes',e.accessibility_notes,'costNotes',e.cost_notes
  ) from public.experiences e
  join public.venues v on v.id=e.venue_id
  join public.users u on u.id=e.host_user_id
  where e.id=p_experience_id and e.status='published' and e.starts_at>now()
    and v.is_active and not u.identity_removed and u.onboarding_completed;
$$;
revoke all on function public.get_shared_gathering(uuid) from public;
grant execute on function public.get_shared_gathering(uuid) to anon, authenticated;
comment on function public.get_shared_gathering(uuid) is
'Guest preview of one reviewed future gathering. Omits host identity and participant identities; provides no mutations or catalog listing.';
