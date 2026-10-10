-- Stage 5b: everyone can change their own display name; the public site can show
-- who added an event (name only, never the email).

-- Signed-in users change only their own name (role / active stay admin-only).
create or replace function public.set_my_name(new_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in' using errcode = 'insufficient_privilege';
  end if;
  update public.profiles
  set name = nullif(btrim(left(coalesce(new_name, ''), 100)), '')
  where id = auth.uid();
end;
$$;

revoke all on function public.set_my_name(text) from public, anon;
grant execute on function public.set_my_name(text) to authenticated;

-- Name of the person who added a published event (null if unknown or no name).
create or replace function public.event_author_name(event_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.name
  from public.events e
  join public.profiles p on p.id = e.created_by
  where e.id = event_id and e.status = 'published';
$$;

revoke all on function public.event_author_name(uuid) from public;
grant execute on function public.event_author_name(uuid) to anon, authenticated;
