-- Community Updates Stage 2: lifecycle completion, safe Baraha linking, and feed-read hardening.
-- Built as a delta on the already-live Community Updates foundation.

alter table public.community_updates
  add column if not exists is_enabled boolean not null default true;

alter table public.community_updates
  add column if not exists linked_baraha_post_id bigint
    references public.baraha_posts(id) on delete set null;

create index if not exists community_updates_active_feed_idx
  on public.community_updates (published_at desc)
  where is_enabled = true;

create index if not exists community_updates_linked_baraha_post_idx
  on public.community_updates (linked_baraha_post_id)
  where linked_baraha_post_id is not null;

-- Feed visibility is intentionally separate from management authority.
-- Normal readers see only enabled, published, unexpired updates.
create or replace function public.community_updates_can_read(
  p_update_id bigint,
  p_user_id uuid default auth.uid()
) returns boolean
language plpgsql
stable
security definer
set search_path to 'public'
as $$
declare
  v_update public.community_updates;
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
     or (v_update.expires_at is not null and v_update.expires_at <= now()) then
    return false;
  end if;

  if v_update.visibility_scope = 'public' then
    return true;
  end if;

  return p_user_id is not null
    and exists (
      select 1
      from public.community_update_memberships cutm
      where cutm.update_id = v_update.id
        and public.community_updates_is_active_school_batch_member(
          cutm.school_batch_id,
          p_user_id
        )
    );
end;
$$;

-- Replace the Stage 1 save signature with the Stage 2 lifecycle/link-aware contract.
drop function if exists public.community_updates_save(
  bigint,text,text,text,text,timestamptz,bigint[],timestamptz,timestamptz,text,text
);

create function public.community_updates_save(
  p_update_id bigint default null,
  p_update_type text default null,
  p_visibility_scope text default null,
  p_title text default null,
  p_content text default null,
  p_expires_at timestamptz default null,
  p_school_batch_ids bigint[] default null,
  p_event_starts_at timestamptz default null,
  p_event_ends_at timestamptz default null,
  p_event_location_name text default null,
  p_event_location_url text default null,
  p_is_enabled boolean default true,
  p_published_at timestamptz default null,
  p_linked_baraha_post_id bigint default null
) returns public.community_updates
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_user uuid := auth.uid();
  v_update public.community_updates;
  v_targets bigint[];
  v_count integer;
  v_publish_at timestamptz := coalesce(p_published_at, now());
begin
  if v_user is null then
    raise exception 'Authentication is required';
  end if;

  if p_update_type not in ('notice','announcement','event') then
    raise exception 'Unsupported update type';
  end if;

  if p_visibility_scope not in ('public','membership_targeted') then
    raise exception 'Unsupported visibility scope';
  end if;

  if p_title is null or btrim(p_title) = '' then
    raise exception 'Community Update title is required';
  end if;

  if p_expires_at is not null and p_expires_at <= v_publish_at then
    raise exception 'expires_at must be after published_at';
  end if;

  select array_agg(distinct x order by x),
         count(distinct x)
    into v_targets, v_count
  from unnest(coalesce(p_school_batch_ids, '{}'::bigint[])) x
  where x is not null;

  if p_visibility_scope = 'public' then
    if coalesce(v_count, 0) <> 0 then
      raise exception 'Public updates cannot have school-batch targets';
    end if;

    if not public.community_updates_can_publish_public(v_user) then
      raise exception 'Not allowed to publish public Community Updates';
    end if;
  else
    if coalesce(v_count, 0) = 0 then
      raise exception 'At least one school-batch target is required';
    end if;

    if exists (
      select 1
      from unnest(v_targets) x
      where not exists (
        select 1
        from public.school_batches sb
        where sb.id = x
          and sb.is_active
      )
    ) then
      raise exception 'Invalid or inactive school-batch target';
    end if;

    if not public.community_updates_can_manage_targets(v_targets, v_user) then
      raise exception 'You must be an active admin of every targeted school batch';
    end if;
  end if;

  if p_update_type = 'event' then
    if p_event_starts_at is null then
      raise exception 'Event start time is required';
    end if;

    if p_event_ends_at is not null
       and p_event_ends_at < p_event_starts_at then
      raise exception 'Event end time cannot be before event start time';
    end if;
  elsif p_event_starts_at is not null
     or p_event_ends_at is not null
     or nullif(btrim(coalesce(p_event_location_name, '')), '') is not null
     or nullif(btrim(coalesce(p_event_location_url, '')), '') is not null then
    raise exception 'Event details are only valid for event updates';
  end if;

  -- V1 Baraha link contract: only a published public Baraha post may be linked.
  if p_linked_baraha_post_id is not null
     and not exists (
       select 1
       from public.baraha_posts bp
       where bp.id = p_linked_baraha_post_id
         and bp.content_status = 'published'
         and bp.visibility = 'public'
     ) then
    raise exception 'Linked Baraha post must be published and public';
  end if;

  if p_update_id is null then
    insert into public.community_updates(
      update_type,
      visibility_scope,
      title,
      content,
      created_by,
      is_enabled,
      published_at,
      expires_at,
      linked_baraha_post_id
    )
    values(
      p_update_type,
      p_visibility_scope,
      btrim(p_title),
      nullif(btrim(coalesce(p_content, '')), ''),
      v_user,
      coalesce(p_is_enabled, true),
      v_publish_at,
      p_expires_at,
      p_linked_baraha_post_id
    )
    returning * into v_update;
  else
    if not public.community_updates_can_manage(p_update_id, v_user) then
      raise exception 'Not allowed to manage this Community Update';
    end if;

    update public.community_updates
       set update_type = p_update_type,
           visibility_scope = p_visibility_scope,
           title = btrim(p_title),
           content = nullif(btrim(coalesce(p_content, '')), ''),
           is_enabled = coalesce(p_is_enabled, true),
           published_at = v_publish_at,
           expires_at = p_expires_at,
           linked_baraha_post_id = p_linked_baraha_post_id
     where id = p_update_id
     returning * into v_update;
  end if;

  delete from public.community_update_memberships
  where update_id = v_update.id;

  if p_visibility_scope = 'membership_targeted' then
    insert into public.community_update_memberships(update_id, school_batch_id)
    select v_update.id, x
    from unnest(v_targets) x;
  end if;

  delete from public.community_update_event_details
  where update_id = v_update.id;

  if p_update_type = 'event' then
    insert into public.community_update_event_details(
      update_id,
      starts_at,
      ends_at,
      location_name,
      location_url
    )
    values(
      v_update.id,
      p_event_starts_at,
      p_event_ends_at,
      nullif(btrim(coalesce(p_event_location_name, '')), ''),
      nullif(btrim(coalesce(p_event_location_url, '')), '')
    );
  end if;

  return v_update;
end;
$$;

revoke all on function public.community_updates_can_read(bigint,uuid) from public;
revoke all on function public.community_updates_save(
  bigint,text,text,text,text,timestamptz,bigint[],timestamptz,timestamptz,text,text,boolean,timestamptz,bigint
) from public;

grant execute on function public.community_updates_save(
  bigint,text,text,text,text,timestamptz,bigint[],timestamptz,timestamptz,text,text,boolean,timestamptz,bigint
) to authenticated;
