-- Controlled Baraha publish operation.
-- The caller requests publication; Supabase resolves the final content_status
-- from authenticated actor context and active site_config policy.

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

revoke all on function public.baraha_publish_post(
  bigint,
  text,
  text,
  text,
  text,
  bigint,
  text,
  bigint[]
) from public;

grant execute on function public.baraha_publish_post(
  bigint,
  text,
  text,
  text,
  text,
  bigint,
  text,
  bigint[]
) to authenticated;