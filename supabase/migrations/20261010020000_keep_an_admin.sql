-- Stage 5: there must always be at least one active admin, so nobody can lock
-- the site out of its own admin area (e.g. by demoting or deactivating themself).

create or replace function public.profiles_keep_an_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Only matters when an active admin stops being one (or is deleted).
  if old.role = 'admin' and old.active
     and (tg_op = 'DELETE' or new.role <> 'admin' or not new.active) then
    if not exists (
      select 1 from public.profiles
      where id <> old.id and role = 'admin' and active
    ) then
      raise exception 'Trebuie să rămână cel puțin un administrator activ.'
        using errcode = 'check_violation';
    end if;
  end if;
  return coalesce(new, old);
end;
$$;

create trigger profiles_keep_an_admin
  before update or delete on public.profiles
  for each row execute function public.profiles_keep_an_admin();
