-- Add pending as a valid Baraha post lifecycle status.
-- pending means publication was requested but the post is awaiting
-- the configured approval/publication outcome.

alter table public.baraha_posts
  drop constraint if exists baraha_posts_status_check;

alter table public.baraha_posts
  add constraint baraha_posts_status_check
  check (
    content_status = any (
      array['draft', 'pending', 'published', 'hide', 'archived']
    )
  );