alter table public.scan_history
  add column if not exists ai_response jsonb;
