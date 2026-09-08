-- Reusable Baraha publish target status resolver.
-- The database resolves the target status from authenticated actor context,
-- publish visibility, membership targets and active site_config policy.

create or replace function public.baraha_resolve_publish_target_status(
  p_visibility text,
  p_author_membership_id bigint,
  p_membership_ids bigint[] default null
)
returns text
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
declare
  v_user_id uuid := auth.uid();
  v_actor_role text;
  v_target_membership_id bigint;
  v_target_role text;
  v_resolved_status text;
  v_candidate_status text;
  v_global_status text;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to resolve publish status';
  end if;

  if p_visibility not in ('public', 'private', 'members') then
    raise exception 'Unsupported Baraha visibility: %', p_visibility;
  end if;

  if public.is_platform_owner() then
    v_actor_role := 'owner';
  else
    select m.membership_type
      into v_actor_role
      from public.memberships m
     where m.id = p_author_membership_id
       and m.user_id = v_user_id
       and m.status = 'active';

    if v_actor_role not in ('admin', 'member') then
      raise exception 'Active author membership is required to resolve publish status';
    end if;
  end if;

  if p_visibility = 'members' then
    if p_membership_ids is null or cardinality(p_membership_ids) = 0 then
      raise exception 'At least one membership target is required for members visibility';
    end if;

    foreach v_target_membership_id in array p_membership_ids loop
      if public.is_platform_owner() then
        v_target_role := 'owner';
      else
        select m.membership_type
          into v_target_role
          from public.memberships m
         where m.id = v_target_membership_id
           and m.user_id = v_user_id
           and m.status = 'active';

        if v_target_role not in ('admin', 'member') then
          raise exception 'User does not have an active target membership: %', v_target_membership_id;
        end if;
      end if;

      select case v_target_role
               when 'owner' then c.config_value
               when 'admin' then c.config_value_2
               when 'member' then c.config_value_3
             end
        into v_candidate_status
        from public.site_config c
       where c.config_key = 'baraha_post_publish_target_status'
         and c.scope_type = 'membership'
         and c.scope_id = v_target_membership_id
         and c.is_active = true
       order by c.config_seq asc
       limit 1;

      if v_candidate_status is null then
        select case v_target_role
                 when 'owner' then c.config_value
                 when 'admin' then c.config_value_2
                 when 'member' then c.config_value_3
               end
          into v_global_status
          from public.site_config c
         where c.config_key = 'baraha_post_publish_target_status'
           and c.scope_type = 'global'
           and c.scope_id is null
           and c.is_active = true
         order by c.config_seq asc
         limit 1;

        v_candidate_status := v_global_status;
      end if;

      if v_candidate_status is null then
        raise exception 'No publish target status configuration resolved for membership %', v_target_membership_id;
      end if;

      if v_resolved_status is null then
        v_resolved_status := v_candidate_status;
      elsif v_resolved_status = v_candidate_status then
        null;
      elsif v_resolved_status = 'pending' or v_candidate_status = 'pending' then
        v_resolved_status := 'pending';
      else
        raise exception 'Conflicting publish target statuses resolved for membership targets';
      end if;
    end loop;

    return v_resolved_status;
  end if;

  select case v_actor_role
           when 'owner' then c.config_value
           when 'admin' then c.config_value_2
           when 'member' then c.config_value_3
         end
    into v_resolved_status
    from public.site_config c
   where c.config_key = 'baraha_post_publish_target_status'
     and c.scope_type = case
       when p_visibility = 'public' then 'baraha_public'
       when p_visibility = 'private' then 'baraha_private'
     end
     and c.is_active = true
   order by c.config_seq asc
   limit 1;

  if v_resolved_status is null then
    select case v_actor_role
             when 'owner' then c.config_value
             when 'admin' then c.config_value_2
             when 'member' then c.config_value_3
           end
      into v_resolved_status
      from public.site_config c
     where c.config_key = 'baraha_post_publish_target_status'
       and c.scope_type = 'global'
       and c.scope_id is null
       and c.is_active = true
     order by c.config_seq asc
     limit 1;
  end if;

  if v_resolved_status is null then
    raise exception 'No publish target status configuration could be resolved';
  end if;

  return v_resolved_status;
end;
$function$;

revoke all on function public.baraha_resolve_publish_target_status(text, bigint, bigint[]) from public;
grant execute on function public.baraha_resolve_publish_target_status(text, bigint, bigint[]) to authenticated;