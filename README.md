# Snehakoota.in — Project Rules, Architecture & Development Standards

> **Last updated:** 2026-09-15
>
> This README is the working contract for AI-assisted development of Snehakoota.in. It records durable project rules, current architecture, implemented functionality, important security decisions, recent learnings, and the preferred way future AI sessions should work with the project.

---

## 1. Project purpose

**Snehakoota.in** is a Kannada-first community website for the Snehakoota school-friends community. It is being built incrementally with emphasis on:

- warm, human, community-oriented design;
- Kannada-first content and typography;
- excellent mobile experience without sacrificing desktop presentation;
- simple, maintainable code that can grow;
- preserving established visual identity and working interactions;
- an open community model where account creation is not invitation-only.

The frontend remains intentionally static-web-first: HTML + CSS + vanilla JavaScript. Supabase provides authentication, PostgreSQL data/authorization, storage and future realtime capabilities where genuinely needed.

---

## 2. Golden rule for AI-assisted development

AI is an **implementation partner**, not primarily a discussion partner.

Preferred working mode:

```text
UNDERSTAND → INSPECT → DECIDE → IMPLEMENT → VERIFY → REPORT
```

When the requested outcome is clear, do not turn routine implementation into repeated clarification loops. Make reasonable engineering/UI decisions using the established project language and proceed.

### Before changing code

1. Inspect the current repository and relevant files.
2. Trace the existing implementation and ownership boundary.
3. Check whether the requested behaviour already exists and can be reused.
4. If Supabase is involved, inspect live database/RPC/RLS/config truth before changing backend code.
5. Identify the smallest safe change.
6. Protect unrelated modules and existing behaviour.

### Implementation rules

- Reuse existing components/patterns wherever practical.
- Prefer targeted edits over rewrites.
- Do not create a parallel implementation when an existing path can be repaired or reused.
- Do not introduce duplicate controls, renderers, services, state paths or event mechanisms.
- Do not silently change unrelated pages/modules.
- Use configuration/flags for legitimate future variation instead of hard-coded policy.
- Do not add infrastructure merely because it is available.
- Keep code understandable for a non-specialist owner maintaining the project with AI assistance.

### When to ask

Ask only when an essential requirement is genuinely ambiguous, unsafe, unavailable, or would materially change architecture/scope. Do not stop for small visual or implementation decisions that can be resolved consistently from the existing project standards.

An explicit user request to implement a scoped change is authorization for the normal sub-steps required to complete that request. Do not ask for a second confirmation for routine internal steps within the approved scope.

### Mandatory post-change validation

After every repository commit:

1. Re-fetch the committed file(s).
2. Compare the commit with its parent.
3. Verify only intended files/changes were included.
4. Check for truncation, unrelated edits, missing content or accidental reverts.
5. Verify the user-visible scenario that motivated the change.
6. For backend work, verify authorization, RLS/grants, configuration dependencies and persistence behaviour.
7. Report the commit SHA and validation result.

Never assume a successful GitHub write means the change is correct.

---

## 3. Current development approach

Snehakoota uses a **static-web-first** approach.

Prefer:

- HTML
- CSS
- Vanilla JavaScript
- Existing assets
- Lightweight browser APIs

Avoid frameworks, build systems, packages or external dependencies unless the actual requirement justifies them.

Preferred application boundary:

```text
Supabase / browser APIs
        ↓
      Service
        ↓
    Controller
        ↓
 Model / state / context
        ↓
       View
        ↓
       HTML
```

Use this as a principle, not as a requirement to add layers where a small module does not need them.

---

## 4. Repository responsibility map

