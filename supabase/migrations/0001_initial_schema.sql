-- Standottori schema (idempotent: safe to re-run entirely)
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- or via `supabase db push` if you use the Supabase CLI.

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('tattoo', 'flash', 'wallpaper', 'biography')),
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
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

create index if not exists events_date_idx on public.events (event_date desc);

-- Single-row tables (id constrained to 1)
create table if not exists public.biography (
  id integer primary key default 1 check (id = 1),
  title text,
  content text,
  title_fr text,
  title_en text,
  content_fr text,
  content_en text,
  photo_path text,
  image_top_path text,
  image_bottom_path text,
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
  form_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  default_theme text not null default 'dark' check (default_theme in ('light', 'dark', 'system')),
  lockscreen_enabled boolean not null default true,
  seo_title text,
  seo_description text,
  seo_keywords text,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Upgrades for databases created with an earlier version
-- (no-ops on a fresh install)
-- ============================================================

-- Biography page: two fixed image slots (top / bottom rows)
alter table public.biography
  add column if not exists image_top_path text,
  add column if not exists image_bottom_path text;

-- Biography FR / EN text (legacy title/content remain as French mirrors)
alter table public.biography
  add column if not exists title_fr text,
  add column if not exists title_en text,
  add column if not exists content_fr text,
  add column if not exists content_en text;

update public.biography
set
  title_fr = coalesce(title_fr, title),
  content_fr = coalesce(content_fr, content)
where title_fr is null or content_fr is null;

-- Contact page: artist intake / booking form URL
alter table public.site_info
  add column if not exists form_url text;

-- Events map pins (WGS84)
alter table public.events
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

comment on column public.events.latitude is 'WGS84 latitude for the events map pin';
comment on column public.events.longitude is 'WGS84 longitude for the events map pin';

-- Allow 'biography' as a gallery category (feeds the carousel lines)
alter table public.gallery_images
  drop constraint if exists gallery_images_category_check;

alter table public.gallery_images
  add constraint gallery_images_category_check
  check (category in ('tattoo', 'flash', 'wallpaper', 'biography'));

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
drop policy if exists "Public read gallery_images" on public.gallery_images;
create policy "Public read gallery_images" on public.gallery_images for select using (true);
drop policy if exists "Public read events" on public.events;
create policy "Public read events" on public.events for select using (true);
drop policy if exists "Public read biography" on public.biography;
create policy "Public read biography" on public.biography for select using (true);
drop policy if exists "Public read site_info" on public.site_info;
create policy "Public read site_info" on public.site_info for select using (true);
drop policy if exists "Public read site_settings" on public.site_settings;
create policy "Public read site_settings" on public.site_settings for select using (true);

-- Admin (any authenticated user) write access.
-- This site has a single admin account created manually in the dashboard;
-- sign-ups must be disabled (Dashboard > Authentication > Providers > Email > disable sign-ups).
drop policy if exists "Admin write gallery_images" on public.gallery_images;
create policy "Admin write gallery_images" on public.gallery_images
  for all to authenticated using (true) with check (true);
drop policy if exists "Admin write events" on public.events;
create policy "Admin write events" on public.events
  for all to authenticated using (true) with check (true);
drop policy if exists "Admin write biography" on public.biography;
create policy "Admin write biography" on public.biography
  for all to authenticated using (true) with check (true);
drop policy if exists "Admin write site_info" on public.site_info;
create policy "Admin write site_info" on public.site_info
  for all to authenticated using (true) with check (true);
drop policy if exists "Admin write site_settings" on public.site_settings;
create policy "Admin write site_settings" on public.site_settings
  for all to authenticated using (true) with check (true);

-- ============================================================
-- Storage: public "gallery" bucket
-- ============================================================

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

drop policy if exists "Public read gallery bucket" on storage.objects;
create policy "Public read gallery bucket" on storage.objects
  for select using (bucket_id = 'gallery');

drop policy if exists "Admin insert gallery bucket" on storage.objects;
create policy "Admin insert gallery bucket" on storage.objects
  for insert to authenticated with check (bucket_id = 'gallery');

drop policy if exists "Admin update gallery bucket" on storage.objects;
create policy "Admin update gallery bucket" on storage.objects
  for update to authenticated using (bucket_id = 'gallery');

drop policy if exists "Admin delete gallery bucket" on storage.objects;
create policy "Admin delete gallery bucket" on storage.objects
  for delete to authenticated using (bucket_id = 'gallery');
