-- Stage 2C: prevent direct client status transitions while preserving normal edits
-- and existing admin moderation. Only the controlled publish RPC may perform
-- configuration-resolved publication status transitions.

create or replace function public.baraha_publish_post(
  p_post_id bigint,
  p_title text,
  p_content text,
  p_category text,
  p_visibility text,
  p_author_membership_id bigint,
  p_author_display_name text,
  p_membership_ids bigint[] default null
)
returns public.baraha_posts
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_user_id uuid := auth.uid();
  v_post public.baraha_posts;
  v_target_status text;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to publish a Baraha post';
  end if;

  if p_title is null or btrim(p_title) = '' then
    raise exception 'Baraha post title is required';
  end if;

  if p_content is null or btrim(p_content) = '' then
    raise exception 'Baraha post content is required';
  end if;

  if p_visibility not in ('public', 'private', 'members') then
    raise exception 'Unsupported Baraha visibility: %', p_visibility;
  end if;

  if p_visibility = 'members'
     and (p_membership_ids is null or cardinality(p_membership_ids) = 0) then
    raise exception 'At least one membership target is required for members visibility';
  end if;

  if p_visibility <> 'members'
     and p_membership_ids is not null
     and cardinality(p_membership_ids) > 0 then
    raise exception 'Membership targets are only valid for members visibility';
  end if;

  v_target_status := public.baraha_resolve_publish_target_status(
    p_visibility,
    p_author_membership_id,
    p_membership_ids
  );

  if v_target_status not in ('draft', 'pending', 'published', 'hide', 'archived') then
    raise exception 'Resolved publish target status is not valid: %', v_target_status;
  end if;

  perform set_config('app.baraha_publish_status_transition', 'on', true);

  if p_post_id is null then
    insert into public.baraha_posts (
      author_id,
      author_membership_id,
      title,
      content,
      category,
      content_status,
      visibility,
      author_display_name
    )
    values (
      v_user_id,
      p_author_membership_id,
      p_title,
      p_content,
      p_category,
      v_target_status,
      p_visibility,
      p_author_display_name
    )
    returning * into v_post;
  else
    select *
      into v_post
      from public.baraha_posts
     where id = p_post_id
     for update;

    if not found then
      raise exception 'Baraha post not found: %', p_post_id;
    end if;

    if v_post.author_id <> v_user_id
       and not public.is_platform_owner() then
      raise exception 'You are not allowed to publish this Baraha post';
    end if;

    update public.baraha_posts
       set author_membership_id = p_author_membership_id,
           title = p_title,
           content = p_content,
           category = p_category,
           content_status = v_target_status,
           visibility = p_visibility,
           author_display_name = p_author_display_name,
           updated_at = now()
     where id = p_post_id
     returning * into v_post;
  end if;

  if p_visibility = 'members' then
    delete from public.baraha_post_memberships
     where post_id = v_post.id;

    insert into public.baraha_post_memberships (post_id, membership_id)
    select v_post.id, target_membership_id
      from (
        select distinct membership_id as target_membership_id
          from unnest(p_membership_ids) as membership_id
         where membership_id is not null
      ) targets;
  else
    delete from public.baraha_post_memberships
     where post_id = v_post.id;
  end if;

  return v_post;
end;
$function$;

create or replace function public.baraha_admin_status_only_guard()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  if current_setting('app.baraha_publish_status_transition', true) = 'on' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.content_status <> 'draft' then
      raise exception 'Baraha publication status must be resolved through the controlled publish operation';
    end if;

    return new;
  end if;

  if public.is_platform_owner() then
    if new.content_status is distinct from old.content_status then
      raise exception 'Baraha publication status must be resolved through the controlled publish operation';
    end if;

    return new;
  end if;

  if public.baraha_is_matching_active_admin(old.id) then
    if old.content_status <> 'published' or new.content_status <> 'hide' then
      raise exception 'Baraha admin moderation only permits published to hide';
    end if;

    if new.author_id is distinct from old.author_id
       or new.author_membership_id is distinct from old.author_membership_id
       or new.title is distinct from old.title
       or new.content is distinct from old.content
       or new.category is distinct from old.category
       or new.visibility is distinct from old.visibility
       or new.collection_key is distinct from old.collection_key
       or new.collection_part is distinct from old.collection_part
       or new.collection_order is distinct from old.collection_order
       or new.created_at is distinct from old.created_at
       or new.author_display_name is distinct from old.author_display_name then
      raise exception 'Baraha admin moderation may change status only';
    end if;

    return new;
  end if;

  if new.content_status is distinct from old.content_status then
    raise exception 'Baraha publication status must be resolved through the controlled publish operation';
  end if;

  return new;
end;
$function$;

drop trigger if exists baraha_admin_status_only_guard on public.baraha_posts;

create trigger baraha_admin_status_only_guard
before insert or update on public.baraha_posts
for each row
execute function public.baraha_admin_status_only_guard();
