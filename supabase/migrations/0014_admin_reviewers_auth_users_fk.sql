alter table public.admin_reviewers
drop constraint if exists admin_reviewers_user_id_fkey;

alter table public.admin_reviewers
add constraint admin_reviewers_user_id_fkey
foreign key (user_id)
references auth.users(id)
on delete cascade;
