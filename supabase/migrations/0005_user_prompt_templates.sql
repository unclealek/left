alter table public.users
add column if not exists profile_prompt text not null default 'Ask what they''re building right now, not what they do generally.'
check (char_length(trim(profile_prompt)) between 1 and 160),
add column if not exists approach_prompt text not null default 'What are you working on that feels genuinely exciting?'
check (char_length(trim(approach_prompt)) between 1 and 160);
