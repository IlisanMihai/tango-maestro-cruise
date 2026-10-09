-- Stage 1: events + staff profiles, with Row Level Security.
-- Run with `supabase db push` or paste into the Supabase SQL editor.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
-- Stored in alphabetical order; the UI shows them alphabetically with 'altul' last.
create type public.event_type as enum (
  'altul', 'concert', 'curs', 'encuentro', 'festival',
  'maraton', 'milonga', 'practica', 'workshop'
);
create type public.event_status as enum ('draft', 'published');
create type public.staff_role as enum ('admin', 'editor');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
-- Translatable text: a JSON object keyed by ro/en/hu/es/sk, string values, 'ro' required.
create or replace function public.is_valid_i18n(j jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(j) = 'object'
    and (j - array['ro', 'en', 'hu', 'es', 'sk']) = '{}'::jsonb
    and coalesce(btrim(j ->> 'ro'), '') <> ''
    and not exists (
      select 1 from jsonb_each(j) e where jsonb_typeof(e.value) <> 'string'
    );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles (one per auth user)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text,
  role public.staff_role not null default 'editor',
  -- New accounts are inactive until an admin activates them.
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile automatically when a user signs up / is invited.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role checks used by RLS policies. SECURITY DEFINER so they read profiles
-- without going through profiles' own RLS (avoids policy recursion).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and active
  );
$$;

create or replace function public.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor') and active
  );
$$;

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  type public.event_type not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  title jsonb not null check (public.is_valid_i18n(title)),
  summary jsonb check (summary is null or public.is_valid_i18n(summary)),
  content jsonb check (content is null or public.is_valid_i18n(content)),
  location text,
  -- Path inside the 'event-images' storage bucket, e.g. '<uid>/poster.webp'.
  image_path text,
  external_url text check (external_url is null or external_url ~* '^https?://'),
  status public.event_status not null default 'draft',
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_end_after_start check (end_at >= start_at)
);

create index events_status_start_idx on public.events (status, start_at);
create index events_type_idx on public.events (type);
create index events_created_by_idx on public.events (created_by);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- Only admins may reassign an event (RLS already blocks editors; this makes the
-- error explicit). created_at is immutable for everyone.
create or replace function public.events_guard_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.created_at := old.created_at;
  if new.created_by is distinct from old.created_by
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'only admins can change created_by'
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$;

create trigger events_guard_update
  before update on public.events
  for each row execute function public.events_guard_update();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.events enable row level security;

-- Explicit grants, so this works whether or not "Automatically expose new tables"
-- is enabled in the project. Visitors only read events; RLS filters every row.
revoke all on public.events, public.profiles from anon, authenticated;
grant select on public.events to anon;
grant select, insert, update, delete on public.events to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;

grant execute on function public.is_valid_i18n(jsonb) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_active_staff() to anon, authenticated;

-- profiles: read yourself; admin reads/writes everyone. Editors cannot change
-- their own role (no update policy for them).
create policy "profiles: self or admin can read"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "profiles: admin can insert"
  on public.profiles for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "profiles: admin can update"
  on public.profiles for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "profiles: admin can delete"
  on public.profiles for delete
  to authenticated
  using ((select public.is_admin()));

-- events: everyone reads published; staff also see their own drafts; admin sees all.
create policy "events: read published, own, or all for admin"
  on public.events for select
  to anon, authenticated
  using (
    status = 'published'
    or (select public.is_admin())
    or ((select public.is_active_staff()) and created_by = (select auth.uid()))
  );

create policy "events: staff insert as themselves"
  on public.events for insert
  to authenticated
  with check (
    (select public.is_active_staff()) and created_by = (select auth.uid())
  );

create policy "events: editor updates own, admin any"
  on public.events for update
  to authenticated
  using (
    (select public.is_admin())
    or ((select public.is_active_staff()) and created_by = (select auth.uid()))
  )
  with check (
    (select public.is_admin())
    or ((select public.is_active_staff()) and created_by = (select auth.uid()))
  );

create policy "events: only admin deletes"
  on public.events for delete
  to authenticated
  using ((select public.is_admin()));
