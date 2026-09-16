# SnehaKoota Control Panel V1

The Control Panel is a single capability-driven administration surface for platform Owner and active membership Admin users.

## Current authority model

- Platform Owner: site-wide membership and Baraha moderation visibility; can promote/demote active memberships between `member` and `admin`.
- Active Admin: membership-scoped administration for active admin memberships only.
- Account and Membership remain separate.
- Frontend visibility is UX; Supabase RPC authorization is the security boundary.

## Backend boundary

The page uses these authoritative functions:

- `controlpanel_get_context`
- `controlpanel_list_memberships`
- `controlpanel_list_unassigned_users`
- `controlpanel_set_membership_status`
- `controlpanel_set_membership_type`
- `controlpanel_list_posts`
- existing `baraha_approve_post`
- existing `baraha_hide_post`

The Control Panel does not directly mutate membership or Baraha lifecycle columns.

## UI scope

- Members: search, status/type filters, membership scope and lifecycle actions.
- Posts: scope/status/search and authorized approve/hide actions.
- Owner-only Admin Management: active admins plus accounts without memberships.
- Account widget receives a capability-driven `ನಿರ್ವಹಣೆ` entry through the shared navigation layer.

The page intentionally does not introduce a second authentication, membership or moderation system.
