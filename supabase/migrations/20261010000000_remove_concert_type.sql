-- Remove the 'concert' event type: concerts are rare and go under 'altul' (other).
-- Postgres cannot drop an enum value, so the type is recreated without it.

update public.events set type = 'altul' where type = 'concert';

alter type public.event_type rename to event_type_old;

create type public.event_type as enum (
  'altul', 'curs', 'encuentro', 'festival',
  'maraton', 'milonga', 'practica', 'workshop'
);

alter table public.events
  alter column type type public.event_type using type::text::public.event_type;

drop type public.event_type_old;
