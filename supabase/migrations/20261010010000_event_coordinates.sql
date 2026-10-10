-- Optional map point for an event (picked on the map in the admin).
-- Both coordinates are set together, or both are empty.

alter table public.events
  add column latitude double precision,
  add column longitude double precision;

alter table public.events
  add constraint events_coordinates_valid check (
    (latitude is null and longitude is null)
    or (latitude between -90 and 90 and longitude between -180 and 180)
  );
