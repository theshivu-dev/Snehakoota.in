-- Community Updates RLS read-path repair.
-- Fixes 403 failures caused by SELECT policies invoking a helper that anon/authenticated
-- were not permitted to execute.
-- The read decision is kept in a private schema and derives the caller from auth.uid().

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.community_updates_can_read_current(
  p_update_id bigint
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_update public.community_updates;
  v_user uuid := (select auth.uid());
begin
  select *
    into v_update
  from public.community_updates
  where id = p_update_id;

  if not found then
    return false;
  end if;

  if not v_update.is_enabled
     or v_update.published_at > now()
     or (
       v_update.expires_at is not null
       and v_update.expires_at <= now()
     ) then
    return false;
  end if;

  if v_update.visibility_scope = 'public' then
    return true;
  end if;

  if v_user is null then
    return false;
  end if;

  return exists (
    select 1
    from public.community_update_memberships cutm
    where cutm.update_id = v_update.id
      and public.community_updates_is_active_school_batch_member(
        cutm.school_batch_id,
        v_user
      )
  );
end;
$$;

revoke all on function private.community_updates_can_read_current(bigint) from public;
grant execute on function private.community_updates_can_read_current(bigint)
  to anon, authenticated;

drop policy if exists community_updates_select_allowed
  on public.community_updates;
create policy community_updates_select_allowed
on public.community_updates
for select
to anon, authenticated
using (private.community_updates_can_read_current(id));

drop policy if exists community_update_memberships_select_allowed
  on public.community_update_memberships;
create policy community_update_memberships_select_allowed
on public.community_update_memberships
for select
to authenticated
using (private.community_updates_can_read_current(update_id));

drop policy if exists community_update_event_details_select_allowed
  on public.community_update_event_details;
create policy community_update_event_details_select_allowed
on public.community_update_event_details
for select
to anon, authenticated
using (private.community_updates_can_read_current(update_id));

drop function if exists public.community_updates_can_read(bigint, uuid);
