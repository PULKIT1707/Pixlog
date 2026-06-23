-- Gallery table: stores pixel art submissions for public display
create table if not exists public.gallery (
  id           uuid primary key default gen_random_uuid(),
  username     text not null,
  avatar_url   text,
  repo_name    text not null,
  repo_url     text not null,
  art_label    text not null,
  grid_data    jsonb not null,   -- { "week:day": intensity } for client-side preview
  year         integer not null,
  commit_count integer not null default 0,
  featured     boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table public.gallery enable row level security;

create policy "Anyone can view gallery"
  on public.gallery for select using (true);

create policy "Authenticated users can insert"
  on public.gallery for insert with check (true);

create index if not exists gallery_created_at
  on public.gallery (created_at desc);