| Area | Responsibility |
|---|---|
| `index.html` | Home page and shared mounts |
| `theme.css` | Global theme/design tokens/base styling |
| `navigation.css` / `navigation.js` | Shared navigation styling and behaviour |
| `footer.html` / `footer.css` / `footer.js` | Shared footer and panels |
| `account.css` / `account.js` | Auth/account/invitation UI |
| `game.css` / `game.js` | Extracted Game component |
| `game-fix.js` / `game-repair.js` | Historical repair helpers; not automatically long-term architecture |
| `game-test.html` | Isolated Game verification |
| `baraha.html` + Baraha modules | Community writing/feed system |
| `story.html` | Story / Payana page |
| `samparka.html` | Reusable business/contact cards |
| `signin.html` | Authentication-related page |
| `notices/notices-service.js` | Community Updates read/data boundary |
| `notices/notices-create-service.js` | Community Updates creation/RPC boundary |
| `notices/notices.js` | Notice Board rendering/controller |
| `notices/notices-create.js` | Notice creation UI/controller |
| `notices/notices.css` | Main Notice Board styling |
| `notices/notices-runtime.css` | Small isolated Notice Board runtime layout safeguards |
| `UI_ARCHITECTURE.md` | Architecture reference |
| `README.md` | Durable project rules and continuity record |

---

## 5. Responsive and visual standards

Use one semantic HTML structure with responsive CSS rather than separate desktop/mobile pages.

General standards:

- Mobile-first thinking without separate mobile pages.
- Grid/Flexbox, fluid sizing and sensible breakpoints.
- Avoid hard-coded dimensions that only work at one viewport.
- Preserve important content and controls on small screens.
- Test mobile and desktop when a change can affect both.

Visual language:

- warm cream/beige backgrounds;
- restrained terracotta/rust accents;
- dark green identity areas where already established;
- soft borders and rounded cards;
- subtle shadows/glows;
- calm spacing;
- elegant, readable Kannada typography;
- mature, premium-but-community-oriented presentation.

Avoid generic dashboard styling and visibly AI-generated visual language.

### Icons

Use clean, coherent inline SVG/equivalent icons with consistent stroke/weight.

Recent global-navigation decision:

- **Payana / Story:** winding-road/journey icon.
- **Baraha:** elegant writing/page + pen icon.
- Home and all navigation behaviour remain unchanged.

These were intentionally visual-only changes in shared `navigation.css`. Do not alter navigation routing or feature behaviour when an icon-only change is requested.

### Home decorative road

The home page may retain the joining/road visual motif on desktop. On small screens, decorative road geometry may be hidden rather than forcing desktop geometry into a narrow viewport. The visual effect is secondary to clean mobile composition.

---

## 6. Page/module scope and protected areas

When a request applies to one page/module, touch only that page/module and the minimum necessary shared code/assets.

Before modifying shared CSS/JS:

1. Trace consumers.
2. Confirm the change is genuinely shared.
3. Prefer module-owned styling when the behaviour is not global.
4. If global, make the smallest shared change and regression-check other consumers.

**Gaming is protected.** Do not modify Game files for unrelated work.

**Account/Auth/membership foundations are protected.** Do not change them while working on unrelated modules.

**Baraha architecture/security is protected.** Trace current implementation before resuming old Baraha work.

---

## 7. Preserve working functionality

Existing working behaviour is reference material.

Before replacing something, determine whether:

- it already works elsewhere;
- another module already owns the behaviour;
- the problem is integration/order/state rather than missing functionality;
- a targeted repair is sufficient.

Project-wide rule:

> **Fix the existing path before creating a new path.**

Do not create a second renderer, refresh system, event bus, service, controller or state owner simply because the first path is not immediately obvious.

---

# 8. Authentication and membership architecture

## Identity

- Supabase Auth provides durable identity.
- `auth.users.id` is the identity basis.
- `profiles.id` references that Auth UUID.
- Google/passkey/etc. are authentication methods, not separate Snehakoota identities.

## Account vs membership

```text
Snehakoota Account ≠ Membership
```

A person can have a Snehakoota account without any membership.

Account creation is **not invitation-only**.

Application roles such as `member` and `admin` are membership/application concepts, not Supabase Dashboard roles.

## Membership model

A membership represents:

```text
user + school + batch
```

