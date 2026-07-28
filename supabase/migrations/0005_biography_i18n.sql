-- Bilingual biography (FR / EN). Existing title/content become the French source.

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
