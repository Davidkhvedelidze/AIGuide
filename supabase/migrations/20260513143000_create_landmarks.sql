create schema if not exists extensions;
create extension if not exists postgis with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.landmarks (
  id text primary key,
  slug text not null unique,
  name text not null,
  city text not null,
  region text not null,
  country text not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  location geography(point, 4326) generated always as (extensions.ST_SetSRID(extensions.ST_MakePoint(longitude, latitude), 4326)::geography) stored,
  radius_meters integer not null default 700 check (radius_meters > 0),
  category text not null,
  short_description text not null,
  full_story text not null,
  interesting_facts text[] not null default '{}',
  historical_context text not null default '',
  best_time_to_visit text not null,
  average_visit_duration text not null,
  nearby_place_ids text[] not null default '{}',
  recommended_next_place_ids text[] not null default '{}',
  image_urls text[] not null default '{}',
  reference_image_urls text[] not null default '{}',
  languages text[] not null default '{en}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.landmark_translations (
  id uuid primary key default extensions.gen_random_uuid(),
  landmark_id text not null references public.landmarks(id) on delete cascade,
  locale text not null,
  name text not null,
  short_description text not null,
  full_story text not null,
  interesting_facts text[] not null default '{}',
  historical_context text not null default '',
  best_time_to_visit text not null,
  average_visit_duration text not null,
  source_attribution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (landmark_id, locale)
);

create table if not exists public.scan_history (
  id uuid primary key default extensions.gen_random_uuid(),
  device_id text,
  landmark_id text references public.landmarks(id) on delete set null,
  scan_source text not null default 'nearby',
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  distance_meters double precision check (distance_meters is null or distance_meters >= 0),
  created_at timestamptz not null default now()
);