`membership_type` describes the user's role within that membership (`member` / `admin`).

Multiple memberships per user are supported.

Current lifecycle values include:

- `pending`
- `active`
- `rejected`
- `suspended`

HSHS / Haveri / 2004 is the current seed/default membership context, not a permanent universal assumption.

## Approval

Membership approval is configuration-driven through `site_config`.

Current HSHS2004 setting:

`membership_approval_required = false`

Generic rule:

```text
approval_required = false → ACTIVE

approval_required = true + inviter is ACTIVE ADMIN
for the same school/batch → ACTIVE

approval_required = true + inviter is not ACTIVE ADMIN
for the same school/batch → PENDING
```

The active-admin rule is an approval booster, not permanent ownership.

Invitation processing must never downgrade an existing `ACTIVE` membership to `PENDING`.

---

# 9. Invitation architecture

The invitation system is an implemented backend + sender UI foundation.

## Philosophy

An invitation helps a member spread the word and propose membership context. It does not control account creation.

## Generation

Primary RPC:

`public.create_invitation(p_membership_ids bigint[] default null)`

Flow:

```text
authenticated sender
  → validate profile/configuration
  → validate selected memberships
  → secure token/hash
  → unique public short code
  → persist invitation + proposals
  → return invitation path/code
  → Copy / Share
```

Public format:

`https://snehakoota.in/?invite=XXXXXXXX`

The current public code is 8-character uppercase hexadecimal. It is a lookup identifier; secure token/hash material remains separate.

A new invitation generation creates a new invitation/token rather than silently reusing an old invitation.

## Tables

- `invitations` — invitation identity, code, token hash, inviter, lifecycle and expiry/revocation data.
- `invitation_memberships` — normalized membership proposals.
- `invitation_uses` — authenticated receivers who used the invitation.

`UNIQUE(invitation_id, invitee_id)` makes repeated use by the same person idempotent while allowing the same invitation to be reused by different people.

## Lifecycle

```text
PENDING → REUSABLE
          ↘ EXPIRED
          ↘ REVOKED
```

Current configuration:

- `invitation_expiry_days = 5`
- `invitation_cleanup_after_days = 7`

There is deliberately no `ACCEPTED` state for a reusable invitation.

## Receiver

`/?invite=SHORTCODE` is context only; the URL itself grants nothing.

Invalid/nonexistent/expired/revoked codes fall back to normal Snehakoota behaviour.

Authentication remains normal Snehakoota authentication. Valid invitation context must survive OAuth/PKCE and only then be processed for membership purposes.

Backend RPCs:

- `public.resolve_invitation(p_invitation_code)`
- `public.process_invitation_memberships(p_invitation_code, p_selected_membership_ids)`

Processing is idempotent and preserves existing `ACTIVE` membership.

A General invitation has no membership proposal and must not silently create HSHS2004 membership.

### Rejected model

The earlier invitation-only account-creation model was rejected. Do not build new logic around the historical `check_account_creation_allowed(invitation_code)` helper. Remove it only after references are traced.

---

# 10. Supabase security principles

Frontend visibility is UX. **Database authorization is security.**

Use RLS and controlled RPC/server-side authorization for sensitive operations.

Never place a service-role key in browser code.

SECURITY DEFINER RPCs must use controlled search paths and explicit grants.

Do not loosen RLS merely to make a UI operation convenient.

Multi-table business operations should be orchestrated atomically where practical.

Before adding a new role/authority system, inspect the existing live database and configuration foundation.

---

# 11. Baraha — protected architecture

Baraha is the Kannada-first long-form community writing/feed system. It intentionally differs from Community Updates.

| Baraha | Community Updates |
|---|---|
| Long-form writing/read | Short-form inform/announce/alert/schedule |
| Categories such as ಬರಹ/ಕವನ/ನೆನಪು/ಲೇಖನ/ಪುಸ್ತಕ | Notice/Announcement/Event |
| Feed + dedicated Reader | Expandable Notice Board |

