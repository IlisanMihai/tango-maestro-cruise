-- RLS check for events / profiles / event-images.
--
-- Run it in the Supabase SQL editor (paste everything, Run) or with psql:
--   psql "<connection string>" -f supabase/checks/rls_check.sql
--
-- Everything runs inside one transaction that is ROLLED BACK at the end, so it
-- leaves no test users or events behind. If a rule is broken the script stops
-- with an error starting with "FAIL:". No error = all checks passed.

begin;

-- ---------------------------------------------------------------------------
-- Setup (as postgres): 1 admin, 2 active editors, 1 inactive editor
-- ---------------------------------------------------------------------------
insert into auth.users (id, aud, role, email, raw_user_meta_data) values
  ('00000000-0000-4000-a000-00000000000a', 'authenticated', 'authenticated', 'rls-admin@test.local',  '{"name":"Admin"}'),
  ('00000000-0000-4000-a000-0000000000e1', 'authenticated', 'authenticated', 'rls-ed1@test.local',    '{"name":"Editor 1"}'),
  ('00000000-0000-4000-a000-0000000000e2', 'authenticated', 'authenticated', 'rls-ed2@test.local',    '{"name":"Editor 2"}'),
  ('00000000-0000-4000-a000-0000000000e3', 'authenticated', 'authenticated', 'rls-ed3@test.local',    '{"name":"Inactive"}');

-- Profiles were created by the on_auth_user_created trigger.
update public.profiles set role = 'admin', active = true where id = '00000000-0000-4000-a000-00000000000a';
update public.profiles set active = true
  where id in ('00000000-0000-4000-a000-0000000000e1', '00000000-0000-4000-a000-0000000000e2');

insert into public.events (slug, type, start_at, end_at, title, status, created_by) values
  ('rls-ed1-draft',     'milonga', now(), now() + interval '4 hours', '{"ro":"Draft E1"}',     'draft',     '00000000-0000-4000-a000-0000000000e1'),
  ('rls-ed2-draft',     'milonga', now(), now() + interval '4 hours', '{"ro":"Draft E2"}',     'draft',     '00000000-0000-4000-a000-0000000000e2'),
  ('rls-ed2-published', 'milonga', now(), now() + interval '4 hours', '{"ro":"Published E2"}', 'published', '00000000-0000-4000-a000-0000000000e2');

-- ---------------------------------------------------------------------------
-- Anonymous visitor
-- ---------------------------------------------------------------------------
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$
begin
  if exists (select 1 from public.events where slug like 'rls-%' and status = 'draft') then
    raise exception 'FAIL: anon can see drafts';
  end if;
  if not exists (select 1 from public.events where slug = 'rls-ed2-published') then
    raise exception 'FAIL: anon cannot see published events';
  end if;
  begin
    insert into public.events (slug, type, start_at, end_at, title)
    values ('rls-anon', 'altul', now(), now(), '{"ro":"x"}');
    raise exception 'FAIL: anon inserted an event';
  exception when insufficient_privilege then null;
  end;
  begin
    if exists (select 1 from public.profiles) then
      raise exception 'FAIL: anon can read profiles';
    end if;
  exception when insufficient_privilege then null; -- no grant at all: also fine
  end;
end $$;

-- ---------------------------------------------------------------------------
-- Editor 1 (active)
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-a000-0000000000e1","role":"authenticated"}', true);

do $$
declare n int;
begin
  -- sees own draft + published, not other editors' drafts
  if not exists (select 1 from public.events where slug = 'rls-ed1-draft') then
    raise exception 'FAIL: editor cannot see own draft';
  end if;
  if exists (select 1 from public.events where slug = 'rls-ed2-draft') then
    raise exception 'FAIL: editor can see another editor''s draft';
  end if;

  -- cannot edit someone else's events
  update public.events set title = '{"ro":"hacked"}' where slug in ('rls-ed2-draft', 'rls-ed2-published');
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: editor updated another editor''s event'; end if;

  -- can edit own event
  update public.events set title = '{"ro":"Draft E1 edited"}' where slug = 'rls-ed1-draft';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: editor cannot update own event'; end if;

  -- cannot hand own event to someone else
  begin
    update public.events set created_by = '00000000-0000-4000-a000-0000000000e2' where slug = 'rls-ed1-draft';
    raise exception 'FAIL: editor changed created_by';
  exception when insufficient_privilege then null;
  end;

  -- cannot delete, not even own events
  delete from public.events where slug in ('rls-ed1-draft', 'rls-ed2-published');
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: editor deleted an event'; end if;

  -- insert only as themselves
  insert into public.events (slug, type, start_at, end_at, title)
  values ('rls-ed1-new', 'practica', now(), now() + interval '2 hours', '{"ro":"Nou"}');
  if (select created_by from public.events where slug = 'rls-ed1-new')
     is distinct from '00000000-0000-4000-a000-0000000000e1' then
    raise exception 'FAIL: created_by not defaulted to the editor';
  end if;
  begin
    insert into public.events (slug, type, start_at, end_at, title, created_by)
    values ('rls-ed1-fake', 'practica', now(), now(), '{"ro":"x"}', '00000000-0000-4000-a000-0000000000e2');
    raise exception 'FAIL: editor inserted an event as someone else';
  exception when insufficient_privilege then null;
  end;

  -- profiles: sees only self, cannot promote self
  if (select count(*) from public.profiles) <> 1 then
    raise exception 'FAIL: editor can read other profiles';
  end if;
  update public.profiles set role = 'admin' where id = '00000000-0000-4000-a000-0000000000e1';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: editor changed own role'; end if;

  -- storage: cannot upload into someone else's folder
  begin
    insert into storage.objects (bucket_id, name)
    values ('event-images', '00000000-0000-4000-a000-0000000000e2/x.webp');
    raise exception 'FAIL: editor uploaded into another user''s folder';
  exception when insufficient_privilege then null;
  end;
end $$;

-- ---------------------------------------------------------------------------
-- Inactive editor
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-a000-0000000000e3","role":"authenticated"}', true);

do $$
begin
  begin
    insert into public.events (slug, type, start_at, end_at, title)
    values ('rls-ed3', 'altul', now(), now(), '{"ro":"x"}');
    raise exception 'FAIL: inactive editor inserted an event';
  exception when insufficient_privilege then null;
  end;
end $$;

-- ---------------------------------------------------------------------------
-- Admin
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-a000-00000000000a","role":"authenticated"}', true);

do $$
declare n int;
begin
  if (select count(*) from public.events where slug in ('rls-ed1-draft', 'rls-ed2-draft')) <> 2 then
    raise exception 'FAIL: admin cannot see all drafts';
  end if;
  update public.events set status = 'published' where slug = 'rls-ed2-draft';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: admin cannot update any event'; end if;
  delete from public.events where slug = 'rls-ed1-draft';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: admin cannot delete'; end if;
  update public.profiles set active = false where id = '00000000-0000-4000-a000-0000000000e2';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: admin cannot update profiles'; end if;
  raise notice 'All RLS checks passed.';
end $$;

-- Only reached when every check above passed (the SQL editor shows this last result).
select 'All RLS checks passed' as result;

rollback;
