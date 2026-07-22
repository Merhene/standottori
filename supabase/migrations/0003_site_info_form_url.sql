-- Artist booking / intake form URL shown on the Contact page
alter table public.site_info
  add column if not exists form_url text;