## Feed ownership

The historical Baraha issue involved competing initialization paths and static/live feed ownership.

Direction:

```text
BarahaModel
  ├── seed/static posts
  ├── live Supabase posts
  └── authoritative combined posts
          ↓
      BarahaView
          ↓
     renderPosts()
```

`BARAHA_FEED_CONFIG.includeStaticPosts` controls legitimate static/demo inclusion.

Do not create a second feed builder or competing initialization path.

## Reader

The Reader is separate from the feed view.

- `baraha.html` — Reader shell.
- `baraha-reader.js` — Reader lifecycle.
- `baraha.css` — Reader styling.
- `BarahaModel.currentPost` — selected post state.

Reader methods include `render(post)`, `open(post)`, `close()`, `clear()` and `isOpen()`.

Long content should scroll inside the Reader, not create confusing underlying-page scrolling.

## Lifecycle/security

Server-side lifecycle enforcement remains authoritative.

Author edit is allowed only while the post is `draft` or `pending`.

Published/hidden/archived posts must not become editable merely because the user is the author.

Relevant hardened RPCs include:

- `baraha_publish_post(...)`
- `baraha_archive_post(bigint)`
- `baraha_approve_post(bigint)`
- `baraha_hide_post(bigint)`

Authenticated execution is retained; public execution was removed during ACL hardening.

Do not assume remaining Baraha edit/Reader UI work is complete; trace the current repository before resuming it.

---

# 12. Community Updates / Notice Board — V1

Community Updates is the current information-board module.

Core decision:

> **Do not build separate Notice and Events systems. Use one generic Community Updates model.**

Internal terminology remains **Community Updates / Updates**. User-facing labels may be Notice Board, Upcoming Events or Updates.

## Updates are not Baraha

Updates are short, action-oriented, time-relevant information objects. They are not another long-form writing system and must not gain a second Baraha-style Reader.

The Notice Board itself is the reader for Updates.

## Types and audience

Types:

```text
notice
announcement
event
```

Audience:

```text
public
membership_targeted
```

One update can target one or multiple membership contexts.

Events may contain start/end time and location name/URL.

An update may optionally link to a Baraha post.

## Database model

### `community_updates`

Core fields include:

- `id`
- `update_type`
- `title`
- `content`
- `visibility_scope`
- `is_enabled`
- `published_at`
- `expires_at`
- `linked_baraha_post_id`
- `created_by`
- `created_at`
- `updated_at`

### `community_update_memberships`

Normalized bridge between updates and existing memberships.

`UNIQUE(update_id, membership_id)` prevents duplicate targeting.

### `community_update_event_details`

One optional event-detail row per update:

- `update_id`
- `starts_at`
- `ends_at`
- `location_name`
- `location_url`

## Integrity rules

Database/orchestration, not frontend-only code, must enforce:

- allowed types are notice/announcement/event;
- public updates have no membership mappings;
- targeted updates have at least one membership mapping;
- public and selected-membership audiences are not mixed;
- event updates require event details;
- non-event updates do not retain event details;
- event end is not earlier than start;
- publish/expiry relationship is valid.

## Active/expiry lifecycle

```text
is_enabled = true
AND published_at <= now()
AND (expires_at IS NULL OR expires_at > now())
```

Expired updates disappear from the read query but remain in the database. No cleanup job is required merely to hide them.

---

# 13. Community Updates frontend architecture

The module is intentionally split into narrow responsibilities.

## Read path

```text
Supabase
   ↓
notices-service.js
   ↓
notices.js
   ↓
Notice Board / Home preview
```

`notices-service.js` owns Community Update reads and management RPC calls. UI code does not call Supabase directly for those operations.

## Create path

```text
notices-create.js
        ↓
notices-create-service.js
        ↓
community_updates_save RPC
        ↓
Supabase
```

The creation UI supports:

- type;
- audience;
- title/content;
- publish time;
- expiry time;
- authorized membership targets;
- event start/end;
- event location;
- related URL.

