-- Biography page images: two fixed layout slots + carousel collection.
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- or via `supabase db push` if you use the Supabase CLI.

-- Two fixed image slots on the biography row (top row / bottom row of the page)
alter table public.biography
  add column if not exists image_top_path text,
  add column if not exists image_bottom_path text;

-- Allow 'biography' as a gallery category (feeds the two carousel lines)
alter table public.gallery_images
  drop constraint if exists gallery_images_category_check;

alter table public.gallery_images
  add constraint gallery_images_category_check
  check (category in ('tattoo', 'flash', 'wallpaper', 'biography'));
