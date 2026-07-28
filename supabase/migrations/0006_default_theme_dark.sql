-- Brand launches dark-first
alter table public.site_settings
  alter column default_theme set default 'dark';

update public.site_settings
set default_theme = 'dark'
where default_theme = 'system';