UI validation is for usability. Database/RPC validation remains authoritative.

## Shared Supabase client

The read and creation services share:

`window.SnehakootaNoticesSupabaseClient`

This avoids unnecessary parallel client instances and keeps the read/create flows in one browser session/client context.

---

# 14. Notice Board UI decisions

## Home preview

The current implementation shows up to **5** newest active updates (`HOME_NOTICE_LIMIT = 5`).

## Full board

The full board is an overlay with a scrollable list of visible updates.

Updates expand **inline** inside the board.

There is no separate per-update reader route/panel for normal V1 updates.

The intended flow is:

```text
Home preview
   ↓
Open Notice Board
   ↓
Expand update inline
   ↓
Read
```

Event information can be shown directly. Linked Baraha content is a navigation relationship, not another Update reader.

## Scroll/layout safeguards

The full list uses isolated runtime layout safeguards in `notices/notices-runtime.css` so that:

- the board/list can shrink correctly inside the overlay;
- the list scrolls vertically;
- horizontal overflow is suppressed;
- expanded items do not clip their content;
- multiple expanded items can coexist without incorrect clipping;
- expanded actions remain reachable.

This runtime stylesheet is deliberately additive and isolated from the main Notice Board stylesheet.

---

# 15. Notice creation refresh — important learned integration rule

After a successful notice creation, the existing Notice Board refresh path is reused.

```text
create succeeds
   ↓
SnehakootaNoticeBoard.refresh()
   ↓
getVisibleUpdates()
   ↓
state.updates replaced
   ↓
render()
   ↓
home preview + board update
```

The project must **not** add polling, another event bus, manual parallel DOM insertion or a second renderer to solve post-create freshness.

The recent fix also established the shared Supabase client between read/create services so the existing refresh path works in the same client/session context.

The same principle applies to future mutations:

> **successful mutation → authoritative existing state/render path**

---

# 16. Notice deletion and authorization

Delete is an existing Notice Board mutation path, not a separate subsystem.

Capability is checked per update through:

`community_updates_get_manage_capabilities`

Secure deletion uses:

`public.community_updates_delete(p_update_id bigint, p_user_id uuid DEFAULT auth.uid())`

Current authority model:

- **platform owner** can manage/delete any Community Update;
- **active membership admin** can manage/delete membership-targeted updates only when current authority covers the relevant target membership(s);
- membership admins do not gain deletion rights over public updates merely by being admins.

There is no browser-side direct DELETE permission being used as the security boundary.

Delete flow:

```text
capability check
   ↓
Delete notice
   ↓
secure delete RPC
   ↓
remove from state
   ↓
render()
```

Failed deletion restores the action and reports an error.

### Important CSS/security-UX lesson

A previous normal-user visibility bug was caused by CSS overriding the browser's semantic `[hidden]` state with `display:flex`.

The correct fix was **not** to add a misleading “Admin Delete” label or duplicate role UI. The correct rule is:

> **Capability controls whether the action exists; CSS must respect the semantic hidden state.**

The runtime Notice Board CSS explicitly preserves `[hidden]` behaviour for action/detail containers.

The delete control uses an actual trash icon rather than the earlier placeholder character.

---

# 17. Community Updates authority model

Authority has two scopes.

## Site-wide/public authority

Public-update authority should be configurable through the existing configuration foundation rather than hard-coded in JavaScript.

Current intended direction:

`updates_public_authority = owner`

Do not assume a generic `admin` role is sufficient in a multi-membership system.

## Membership-scoped authority

For targeted updates, authority follows the current active membership-admin relationship.

Strict multi-membership rule:

> An admin targeting A + B + C must have active admin authority over **all** targeted memberships. Admin of A alone must not gain authority over B/C.

## Creator is not permanent authority

`created_by` is audit/attribution data, not permanent management authority.

If the creator later loses authority, another currently authorized administrator should be able to manage the update.

