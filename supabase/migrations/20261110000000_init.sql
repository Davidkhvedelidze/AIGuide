-- AI Tour Guide: initial schema.
-- Content (places) is public read-only; everything a user owns is protected by RLS.

-- Supabase keeps extensions in the `extensions` schema, which is on the default search_path.
create extension if not exists postgis with schema extensions;

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------

create table public.places (
  id           text primary key,
  slug         text not null unique,
  lat          double precision not null check (lat between -90 and 90),
  lng          double precision not null check (lng between -180 and 180),
  geog         geography(Point, 4326)
                 generated always as (st_setsrid(st_makepoint(lng, lat), 4326)::geography) stored,
  category     text not null check (category in ('landmark', 'church', 'museum', 'hidden_gem')),
  period       text not null,
  -- Only verified places are visible to the app. An editor flips this after review.
  verified     boolean not null default false,
  photo_url    text,
  photo_credit text,
  -- [{ "text": "...", "source": "https://..." }]  Every story must be built from these.
  facts        jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint photo_needs_credit check (photo_url is null or photo_credit is not null)
);

create index places_geog_idx on public.places using gist (geog);

create table public.place_translations (
  place_id   text not null references public.places (id) on delete cascade,
  locale     text not null check (locale in ('en', 'ka')),
  name       text not null,
  summary    text not null,
  story      text not null,
  highlights jsonb not null default '[]'::jsonb,
  audio_url  text,
  primary key (place_id, locale)
);

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------

create table public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  -- Written only by the RevenueCat webhook (service role). Never trusted from the client.
  is_pro         boolean not null default false,
  pro_expires_at timestamptz,
  created_at     timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.saved_places (
  user_id    uuid not null references auth.users (id) on delete cascade,
  place_id   text not null references public.places (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

create table public.collections (
  id         text primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 40),
  place_ids  text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index collections_user_idx on public.collections (user_id);

-- One row per scan attempt. Written only by the `scan` edge function.
create table public.scans (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  place_id   text references public.places (id) on delete set null,
  status     text not null check (status in ('recognized', 'candidates', 'not_recognized')),
  confidence real,
  lat        double precision,
  lng        double precision,
  created_at timestamptz not null default now()
);

create index scans_user_created_idx on public.scans (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.places             enable row level security;
alter table public.place_translations enable row level security;
alter table public.profiles           enable row level security;
alter table public.saved_places       enable row level security;
alter table public.collections        enable row level security;
alter table public.scans              enable row level security;

create policy "verified places are public"
  on public.places for select
  to anon, authenticated
  using (verified);

create policy "translations of verified places are public"
  on public.place_translations for select
  to anon, authenticated
  using (exists (select 1 from public.places p where p.id = place_id and p.verified));

create policy "users read their own profile"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "users manage their saved places"
  on public.saved_places for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "users manage their collections"
  on public.collections for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "users read their own scans"
  on public.scans for select
  to authenticated
  using (user_id = (select auth.uid()));

-- No insert/update/delete policies on places, place_translations, profiles or scans:
-- only the service role (edge functions, content scripts) can write them.

-- ---------------------------------------------------------------------------
-- Functions
-- ---------------------------------------------------------------------------

-- Verified places within `radius_m` of a point, nearest first.
create function public.nearby_places(
  p_lat double precision,
  p_lng double precision,
  radius_m integer default 500,
  max_results integer default 8
)
returns table (id text, name text, summary text, distance_m double precision)
language sql
stable
set search_path = public, extensions
as $$
  select p.id,
         t.name,
         t.summary,
         st_distance(p.geog, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography) as distance_m
  from places p
  join place_translations t on t.place_id = p.id and t.locale = 'en'
  where p.verified
    and st_dwithin(p.geog, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography, radius_m)
  order by distance_m
  limit least(max_results, 20);
$$;

-- Lets a signed-in user remove their account and everything that references it.
create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
grant execute on function public.nearby_places(double precision, double precision, integer, integer) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage: narrated audio, public read
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('audio', 'audio', true)
on conflict (id) do nothing;
