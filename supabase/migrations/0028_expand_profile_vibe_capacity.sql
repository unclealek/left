-- Profile interests become the user's available visibility vibes. Keep both
-- arrays aligned with the complete current catalogue (12 choices).
alter table public.users
  drop constraint if exists users_default_vibes_check,
  drop constraint if exists users_interests_limit;

alter table public.users
  add constraint users_default_vibes_limit
    check (cardinality(default_vibes) <= 12),
  add constraint users_interests_limit
    check (cardinality(interests) <= 12);