Before changing this area, inspect the existing site-level owner/configuration model and live RPCs. Do not create a second role system.

---

# 18. Community Updates ↔ Baraha

One Community Update may link to one Baraha post; a Baraha post may be referenced by multiple Updates.

Do not expose a restricted Baraha destination through a broader Update audience.

Safe direction:

```text
Public Update → Public Baraha
Targeted Update → compatible Baraha visibility
```

Avoid:

```text
Public Update → membership-restricted Baraha
```

Audience compatibility belongs in the write/authorization path, not frontend presentation alone.

---

# 19. Deferred Community Updates features

Do not add without an explicit product decision:

- RSVP
- attendance tracking
- push notifications
- calendar integration
- tickets
- image uploads for updates
- comments
- reactions
- recurring events
- complex scheduling
- large admin dashboards
- realtime feeds merely for the sake of realtime

Keep V1 small, understandable and reliable.

---

# 20. Shared navigation and footer

`navigation.css` / `navigation.js` are shared assets. Visual-only icon refinements must not alter links, routing, active-state logic or feature behaviour.

Current icon refinements:

- Payana → winding road/journey representation.
- Baraha → elegant writing/page + pen representation.

`footer.html` / `footer.css` / `footer.js` remain logically separate from floating Account/Game widgets.

`footer.js` fetches/injects `footer.html`; scripts inside fetched footer HTML must not be assumed to execute automatically.

---

# 21. Game component — protected

Game extraction established:

- `game.css` for Game styling;
- `game.js` for Game behaviour/lifecycle;
- `game-test.html` for isolated verification.

Historical repair helpers are not automatically part of the clean architecture.

Do not put `game.js` inside dynamically fetched footer HTML merely because the footer is globally available; loading order matters.

**Gaming is out of scope for unrelated work.**

---

# 22. Schema evolution and data preservation

Preferred direction:

**upgrade → migrate → preserve existing users/data → continue**

not:

**replace → recreate users/data → repair manually**

Before introducing a migration convention, inspect the repository and live Supabase. Earlier ACL work found no reliable tracked migration structure, so do not invent a one-off convention casually.

Do not delete code merely because it looks unused. Trace references and behaviour first.

When replacing an implementation:

```text
old working path
      ↓
new isolated path
      ↓
verify
      ↓
stabilize
      ↓
remove old/orphaned path
```

---

# 23. Testing discipline

Testing is scenario-driven, not only file-driven.

For UI changes, test the user action that motivated the change.

For data mutations, verify:

1. persistence;
2. immediate UI refresh;
3. browser-refresh consistency;
4. auth-state behaviour;
5. unauthorized behaviour;
6. error handling;
7. no duplicate state/render paths.

Community Updates regression set should cover:

- anonymous visibility;
- matching/non-matching membership visibility;
- admin capability visibility;
- public-update authority;
- create success;
- immediate post-create refresh;
- delete success;
- unauthorized delete rejection;
- disabled/expired updates;
- events and locations;
- multiple targets;
- linked Baraha compatibility;
- mobile/desktop board scrolling.

---

# 24. The learned “no parallel fix” standard

This is now a project-wide rule.

When something is broken:

1. Find the existing intended path.
2. Identify why it is failing.
3. Repair that path where possible.
4. Reuse the existing service/controller/state/render boundary.
5. Introduce a new boundary only if the existing ownership is fundamentally wrong.
6. Retire obsolete paths after verification.

Recent examples:

- Notice creation refresh reuses `SnehakootaNoticeBoard.refresh()`.
- Notice deletion updates existing Notice Board state and calls `render()`.
- Delete visibility was fixed through capability + semantic `[hidden]` behaviour, not role-labelled duplicate UI.
- Navigation icon refinement changed only the shared visual layer.
- Read/create Notice services now share one Supabase client rather than creating another refresh mechanism.

---

# 25. Current status snapshot — 2026-09-15

## Foundation

