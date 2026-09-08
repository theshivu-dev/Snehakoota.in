-- Baraha publish target status configuration
-- config_value   = OWNER target status
-- config_value_2 = ADMIN target status
-- config_value_3 = MEMBER target status

insert into public.site_config
(
  config_key,
  config_value,
  config_value_2,
  config_value_3,
  description,
  scope_type,
  scope_id,
  config_seq,
  data_type,
  is_active
)
values
(
  'baraha_post_publish_target_status',
  'published',
  'published',
  'pending',
  'Baraha publish target status policy. config_value=OWNER, config_value_2=ADMIN, config_value_3=MEMBER. Applies to public posts.',
  'baraha_public',
  null,
  1,
  'text',
  true
),
(
  'baraha_post_publish_target_status',
  'published',
  'published',
  'published',
  'Baraha publish target status policy. config_value=OWNER, config_value_2=ADMIN, config_value_3=MEMBER. Applies to private posts.',
  'baraha_private',
  null,
  1,
  'text',
  true
),
(
  'baraha_post_publish_target_status',
  'published',
  'published',
  'pending',
  'Baraha publish target status policy. config_value=OWNER, config_value_2=ADMIN, config_value_3=MEMBER. Applies to membership scope 2004.',
  'membership',
  2004,
  1,
  'text',
  true
),
(
  'baraha_post_publish_target_status',
  'published',
  'pending',
  'pending',
  'Baraha publish target status fallback. config_value=OWNER, config_value_2=ADMIN, config_value_3=MEMBER. Used when no more specific active policy matches.',
  'global',
  null,
  999,
  'text',
  true
);