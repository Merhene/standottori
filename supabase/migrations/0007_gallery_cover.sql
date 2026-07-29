-- Gallery hub covers (Book / Flash panels on /gallery)
alter table public.gallery_images
  drop constraint if exists gallery_images_category_check;

alter table public.gallery_images
  add constraint gallery_images_category_check
  check (category in ('tattoo', 'flash', 'wallpaper', 'biography', 'cover'));