- [x] Static HTML/CSS/vanilla JS direction.
- [x] Shared theme/navigation/footer foundation.
- [x] Supabase Auth foundation.
- [x] Account vs membership separation.
- [x] Multiple memberships.
- [x] Invitation backend + sender foundation.
- [x] Reusable/idempotent invitation lifecycle.

## Baraha

- [x] Feed initialization stabilization direction.
- [x] Static/live feed configuration.
- [x] Dedicated Reader separation.
- [x] Server-side lifecycle/ACL hardening.
- [ ] Remaining edit/Reader UI work must be traced from current repository before resuming.

## Community Updates / Notice Board

- [x] Generic `community_updates` model.
- [x] Membership targeting bridge.
- [x] Event details model.
- [x] Read service/controller boundary.
- [x] Creation service/controller boundary.
- [x] Create form and validation.
- [x] Home preview.
- [x] Inline expandable full board.
- [x] Secure per-update capability/delete path.
- [x] Delete visibility correction.
- [x] Board scroll/overflow safeguards.
- [x] Shared Supabase client for read/create flows.
- [x] Immediate post-create refresh through existing board refresh path.
- [x] Immediate post-delete state/render update.
- [ ] Further authority/config refinement only after tracing existing site-level foundation.

## Shared navigation

- [x] Payana journey/road icon.
- [x] Baraha writing/page + pen icon.
- [x] Navigation links/behaviour preserved.

## Protected unless explicitly requested

- Account/Auth/membership foundations.
- Gaming.
- Existing Baraha security/architecture.
- Shared navigation behaviour during icon-only work.

---

# 26. Recent implementation checkpoints

Recent focused commits:

- `20030a0653b0499b1399a447088ef2efecddf7f0` — `refine: update shared journey and writing icons`
- `91f3cb23fbf45329ea6dc3b6807840117738f6aa` — `fix: finish notice board delete and scroll behavior`
- `059c71461947e705ae69f08c8650efbfb1ca4da2` — `fix: share notice Supabase client across read and create flows`

The current README update follows the shared-client refinement commit.

GitHub Pages deployment for the latest application code has been verified successful.

---

# 27. Future-session continuity rule

This README is continuity context, not a substitute for tracing the repository.

Use both:

```text
README / handover
      ↓
continuity + durable decisions

Current GitHub repository
      ↓
exact implementation truth

Live Supabase
      ↓
exact database/security truth
```

If they conflict:

> **Current repository/live Supabase wins for exact implementation state.**

Record the discrepancy instead of guessing.

---

# 28. Ready-to-use AI continuation prompt

Continue **Snehakoota.in** from the current repository state.

Treat the current GitHub repository and live Supabase as the source of truth for exact implementation state, and this README as the durable record of architecture, decisions and development standards.

Work as an **implementation partner**:

```text
INSPECT
  ↓
TRACE EXISTING PATH
  ↓
DECIDE REASONABLY
  ↓
CHANGE MINIMALLY
  ↓
VERIFY FROM MULTIPLE PERSPECTIVES
  ↓
COMMIT CLEANLY
  ↓
UPDATE README WHEN A DECISION BECOMES DURABLE
```

Do not restart the project, replay old plans blindly, or create parallel fixes. Preserve working behaviour and unrelated modules. Do not stop for small clarifications when the intended outcome is clear; make the reasonable implementation decision using this README and the current code.

For backend work, inspect live Supabase authorization/config/RLS/RPC behaviour before modifying schema or security. For frontend work, identify the existing owner of the behaviour before adding code. For every mutation, prefer the existing authoritative refresh/state/render path.

**Priority:** working → correct → clean → responsive → maintainable → extensible.

---

# 29. Final project philosophy

Snehakoota is a community project first and a technology project second.

Technology should serve:

- Friends.
- Community participation.
- Easy discovery.
- Good storytelling.
- Trust.
- Simplicity.
- Long-term maintainability.

The goal is not to build the most complicated system.

The goal is to build the **right system, one careful improvement at a time**.
