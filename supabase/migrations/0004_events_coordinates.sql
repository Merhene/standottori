-- Event map pins: optional coordinates (events without coords stay list-only)
alter table public.events
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

comment on column public.events.latitude is 'WGS84 latitude for the events map pin';
comment on column public.events.longitude is 'WGS84 longitude for the events map pin';