create index if not exists landmarks_location_gix on public.landmarks using gist (location);
create index if not exists landmarks_city_category_idx on public.landmarks (city, category);
create index if not exists landmarks_slug_idx on public.landmarks (slug);
create index if not exists landmark_translations_landmark_locale_idx on public.landmark_translations (landmark_id, locale);
create index if not exists scan_history_landmark_created_at_idx on public.scan_history (landmark_id, created_at desc);
create index if not exists scan_history_device_created_at_idx on public.scan_history (device_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists landmarks_set_updated_at on public.landmarks;
create trigger landmarks_set_updated_at
before update on public.landmarks
for each row
execute function public.set_updated_at();

drop trigger if exists landmark_translations_set_updated_at on public.landmark_translations;
create trigger landmark_translations_set_updated_at
before update on public.landmark_translations
for each row
execute function public.set_updated_at();

create or replace function public.get_nearby_landmarks(
  input_lat double precision,
  input_lng double precision,
  radius_meters integer default 700
)
returns table (
  id text,
  slug text,
  name text,
  city text,
  region text,
  country text,
  latitude double precision,
  longitude double precision,
  radius_meters integer,
  category text,
  short_description text,
  full_story text,
  interesting_facts text[],
  historical_context text,
  best_time_to_visit text,
  average_visit_duration text,
  nearby_place_ids text[],
  recommended_next_place_ids text[],
  image_urls text[],
  reference_image_urls text[],
  languages text[],
  created_at timestamptz,
  updated_at timestamptz,
  distance_meters double precision
)
language sql
stable
set search_path = public, extensions
as $$
  with user_position as (
    select ST_SetSRID(ST_MakePoint(input_lng, input_lat), 4326)::geography as point
  )
  select
    l.id,
    l.slug,
    l.name,
    l.city,
    l.region,
    l.country,
    l.latitude,
    l.longitude,
    l.radius_meters,
    l.category,
    l.short_description,
    l.full_story,
    l.interesting_facts,
    l.historical_context,
    l.best_time_to_visit,
    l.average_visit_duration,
    l.nearby_place_ids,
    l.recommended_next_place_ids,
    l.image_urls,
    l.reference_image_urls,
    l.languages,
    l.created_at,
    l.updated_at,
    ST_Distance(l.location, user_position.point) as distance_meters
  from public.landmarks l
  cross join user_position
  where ST_DWithin(l.location, user_position.point, $3)
  order by distance_meters asc;
$$;

alter table public.landmarks enable row level security;
alter table public.landmark_translations enable row level security;
alter table public.scan_history enable row level security;

grant execute on function public.get_nearby_landmarks(double precision, double precision, integer) to anon, authenticated;

drop policy if exists "Public landmarks are readable" on public.landmarks;
create policy "Public landmarks are readable"
on public.landmarks for select
to anon, authenticated
using (true);

drop policy if exists "Public landmark translations are readable" on public.landmark_translations;
create policy "Public landmark translations are readable"
on public.landmark_translations for select
to anon, authenticated
using (true);

drop policy if exists "Anon clients can create scan history" on public.scan_history;
create policy "Anon clients can create scan history"
on public.scan_history for insert
to anon, authenticated
with check (true);

insert into public.landmarks (
  id, slug, name, city, region, country, latitude, longitude, radius_meters, category,
  short_description, full_story, interesting_facts, historical_context, best_time_to_visit,
  average_visit_duration, nearby_place_ids, recommended_next_place_ids, image_urls,
  reference_image_urls, languages
)
values
('narikala-fortress','narikala-fortress','Narikala Fortress','Tbilisi','Tbilisi Old Town','Georgia',41.6886,44.8086,700,'historical','Ancient hilltop fortress overlooking Old Tbilisi and the Mtkvari River.','Narikala Fortress is one of Tbilisi''s oldest defensive landmarks, with origins tied to the city''s early fortified settlement. Its weathered walls trace the ridge above Abanotubani and give visitors a clear sense of why this river valley mattered strategically for centuries.',array['The fortress walls frame some of the city''s most recognizable views.','It is often visited together with Mother of Georgia and the botanical garden.'],'The fortress reflects centuries of Persian, Arab, Mongol, and Georgian influence over Tbilisi''s strategic river valley.','Sunset for panoramic city views','45–60 minutes',array['mother-of-georgia','sulfur-baths','leghvtakhevi-waterfall'],array['mother-of-georgia','sulfur-baths'],array[]::text[],array[]::text[],array['en','ka']),
('sulfur-baths','sulfur-baths','Sulfur Baths','Tbilisi','Abanotubani','Georgia',41.6879,44.8114,700,'food','Historic domed bathhouses built around Tbilisi''s natural hot sulfur springs.','The Abanotubani sulfur baths are closely tied to Tbilisi''s origin story and remain a living wellness tradition in the old city. Their brick domes and tiled entrances mark a district where travelers and locals have gathered for rest, bathing, and conversation.',array['The district name Abanotubani means bath district.','The brick domes are visible at street level.'],'Thermal springs helped shape Tbilisi''s identity as a crossroads for travelers, merchants, and local social life.','Morning or evening for a calmer visit','30–90 minutes',array['leghvtakhevi-waterfall','narikala-fortress','shardeni-street'],array['leghvtakhevi-waterfall','shardeni-street'],array[]::text[],array[]::text[],array['en','ka']),
('metekhi-church','metekhi-church','Metekhi Church','Tbilisi','Avlabari','Georgia',41.6901,44.8112,700,'church','Cliffside church and equestrian monument facing Old Tbilisi.','Metekhi Church stands above the Mtkvari River on a historic site associated with royal and religious life in medieval Tbilisi. The terrace gives a memorable view back toward Narikala, Abanotubani, and the layered roofs of the old city.',array['Its terrace offers a classic view toward Narikala.','The site has been rebuilt and repurposed through different eras.'],'Metekhi connects Tbilisi''s royal, ecclesiastical, and defensive history at a prominent river crossing.','Late afternoon for soft light over Old Tbilisi','25–40 minutes',array['rike-park','peace-bridge','sulfur-baths'],array['rike-park','peace-bridge'],array[]::text[],array[]::text[],array['en','ka']),
('peace-bridge','peace-bridge','Peace Bridge','Tbilisi','Old Tbilisi','Georgia',41.6930,44.8084,700,'viewpoint','Contemporary pedestrian bridge linking Old Tbilisi with Rike Park.','The Peace Bridge adds a modern architectural layer to Tbilisi''s historic riverfront and connects key walking routes between the old town and Rike Park. Its glass-and-steel canopy makes it one of the city''s most recognizable newer landmarks.',array['The bridge is illuminated at night.','Its glass-and-steel form contrasts with nearby older districts.'],'The bridge symbolizes post-Soviet urban renewal and Tbilisi''s mix of old and new cityscapes.','Evening when the bridge lights turn on','15–25 minutes',array['rike-park','anchiskhati-basilica','metekhi-church'],array['rike-park','anchiskhati-basilica'],array[]::text[],array[]::text[],array['en','ka']),
('rike-park','rike-park','Rike Park','Tbilisi','Avlabari','Georgia',41.6941,44.8107,700,'nature','Modern riverside park and cable car gateway near the Old Town.','Rike Park is a landscaped public space used for walks, family visits, and access to the cable car toward Narikala. It works well as a gentle pause between riverfront architecture, the Peace Bridge, and Avlabari viewpoints.',array['It is one of the easiest places to begin an Old Tbilisi walking route.','The cable car station is nearby.'],'The park is part of modern riverfront redevelopment that improved pedestrian access around central Tbilisi.','Late afternoon for a relaxed walk','30–45 minutes',array['peace-bridge','metekhi-church','sameba-cathedral'],array['peace-bridge','sameba-cathedral'],array[]::text[],array[]::text[],array['en','ka']),
('mother-of-georgia','mother-of-georgia','Mother of Georgia','Tbilisi','Sololaki Ridge','Georgia',41.6881,44.8046,700,'viewpoint','Iconic hilltop statue symbolizing Georgian hospitality and resilience.','Mother of Georgia, also known as Kartlis Deda, watches over Tbilisi from the ridge above the Old Town. The monument is a simple but powerful stop when walking between Narikala and the Sololaki viewpoints.',array['The statue holds a bowl for guests and a sword for enemies.','It is close to Narikala Fortress.'],'The monument expresses a modern national symbol within a landscape shaped by much older defensive landmarks.','Clear mornings or sunset','20–35 minutes',array['narikala-fortress','leghvtakhevi-waterfall'],array['narikala-fortress'],array[]::text[],array[]::text[],array['en','ka']),
('sameba-cathedral','sameba-cathedral','Sameba Cathedral','Tbilisi','Avlabari','Georgia',41.6977,44.8166,900,'church','Large Orthodox cathedral visible from many points across Tbilisi.','Sameba Cathedral is one of the city''s most prominent religious landmarks and a major feature of the modern skyline. The cathedral complex includes open plazas and gardens that make the scale of the building especially clear.',array['Its scale makes it a useful orientation point.','The cathedral complex includes gardens and open plazas.'],'The cathedral represents modern Georgian Orthodox architecture and the country''s religious identity after independence.','Morning for quieter grounds','45–75 minutes',array['rike-park','metekhi-church'],array['rike-park'],array[]::text[],array[]::text[],array['en','ka']),
('freedom-square','freedom-square','Freedom Square','Tbilisi','City Center','Georgia',41.6934,44.8015,700,'museum','Central city square close to museums, Rustaveli Avenue, and Old Town streets.','Freedom Square is a civic crossroads that anchors central Tbilisi and connects several cultural walking routes. It is a practical starting point for museums, Rustaveli Avenue, Sololaki, and the lanes leading back toward Old Tbilisi.',array['The square has carried different names across political eras.','It is a practical starting point for museums and Old Town walks.'],'The square''s changing symbols reflect Georgia''s imperial, Soviet, and independent periods.','Midday as a route starting point','15–30 minutes',array['anchiskhati-basilica','shardeni-street','peace-bridge'],array['anchiskhati-basilica','shardeni-street'],array[]::text[],array[]::text[],array['en','ka']),
('anchiskhati-basilica','anchiskhati-basilica','Anchiskhati Basilica','Tbilisi','Old Tbilisi','Georgia',41.6956,44.8065,700,'church','One of Tbilisi''s oldest surviving churches, tucked into the historic center.','Anchiskhati Basilica preserves an early Christian architectural presence within the dense fabric of Old Tbilisi. Its modest scale makes the church feel intimate despite its importance to the city''s religious heritage.',array['Its modest exterior contrasts with its historical importance.','It is easy to combine with a Peace Bridge walk.'],'The basilica is associated with the early medieval Christian development of the city.','Morning for a quiet visit','20–30 minutes',array['peace-bridge','freedom-square','shardeni-street'],array['peace-bridge','freedom-square'],array[]::text[],array[]::text[],array['en','ka']),
('shardeni-street','shardeni-street','Shardeni Street','Tbilisi','Old Tbilisi','Georgia',41.6918,44.8076,700,'food','Lively pedestrian street known for cafes, restaurants, and Old Town nightlife.','Shardeni Street is a compact social corridor where visitors often pause between historic stops for food and drinks. The surrounding lanes make it easy to continue toward the riverfront, sulfur baths, or Freedom Square.',array['It is close to both the sulfur baths and the riverfront.','The street is busiest in the evening.'],'The area reflects Old Tbilisi''s long role as a meeting place for trade, hospitality, and urban culture.','Evening for dining atmosphere','30–90 minutes',array['sulfur-baths','anchiskhati-basilica','freedom-square'],array['sulfur-baths','peace-bridge'],array[]::text[],array[]::text[],array['en','ka']),
('mtatsminda-park','mtatsminda-park','Mtatsminda Park','Tbilisi','Mtatsminda','Georgia',41.6959,44.7851,1200,'viewpoint','Hilltop park with broad city views above central Tbilisi.','Mtatsminda Park combines panoramic viewpoints, leisure spaces, and a classic funicular approach above the city. It is farther from the Old Town core but rewards visitors with one of Tbilisi''s widest urban views.',array['It offers one of the widest views of Tbilisi.','The funicular route is part of the experience.'],'The mountain has long shaped Tbilisi''s skyline and recreational culture.','Sunset or evening city lights','1.5–3 hours',array['freedom-square'],array['freedom-square'],array[]::text[],array[]::text[],array['en','ka']),
('leghvtakhevi-waterfall','leghvtakhevi-waterfall','Leghvtakhevi Waterfall','Tbilisi','Abanotubani','Georgia',41.6867,44.8098,700,'nature','Small canyon waterfall hidden behind the sulfur bath district.','Leghvtakhevi Waterfall is a compact natural stop that adds a quiet canyon walk to an Old Tbilisi route. The path feels tucked away despite being only minutes from Abanotubani''s bathhouses.',array['It is minutes from the bathhouses.','The canyon path feels surprisingly tucked away from busy streets.'],'The waterfall and gorge show the natural terrain around which the old city developed.','Daytime after visiting Abanotubani','20–35 minutes',array['sulfur-baths','narikala-fortress','mother-of-georgia'],array['sulfur-baths','narikala-fortress'],array[]::text[],array[]::text[],array['en','ka'])
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  city = excluded.city,
  region = excluded.region,
  country = excluded.country,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  radius_meters = excluded.radius_meters,
  category = excluded.category,
  short_description = excluded.short_description,
  full_story = excluded.full_story,
  interesting_facts = excluded.interesting_facts,
  historical_context = excluded.historical_context,
  best_time_to_visit = excluded.best_time_to_visit,
  average_visit_duration = excluded.average_visit_duration,
  nearby_place_ids = excluded.nearby_place_ids,
  recommended_next_place_ids = excluded.recommended_next_place_ids,
  image_urls = excluded.image_urls,
  reference_image_urls = excluded.reference_image_urls,
  languages = excluded.languages;
