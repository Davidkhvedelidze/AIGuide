insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('scan-images', 'scan-images', false, 5242880, array['image/jpeg'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.scan_history
  add column if not exists image_path text,
  add column if not exists locale text not null default 'en',
  add column if not exists confidence double precision check (confidence is null or (confidence >= 0 and confidence <= 1)),
  add column if not exists is_uncertain boolean not null default true,
  add column if not exists result jsonb;

create index if not exists scan_history_created_at_idx on public.scan_history (created_at desc);
