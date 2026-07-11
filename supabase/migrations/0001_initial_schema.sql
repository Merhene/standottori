-- Standottori initial schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- or via `supabase db push` if you use the Supabase CLI.

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('tattoo', 'flash', 'wallpaper')),
  storage_path text not null unique,
  title text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists gallery_images_category_idx
  on public.gallery_images (category, sort_order);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  location text,
  description text,
  status text not null default 'upcoming' check (status in ('upcoming', 'past', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists events_date_idx on public.events (event_date desc);

-- Single-row tables (id constrained to 1)
create table if not exists public.biography (
  id integer primary key default 1 check (id = 1),
  title text,
  content text,
  photo_path text,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_info (
  id integer primary key default 1 check (id = 1),
  email text,
  phone text,
  address text,
  instagram_url text,
  youtube_url text,
  tiktok_url text,
  opening_hours text,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  default_theme text not null default 'system' check (default_theme in ('light', 'dark', 'system')),
  lockscreen_enabled boolean not null default true,
  seo_title text,
  seo_description text,
  seo_keywords text,
  updated_at timestamptz not null default now()
);

-- Seed the single-row tables
insert into public.biography (id) values (1) on conflict (id) do nothing;
insert into public.site_info (id) values (1) on conflict (id) do nothing;
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- ============================================================
-- Row Level Security: public read, authenticated (admin) write
-- ============================================================

alter table public.gallery_images enable row level security;
alter table public.events enable row level security;
alter table public.biography enable row level security;
alter table public.site_info enable row level security;
alter table public.site_settings enable row level security;

-- Public read access
create policy "Public read gallery_images" on public.gallery_images for select using (true);
create policy "Public read events" on public.events for select using (true);
create policy "Public read biography" on public.biography for select using (true);
create policy "Public read site_info" on public.site_info for select using (true);
create policy "Public read site_settings" on public.site_settings for select using (true);

-- Admin (any authenticated user) write access.
-- This site has a single admin account created manually in the dashboard;
-- sign-ups must be disabled (Dashboard > Authentication > Providers > Email > disable sign-ups).
create policy "Admin write gallery_images" on public.gallery_images
  for all to authenticated using (true) with check (true);
create policy "Admin write events" on public.events
  for all to authenticated using (true) with check (true);
create policy "Admin write biography" on public.biography
  for all to authenticated using (true) with check (true);
create policy "Admin write site_info" on public.site_info
  for all to authenticated using (true) with check (true);
create policy "Admin write site_settings" on public.site_settings
  for all to authenticated using (true) with check (true);

-- ============================================================
-- Storage: public "gallery" bucket
-- ============================================================

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "Public read gallery bucket" on storage.objects
  for select using (bucket_id = 'gallery');

create policy "Admin insert gallery bucket" on storage.objects
  for insert to authenticated with check (bucket_id = 'gallery');

create policy "Admin update gallery bucket" on storage.objects
  for update to authenticated using (bucket_id = 'gallery');

create policy "Admin delete gallery bucket" on storage.objects
  for delete to authenticated using (bucket_id = 'gallery');
