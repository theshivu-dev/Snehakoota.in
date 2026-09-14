-- Community Updates Stage 4: creation context and related URL support.

alter table public.community_updates
  add column if not exists related_url text;

create or replace function public.community_updates_get_create_context()
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public'
as $$
declare
  v_user uuid := auth.uid();
  v_is_owner boolean := false;
  v_can_publish_public boolean := false;
  v_targets jsonb := '[]'::jsonb;
begin
  if v_user is null then
    raise exception 'Authentication is required';
  end if;

  v_is_owner := public.is_platform_owner();
  v_can_publish_public := public.community_updates_can_publish_public(v_user);

  if v_is_owner then
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', sb.id,
      'school_name', s.name,
      'batch_year', sb.batch_year
    ) order by s.name, sb.batch_year), '[]'::jsonb)
    into v_targets
    from public.school_batches sb
    join public.schools s on s.id = sb.school_id
    where sb.is_active and s.is_active;
  else
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', q.id,
      'school_name', q.school_name,
      'batch_year', q.batch_year
    ) order by q.school_name, q.batch_year), '[]'::jsonb)
    into v_targets
    from (
      select distinct sb.id, s.name as school_name, sb.batch_year
      from public.memberships m
      join public.school_batches sb on sb.id = m.batch_id
      join public.schools s on s.id = sb.school_id
      where m.user_id = v_user
        and m.status = 'active'
        and m.membership_type = 'admin'
        and sb.is_active and s.is_active
    ) q;
  end if;

  return jsonb_build_object(
    'can_publish_public', v_can_publish_public,
    'target_batches', v_targets
  );
end;
$$;

drop function if exists public.community_updates_save(
  bigint,text,text,text,text,timestamptz,bigint[],timestamptz,timestamptz,text,text,boolean,timestamptz,bigint
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
  p_linked_baraha_post_id bigint default null,
  p_related_url text default null
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
  v_related_url text := nullif(btrim(coalesce(p_related_url, '')), '');
begin
  if v_user is null then raise exception 'Authentication is required'; end if;
  if p_update_type not in ('notice','announcement','event') then raise exception 'Unsupported update type'; end if;
  if p_visibility_scope not in ('public','membership_targeted') then raise exception 'Unsupported visibility scope'; end if;
  if p_title is null or btrim(p_title) = '' then raise exception 'Community Update title is required'; end if;
  if p_expires_at is not null and p_expires_at <= v_publish_at then raise exception 'expires_at must be after published_at'; end if;
  if v_related_url is not null and v_related_url !~* '^https?://[^[:space:]]+$' then
    raise exception 'Related URL must be a valid http or https URL';
  end if;

  select array_agg(distinct x order by x), count(distinct x)
    into v_targets, v_count
  from unnest(coalesce(p_school_batch_ids, '{}'::bigint[])) x
  where x is not null;

  if p_visibility_scope = 'public' then
    if coalesce(v_count, 0) <> 0 then raise exception 'Public updates cannot have school-batch targets'; end if;
    if not public.community_updates_can_publish_public(v_user) then raise exception 'Not allowed to publish public Community Updates'; end if;
  else
    if coalesce(v_count, 0) = 0 then raise exception 'At least one school-batch target is required'; end if;
    if exists (
      select 1 from unnest(v_targets) x
      where not exists (
        select 1 from public.school_batches sb where sb.id = x and sb.is_active
      )
    ) then raise exception 'Invalid or inactive school-batch target'; end if;
    if not public.community_updates_can_manage_targets(v_targets, v_user) then
      raise exception 'You must be an active admin of every targeted school batch';
    end if;
  end if;

  if p_update_type = 'event' then
    if p_event_starts_at is null then raise exception 'Event start time is required'; end if;
    if p_event_ends_at is not null and p_event_ends_at < p_event_starts_at then
      raise exception 'Event end time cannot be before event start time';
    end if;
  elsif p_event_starts_at is not null or p_event_ends_at is not null
     or nullif(btrim(coalesce(p_event_location_name, '')), '') is not null
     or nullif(btrim(coalesce(p_event_location_url, '')), '') is not null then
    raise exception 'Event details are only valid for event updates';
  end if;

  if p_linked_baraha_post_id is not null and not exists (
    select 1 from public.baraha_posts bp
    where bp.id = p_linked_baraha_post_id
      and bp.content_status = 'published'
      and bp.visibility = 'public'
  ) then raise exception 'Linked Baraha post must be published and public'; end if;

  if p_update_id is null then
    insert into public.community_updates(
      update_type, visibility_scope, title, content, created_by, is_enabled,
      published_at, expires_at, linked_baraha_post_id, related_url
    ) values (
      p_update_type, p_visibility_scope, btrim(p_title),
      nullif(btrim(coalesce(p_content, '')), ''), v_user,
      coalesce(p_is_enabled, true), v_publish_at, p_expires_at,
      p_linked_baraha_post_id, v_related_url
    ) returning * into v_update;
  else
    if not public.community_updates_can_manage(p_update_id, v_user) then
      raise exception 'Not allowed to manage this Community Update';
    end if;
    update public.community_updates set
      update_type = p_update_type,
      visibility_scope = p_visibility_scope,
      title = btrim(p_title),
      content = nullif(btrim(coalesce(p_content, '')), ''),
      is_enabled = coalesce(p_is_enabled, true),
      published_at = v_publish_at,
      expires_at = p_expires_at,
      linked_baraha_post_id = p_linked_baraha_post_id,
      related_url = v_related_url
    where id = p_update_id returning * into v_update;
  end if;

  delete from public.community_update_memberships where update_id = v_update.id;
  if p_visibility_scope = 'membership_targeted' then
    insert into public.community_update_memberships(update_id, school_batch_id)
    select v_update.id, x from unnest(v_targets) x;
  end if;

  delete from public.community_update_event_details where update_id = v_update.id;
  if p_update_type = 'event' then
    insert into public.community_update_event_details(
      update_id, starts_at, ends_at, location_name, location_url
    ) values (
      v_update.id, p_event_starts_at, p_event_ends_at,
      nullif(btrim(coalesce(p_event_location_name, '')), ''),
      nullif(btrim(coalesce(p_event_location_url, '')), '')
    );
  end if;

  return v_update;
end;
$$;

revoke all on function public.community_updates_get_create_context() from public;
grant execute on function public.community_updates_get_create_context() to authenticated;

revoke all on function public.community_updates_save(
  bigint,text,text,text,text,timestamptz,bigint[],timestamptz,timestamptz,text,text,boolean,timestamptz,bigint,text
) from public;

grant execute on function public.community_updates_save(
  bigint,text,text,text,text,timestamptz,bigint[],timestamptz,timestamptz,text,text,boolean,timestamptz,bigint,text
) to authenticated;
