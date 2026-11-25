-- Family circle: private links for grandparents and family (see docs/CLOUD-SETUP.md).
-- Run once in Supabase: Dashboard > SQL Editor > New query > paste this whole file > Run.
-- Safe to run again. Needs supabase/schema.sql to have been run first.
--
-- How it stays private:
--   * Each link is a long random code (64 characters). Only someone with the link can use it.
--   * With a link, the family can only (1) read the summary the parent chose to share, and
--     (2) send a recording into the parent's inbox. They can't list, read or change anything else.
--   * Turning a link off (revoked) stops it at once. Deleting the parent's account removes everything.

create table if not exists public.family_links (
  token text primary key check (char_length(token) >= 48),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null default '' check (char_length(name) <= 60),
  created_at timestamptz not null default now(),
  revoked boolean not null default false
);

-- What the family sees: her week, her words and her books, published by the parent's phone.
create table if not exists public.family_shares (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  summary jsonb not null,
  updated_at timestamptz not null default now()
);

-- Recordings the family sent, waiting for the parent's phone to pick them up.
create table if not exists public.family_inbox (
  id uuid primary key default gen_random_uuid(),
  token text not null references public.family_links (token) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('word', 'message')),
  word text check (word is null or char_length(word) <= 80),
  lang text check (lang is null or lang in ('ar', 'en')),
  from_name text not null default '',
  path text not null,
  created_at timestamptz not null default now()
);

alter table public.family_links enable row level security;
alter table public.family_shares enable row level security;
alter table public.family_inbox enable row level security;

drop policy if exists "Parents manage their family links" on public.family_links;
create policy "Parents manage their family links" on public.family_links
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Parents manage what the family sees" on public.family_shares;
create policy "Parents manage what the family sees" on public.family_shares
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Parents read and clear their family inbox" on public.family_inbox;
create policy "Parents read and clear their family inbox" on public.family_inbox
  for select to authenticated
  using (user_id = auth.uid());
drop policy if exists "Parents clear their family inbox" on public.family_inbox;
create policy "Parents clear their family inbox" on public.family_inbox
  for delete to authenticated
  using (user_id = auth.uid());

-- A link is usable (exists and isn't turned off). Runs with the owner's rights so a family member
-- can check their own link without being able to read the table.
create or replace function public.family_link_ok(p_token text) returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.family_links where token = p_token and not revoked);
$$;

-- The family's view: the link's name and the shared summary. Nothing else.
create or replace function public.family_view(p_token text) returns jsonb
language sql security definer set search_path = public stable as $$
  select jsonb_build_object('name', l.name, 'summary', s.summary, 'updated_at', s.updated_at)
  from public.family_links l
  join public.family_shares s on s.user_id = l.user_id
  where l.token = p_token and not l.revoked;
$$;

-- A recording from the family: only into this link's own folder, at most 30 a day per link.
create or replace function public.family_send(p_token text, p_kind text, p_word text, p_lang text, p_path text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid;
  v_name text;
  v_id uuid;
begin
  select user_id, name into v_user, v_name from public.family_links where token = p_token and not revoked;
  if v_user is null then
    raise exception 'This family link is not active';
  end if;
  if p_path not like p_token || '/%' then
    raise exception 'Wrong folder';
  end if;
  if (select count(*) from public.family_inbox where token = p_token and created_at > now() - interval '1 day') >= 30 then
    raise exception 'Too many recordings today';
  end if;
  insert into public.family_inbox (token, user_id, kind, word, lang, from_name, path)
  values (p_token, v_user, p_kind, p_word, p_lang, v_name, p_path)
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.family_link_ok(text) from public;
revoke all on function public.family_view(text) from public;
revoke all on function public.family_send(text, text, text, text, text) from public;
grant execute on function public.family_link_ok(text) to anon, authenticated;
grant execute on function public.family_view(text) to anon, authenticated;
grant execute on function public.family_send(text, text, text, text, text) to anon, authenticated;

-- The family's recordings: a private folder per link, audio only, up to 5 MB each.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('family-inbox', 'family-inbox', false, 5242880, array['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/aac', 'audio/x-m4a'])
on conflict (id) do nothing;

drop policy if exists "Family send recordings with their link" on storage.objects;
create policy "Family send recordings with their link" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'family-inbox' and public.family_link_ok((storage.foldername(name))[1]));

drop policy if exists "Parents read their family recordings" on storage.objects;
create policy "Parents read their family recordings" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'family-inbox'
    and exists (select 1 from public.family_links l where l.token = (storage.foldername(name))[1] and l.user_id = auth.uid())
  );

drop policy if exists "Parents clear their family recordings" on storage.objects;
create policy "Parents clear their family recordings" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'family-inbox'
    and exists (select 1 from public.family_links l where l.token = (storage.foldername(name))[1] and l.user_id = auth.uid())
  );
