# Snehakoota.in — Project Rules & Development Standards

> **Last updated:** 2026-09-14
>
> This README is the working contract for AI-assisted development of Snehakoota.in. It records both the stable project rules and the current authenticated/invitation architecture so future sessions can continue without losing decisions already made.

---

## 1. Project purpose

**Snehakoota.in** is a Kannada-first community website for the Snehakoota school-friends community. The site is being built incrementally, with a strong focus on:

- Clean, warm, human/community-oriented visual design.
- Kannada-first content and typography.
- Excellent mobile experience without sacrificing desktop presentation.
- Simple, maintainable code that can grow into a larger platform.
- Preserving established visual identity and interaction patterns.
- Keeping the website open and community-oriented rather than treating account creation as a closed-membership gate.

The frontend may remain static HTML/CSS/JavaScript while Supabase provides authentication and database-backed community features.

---

## 2. Golden rule for AI-assisted development

Any AI tool working on this repository must read this README before making or proposing changes.

Before modifying a page or shared file:

1. Inspect the current repository and relevant files.
2. Understand existing HTML, CSS, JavaScript, assets and shared UI patterns.
3. Reuse existing components/patterns wherever practical.
4. Make the smallest safe change that satisfies the request.
5. Do not rewrite an entire page when a targeted change is sufficient.
6. Do not remove existing functionality unless explicitly requested.
7. Do not introduce duplicate controls, buttons, icons, links or functionality.
8. Do not silently change unrelated pages.
9. Keep implementation understandable for a non-specialist owner who maintains the project with AI assistance.
10. Clearly state what files were changed and what changed.

### Mandatory write/commit confirmation

Before creating, modifying, deleting, or committing any repository file, the AI must first show the proposed change and obtain explicit confirmation from the user in chat. A generic question such as “Can you do this?” does not constitute permission to write or commit.

For an explicitly approved multi-step task, that approval covers the stated scope only. If the intended scope expands, stop and obtain confirmation for the expansion.

### Mandatory post-commit validation

After every repository commit:

1. Re-fetch the committed file(s) and confirm the intended content is present.
2. Compare the commit against its parent and verify that only the approved files/changes were included.
3. Check for accidental truncation, unrelated edits, missing content, or reverted work.
4. Report the commit SHA and validation result before proceeding to another change.

Never assume a successful GitHub write means the change is correct.

---

## 3. Current development approach

The project uses a **static-web-first approach**.

Prefer:

- HTML
- CSS
- Vanilla JavaScript
- Existing assets
- Lightweight browser APIs

Avoid adding frameworks, build systems, packages or external dependencies unless clearly justified and approved.

The architecture should remain capable of growing into a modern application without forcing unnecessary complexity into the current static phase.

---

## 4. Responsive design standard

Use one semantic HTML structure with responsive CSS/layout rules rather than separate desktop/mobile pages.

For business-card-style pages such as `samparka.html`:

- Mobile: aim for at least 2 collapsed cards in a normal phone viewport where practical.
- Expanded mobile card: important expanded content should fit within approximately one viewport where practical, without unnecessary scrolling.
- Laptop/desktop: aim for at least 4 comfortable collapsed cards where width permits.
- Do not distort card proportions merely to hit a numeric target.

Use CSS Grid/Flexbox, fluid sizing, sensible breakpoints and reusable patterns.

---

## 5. Visual design language

Maintain the established Snehakoota visual identity:

- Warm cream/beige backgrounds.
- Terracotta/rust accents.
- Dark green accents where already established.
- Soft borders and rounded cards.
- Subtle shadows/glows.
- Friendly, premium-but-community-oriented appearance.
- Readable, elegant Kannada typography.

Avoid replacing the established visual language with generic or AI-looking UI styles.

### Icons

Prefer clean inline SVG icons with consistent stroke/weight. Do not mix unrelated icon styles on the same page.

---

## 6. Business-card component standard

Business-card-style tiles should be reusable and expandable as more friends/businesses are added.

Collapsed cards generally contain the image/visual area, heading/title, category/tag, business/person title, owner/person information where applicable, short description, one Share action, and one expand/details action.

When expanded, additional details may include services, contact actions, website, location/map, and download/share functionality. Avoid duplicated actions without a clear UX reason.

If the image itself contains a meaningful heading, crop/position the image so the heading remains visible in the collapsed state.

---

## 7. Expand/collapse behaviour

Expansion must be predictable and reversible.

- Clicking the details control opens the card.
- Clicking it again or the designated close control reliably collapses it.
- Do not accidentally create multiple independent expanded states.
- Preserve existing left-side toggle/bookmark behaviour where present.
- Use working interactions on `index.html` or `story.html` as reference patterns.

---

## 8. Share and download actions

Avoid duplicate Share buttons.

The planned card download feature is intended to create one commonly supported image format containing only the selected card information, not the entire webpage. Final format/implementation is deferred until that feature is actually developed.

---

## 9. Maps/location standard

For business cards with locations:

- Show the address clearly.
- Use supplied Google Maps Embed code when an embed is provided.
- Do not invent a different location.
- Keep map embeds responsive.
- Do not add a Maps API key merely to display an existing embed.

Current dummy reference location is the Hukkerimath High School area in Haveri.

---

## 10. Page scope rule

When the owner says a change applies to one page, touch only that page and the minimum necessary shared code/assets.

Before changing shared CSS/JS, check for possible impact on other pages.

---

## 11. Preserve working functionality

Existing working behaviour is reference material. Check whether the same interaction already works elsewhere before replacing it.

Examples include navigation/bookmark toggles, card expansion, Share controls, responsive layouts and header/navigation behaviour.

---

## 12. Code quality and maintainability

Prefer semantic, modular, clearly named code that another AI or human can understand later.

Avoid unnecessary duplication, unexplained magic numbers, dead CSS/JS, competing implementations and hard-coded dimensions that break on mobile.

Use CSS custom properties for recurring design values where practical.

---

## 13. Content and language

The website is Kannada-first.

Do not translate or rewrite existing Kannada content unless requested. Added Kannada wording should be natural, readable and not unnecessarily formal or robotic.

English may be used for real business names, technical terms, URLs, product/service names and user-provided content.

---

## 14. Long-term authenticated/community architecture

The frontend may remain static while Supabase provides authentication, PostgreSQL, Storage and Realtime functionality.

The intended separation is:

- **GitHub** → source/version control.
- **Static frontend hosting** → serves HTML/CSS/JS.
- **Supabase Auth** → authentication and sessions.
- **Supabase PostgreSQL** → application data and authorization logic.
- **Supabase Storage** → uploads/media where needed.
- **Supabase Realtime** → future live features such as chat where appropriate.

Privileged server-side operations may use a secure backend/Edge Function. Service-role keys must never be placed in browser code.

### Authentication foundation

1. `auth.users.id` is the durable authentication identity.
2. `profiles.id` references that Auth UUID.
3. Google/passkey/etc. are authentication methods, not separate Snehakoota identities.
4. Authentication is independent from membership.
5. Account creation and membership creation are separate concepts.
6. A person can have a Snehakoota account without having any membership.
7. A person with no membership is treated as a **public Snehakoota account** until they obtain/request membership through the appropriate lifecycle.
8. Application roles such as member/admin are application membership concepts, not Supabase Dashboard roles.

### RLS/security

Supabase/PostgreSQL RLS is part of the security model. Frontend visibility is UX only and must not be the security boundary.

Application authorization should be represented in database relationships and server-side logic.

Authentication is required for user-specific/member/private operations; public Baraha content may remain anonymously readable according to RLS.

---

## 15. Current membership foundation

### Membership model

A **membership is a relationship between a user and a school/batch context**. `membership_type` describes the user's role within that membership (for example `member` or `admin`); it does not describe the school/batch itself.

The current HSHS / Haveri / 2004 membership is the initial/default membership context.

The current database supports multiple memberships per user. The architecture must not assume HSHS2004 is the only membership forever.

Relevant `memberships` fields include:

- `user_id`
- `school_id`
- `batch_id`
- `invitation_id`
- `membership_type`
- `status`
- approval/rejection/suspension timestamps and approver information

Membership statuses currently include `pending`, `active`, `rejected`, and `suspended`.

### Membership approval configuration

Approval is configuration-driven through `site_config` using `membership_approval_required`.

The current HSHS2004 configuration is:

`membership_approval_required = false`

Therefore a new HSHS2004 membership can become `active` without a separate approval step.

Generic status rule:

```text
approval_required = false
    → ACTIVE

approval_required = true
    + inviter has an ACTIVE ADMIN membership for that same school/batch
    → ACTIVE

approval_required = true
    + inviter is not an ACTIVE ADMIN for that same school/batch
    → PENDING
```

The active-admin rule is an approval **booster**. The inviter is a helper/spreader of the community, not the owner of the receiver's membership decision.

Invitation processing must never downgrade an already `ACTIVE` membership to `PENDING`. Admin tools may perform deliberate downgrades later.

For an existing `PENDING`, `SUSPENDED` or `REJECTED` membership, a new invitation may move it to the newly determined `PENDING` or `ACTIVE` state. Old rejection/suspension lifecycle metadata is cleared when that happens.

---

## 16. Current invitation architecture — implemented foundation

The invitation system is now an actual working backend + sender UI foundation. Future AI sessions must preserve these decisions unless explicitly changed.

### Core philosophy

An invitation is primarily a **way for a member to spread the word about Snehakoota and bring another person into the community**.

It is **not** an account-creation gate.

A person may create a Snehakoota account without an invitation. An account with no membership is a valid public Snehakoota account.

An invitation adds context and can propose one or more memberships, but the receiver's membership relationship is governed by the membership lifecycle and receiver consent.

### Invitation generation

The current sender RPC is:

`public.create_invitation(p_membership_ids bigint[] default null)`

The sender UI can select multiple memberships or choose a General Snehakoota invitation.

The generation sequence is:

```text
authenticated sender
  → validate active profile
  → validate invitation configuration
  → validate selected membership(s)
  → create secure random token
  → store token hash
  → generate unique public short code
  → persist invitation
  → persist invitation_memberships
  → return path/short code
```

The invitation is persisted before the frontend displays the link.

### Public invitation URL

The public link uses a short code:

`https://snehakoota.in/?invite=XXXXXXXX`

The current implementation generates an 8-character uppercase hexadecimal code and enforces uniqueness in `invitations.short_code`.

The short code is a public lookup identifier only. The secure invitation token/hash remains separate.

A new invitation generation always creates a new invitation/token. It does not silently reuse an old invitation.

### Invitation tables

#### `invitations`

Represents the generated invitation itself.

Important fields include:

- `id` — permanent internal identity.
- `short_code` — unique public lookup key.
- `token_hash` — secure token material.
- `inviter_id` — sender identity.
- `status`.
- `expires_at` / `revoked_at`.
- `invitee_id` / email remain available for future directed-invitation use if needed.

#### `invitation_memberships`

Maps an invitation to the membership(s) proposed by the sender.

This is the normalized representation for multiple proposed memberships.

#### `invitation_uses`

Records authenticated people who actually used an invitation.

The unique key `(invitation_id, invitee_id)` makes repeated use by the same person idempotent while allowing the same invitation URL to be shared by multiple people.

No usage counter is required. Counts can be queried from `invitation_uses` when an admin panel is built.

### Invitation lifecycle

Invitation status values are:

```text
PENDING
REUSABLE
EXPIRED
REVOKED
```

`PENDING` means generated and currently usable but not yet successfully used.

`REUSABLE` means it has been successfully used at least once and remains usable by other people until expiry or revocation.

The invitation is **not** marked `ACCEPTED`, because the invitation itself is reusable.

The actual people who used it are tracked in `invitation_uses`.

Current configured lifetime:

`invitation_expiry_days = 5`

Current configured retention/cleanup value:

`invitation_cleanup_after_days = 7`

Expired/revoked invitations are intended to be cleaned up by a controlled backend/scheduled maintenance mechanism. Manual SQL cleanup is acceptable during development.

### Sender UI principles

The sender flow is:

```text
Invite a friend
  → choose one or more memberships OR General invitation
  → Generating…
  → backend persists invitation
  → display short invitation link
  → Copy / Share
```

The current Account widget is intentionally modular. Existing frontend switches include:

- `INVITATION_MEMBERSHIP_MODE`
- `INVITATION_SHOW_GENERAL_OPTION`
- invitation success-message timing

These are presentation controls, not security controls.

Copy and Share do not close the panel.

Copy provides a simple human-facing confirmation such as `Link copied.`

### General invitation

A General Snehakoota invitation has **no attached membership proposal**.

It does not automatically create a membership.

A future onboarding UI may use the configured default membership (`default_batch`, currently 2004) to present a likely/default choice, but that configuration must not silently create a membership or override receiver consent.

The UI may later grey out the General option or present it as “Coming soon” without changing the backend model.

---

## 17. Receiver-side architecture — current backend implementation

Receiver implementation is being built separately from the sender UI.

The receiver is divided into three logical stages.

### Part 1 — Landing / invitation recognition ✅

When someone arrives with:

`/?invite=SHORTCODE`

we first determine whether the invitation is genuinely valid.

The URL alone is **not** treated as an invitation.

Invalid/nonexistent/expired/revoked invitation codes fall back to normal Snehakoota behaviour.

No membership or invitation-use record is created merely by clicking the URL.

### Part 2 — Authentication context ✅

Authentication remains the normal Snehakoota authentication flow.

Invitation presence is not a requirement for creating an account.

Both existing and new users may authenticate normally. A new account without a membership is a valid public account.

A valid invitation context should survive authentication so that the authenticated processing stage can later act on it.

No membership is created merely because authentication occurred.

For Google, the current account widget uses the Supabase OAuth/PKCE flow. Receiver UI work must preserve the invitation context across the OAuth round trip.

Passkey is currently used as an authentication method for existing credentials; passkey registration occurs only after the user is already signed in. Do not treat passkey as a parallel new-user signup mechanism without an explicit future change.

### Part 3 — Authenticated invitation processing ✅ backend

The backend processing rules are now implemented.

#### 3A — Resolve invitation

RPC:

`public.resolve_invitation(p_invitation_code)`

It:

- finds the invitation through `short_code`;
- accepts only `pending`/`reusable` invitations;
- rejects revoked/expired invitations;
- resolves the current school/city/batch context;
- verifies the proposed membership target still exists and the school/city/batch are active;
- does not mutate membership data;
- does not record invitation use.

The sender's own membership status is not a validity gate for the proposal. Sender authority is evaluated separately during processing.

#### 3B — Process membership proposal(s)

RPC:

`public.process_invitation_memberships(p_invitation_code, p_selected_membership_ids)`

For each selected valid proposal it:

1. determines the target membership status from current configuration and inviter authority;
2. checks whether the receiver already has that school/batch membership;
3. creates the membership with the correct status when missing;
4. updates the membership when the target state should change;
5. does nothing when the existing state is already correct;
6. never downgrades `ACTIVE → PENDING` through invitation processing;
7. may move `SUSPENDED`/`REJECTED` to the newly determined `PENDING`/`ACTIVE` state;
8. keeps `membership.invitation_id` on newly created memberships so invitation provenance is preserved.

Memberships are processed independently, allowing different proposed memberships to produce different statuses.

#### 3C — Invitation use + reusable lifecycle

The same authenticated processing operation:

- inserts `invitation_uses` for the receiver;
- treats the same `(invitation_id, invitee_id)` again as no-op rather than an error;
- changes `PENDING → REUSABLE` after the first successful use;
- leaves an already `REUSABLE` invitation reusable for other people;
- does not use an `ACCEPTED` invitation state.

The operation is intended to be transactional so membership processing and invitation usage do not intentionally become separate half-completed business events.

### Receiver consent principle

The sender's membership selections are **proposals/context**, not a command to grant membership blindly.

The receiver can eventually choose which proposed memberships to proceed with through the receiver UI.

For every selected membership, the backend evaluates the current membership state and current approval configuration at processing time.

---

## 18. Current Supabase configuration

The application configuration lives in `site_config` so operational values do not have to be scattered through multiple SQL functions.

Current relevant configuration includes:

- `invitation_enabled = true`
- `default_batch = 2004`
- `membership_approval_required = false` for HSHS2004
- `invitation_expiry_days = 5`
- `invitation_cleanup_after_days = 7`

Configuration must be read server-side by RPCs where it affects business logic.

### Supabase signup switch

Supabase Dashboard provides **Allow new users to sign up**. Turning it OFF is useful as a temporary development safety switch: existing users can still sign in while new Auth users cannot be created.

This Dashboard control is separate from Snehakoota's invitation concept.

Snehakoota itself is **not invitation-only for account creation**. Invitation is a community/membership mechanism.

### Legacy helper created during an earlier design discussion

`check_account_creation_allowed(invitation_code)` was created while invitation-only account creation was being considered.

That model was later rejected because Snehakoota intentionally allows public account creation independent of invitations.

**Do not build new receiver logic around this helper.** It can be removed later after confirming that nothing references it.

---

## 19. Supabase security and operational foundation

### Database security

Current invitation-related RPCs use `SECURITY DEFINER` where appropriate with controlled search paths and explicit grants.

Receivers should not need direct table-write permissions merely to process invitations.

### Heartbeat

A lightweight `supabase_heartbeat()` function and GitHub Actions workflow are used as a project-activity/health mechanism.

The heartbeat is operational infrastructure and should remain separate from Snehakoota business logic.

Do not add heartbeat behaviour to the website UI.

### Edge Functions

Supabase Edge Functions are available for future server-side logic requiring capabilities that should not live in browser JavaScript, especially privileged operations that must never expose a service-role key.

Do not add an Edge Function merely because it is available. Use it when the business requirement actually needs server-side API logic beyond the capabilities of existing RPCs.

For the current receiver architecture, no account-deletion/cleanup Edge Function is required merely because invitation links exist; public account creation is intentionally allowed.

---

## 20. Current receiver backend checklist before UI

Completed:

- [x] Short invitation code stored and unique.
- [x] Invitation URL resolves through `short_code`.
- [x] Validity checks include status, expiry and revocation.
- [x] Proposed membership target checks include current school/city/batch activity.
- [x] Multiple proposed memberships supported in normalized `invitation_memberships`.
- [x] Receiver membership create/update/no-change logic implemented.
- [x] Status determination implemented from approval configuration + active-admin override.
- [x] Active memberships are never downgraded by invitation processing.
- [x] Rejected/suspended lifecycle metadata is cleaned when state is reopened.
- [x] Invitation usage is idempotent per invitation + receiver.
- [x] Reusable invitation lifecycle implemented.

Still pending before/while receiver UI is developed:

- [ ] Carry invitation context through the current Google OAuth/PKCE round trip.
- [ ] Implement receiver Account-widget presentation for a valid invitation.
- [ ] Make proposed memberships preselected and configurable/editable at the frontend level without coupling presentation to database security.
- [ ] Implement the authenticated call to `process_invitation_memberships()` after the appropriate receiver action.
- [ ] Test existing-user and new-user receiver flows end-to-end.
- [ ] Test General invitation with no membership.
- [ ] Test repeated use of the same link by different users and by the same user.
- [ ] Test expiry/revocation behaviour.
- [ ] Add controlled expiry/cleanup maintenance once receiver behaviour is stable.
- [ ] Decide later whether `invitation_uses.invitee_email` should be populated from Auth identity data; `invitee_id` remains the authoritative receiver identity.
- [ ] Later decide whether legacy `check_account_creation_allowed()` should be removed.

---

## 21. Schema evolution and data preservation

Use migrations/version-controlled schema changes for important database changes.

The preferred direction is:

**upgrade → migrate → preserve existing users/data → continue**

not:

**replace → recreate users/data → repair manually**

Do not design new tables around temporary UI labels or today's HTML structure.

Use stable IDs and relationships. Keep authentication identity separate from profile/member data. Keep database records separate from uploaded files.

Avoid adding infrastructure before the requirement becomes real.

---

## 22. AI change protocol

For every requested change:

### Step 1 — Understand
Identify the exact page/component/behaviour being changed.

### Step 2 — Inspect
Read the current repository implementation before proposing code.

### Step 3 — Plan
Briefly explain what will change and what remains untouched when the change is non-trivial.

### Step 4 — Implement
Make the smallest appropriate change.

### Step 5 — Verify
Check HTML, JavaScript, assets, responsive behaviour, duplicate controls, regression risk and (for Supabase) authorization, RLS/grants, configuration dependencies, error handling and persistence order.

### Step 6 — Commit
Commit only the approved change. Keep commits focused enough that the owner can understand and safely revert them.

### Step 7 — Post-commit validation
Re-fetch the committed file(s), compare the commit with its parent, verify the exact changed-file set and confirm there was no truncation, accidental revert or unrelated change.

### Step 8 — Update this README when a decision becomes durable
If a decision changes architecture, security, data ownership, lifecycle, development rules, or another future-session assumption, update this README as part of the same controlled workflow. Record the new decision rather than relying on conversation history alone.

---

## 23. Do not over-engineer the current project

Snehakoota.in is being built incrementally.

Priority:

**working → clean → responsive → maintainable → extensible**

not:

**complex → framework-heavy → over-engineered**

Future architecture should be anticipated, but future infrastructure should not be implemented before it is needed.

---

## 24. Current project philosophy

Snehakoota is a community project first and a technology project second.

Technology should serve:

- Friends.
- Community participation.
- Easy discovery.
- Good storytelling.
- Trust.
- Simplicity.
- Long-term maintainability.

---

## 25. Delta since the previous README update — 2026-08-29

The previous README was last updated on 2026-08-29. The following durable decisions were made after that point and are now recorded here so future sessions do not depend on conversation history.

### Baraha backend foundation is now established

Baraha is no longer only a UI prototype at the architecture level. Its PostgreSQL foundation and security model are established and should be treated as the current backend foundation unless explicitly reopened.

The current `baraha_posts` foundation includes:

- `id`
- `author_id`
- `author_membership_id`
- `title`
- `content`
- `category`
- `content_status`
- `visibility`
- `collection_key`
- `collection_part`
- `collection_order`
- `created_at`
- `updated_at`

The normalized `baraha_post_memberships` relationship supports multiple membership contexts per post.

Baraha lifecycle states are:

`draft`, `published`, `hide`, `archived`.

Normal users do not physically delete posts; normal deletion is represented by `archived`. Owner-level physical deletion remains an exceptional/firefighter capability.

Matching active admins may moderate a matching post from `published → hide`, with database protection that prevents unauthorized content/identity changes through the moderation path.

### Baraha authorization and public access

Supabase RLS/database rules remain the actual security boundary.

Authentication is required for user-specific/member/private Baraha operations, while published public Baraha content may remain anonymously readable according to RLS.

Frontend visibility or button state is never considered authorization.

### Baraha membership is contextual, not identity

A Baraha post may carry an author membership context, but `author_id` remains the durable ownership identity. Membership context does not replace the authenticated user identity.

Multiple memberships per user remain a permanent architectural requirement.

### Baraha architecture is deliberately modular

The current Baraha application boundary is:

```text
Supabase / Auth
      ↓
BarahaService
      ↓
BarahaController
   ↙        ↘
Context     Model
      \      /
        View
          ↓
     baraha.html
```

This is a lightweight application architecture, not a new framework.

---

## 26. Baraha application architecture

### Purpose

Baraha is being developed as a self-contained modular application inside the static Snehakoota frontend. The goal is to provide clear boundaries now so individual capabilities can be changed later without rewriting unrelated parts of the page.

The architecture intentionally resembles a small MVC/application module and may use PBO/PAI-style thinking for UI lifecycle, but it does not introduce a large generic framework.

### Layers and responsibilities

#### View — `baraha.html` / future `BarahaView`

The View is responsible for:

- presenting Baraha UI;
- collecting user interaction;
- UI-only validation and presentation state;
- rendering data supplied by the application layer;
- showing loading, empty, unavailable and error states.

The View must not directly query Supabase, implement database authorization, or become the source of business/data truth.

The existing HTML can remain the visual/template surface while the architecture evolves toward a clearer `BarahaView` object where useful.

#### Controller — `BarahaController`

The Controller is the application doorway for user commands and coordinates the flow between View, Model, Context and Service.

Conceptual commands include:

```text
SELECT_CATEGORY
SELECT_MEMBERSHIP
OPEN_POST
LOAD_MORE
NEW_POST
SAVE_DRAFT
PUBLISH_POST
HIDE_POST
```

The exact command catalogue may evolve. The important rule is that user actions enter the application through the Controller rather than embedding business/data operations directly in HTML handlers.

The Controller must not contain raw Supabase table/RPC implementation details.

#### Model — `BarahaModel`

The Model owns Baraha application/domain state, not DOM state and not authentication authority.

The planned structure is:

```text
BarahaModel
├── feed
│   ├── items
│   ├── loading
│   ├── hasMore
│   └── nextCursor
├── selectedPost
├── categories / modes / visibility options
├── selectedCategory / filters
└── editor
    ├── mode
    ├── title
    ├── content
    ├── visibility
    └── selected memberships
```

Feed, post and editor state may be refined independently as the application grows.

#### Context — `BarahaContext`

Context represents the user's current Baraha operating context:

- current `session`;
- current `user`;
- available `memberships[]`;
- `currentMembership`.

Authentication state is derived from the session rather than maintained as an unrelated second authority.

`currentMembership` means the membership context in which the user is mentally/operationally working. It is not a replacement for authorization.

Context does not independently decide whether an operation is allowed. Supabase/database authorization remains authoritative.

#### Service — `BarahaService`

**BarahaService is the only Baraha application layer responsible for communicating with Supabase.**

It owns the Baraha data boundary and exposes meaningful Baraha operations rather than leaking raw table/query details to the Controller or View.

The service catalogue is expected to include concepts such as:

```text
READ
├── getMyMemberships()
├── getPostList()
├── getPost()
└── getCollection()

WRITE
├── createPost()
├── updatePost()
├── publishPost()
├── archivePost()
└── setPostMemberships()

MODERATION
└── hidePost()
```

This is a conceptual service contract, not a promise that every method is implemented immediately.

The Service may use tables, RPCs, views or other Supabase mechanisms internally. That implementation detail must not leak into Controller/View contracts.

### Service + Supabase are the read/write authority

The fundamental rule is:

```text
UI/View
   ↓
Controller
   ↓
BarahaService
   ↓
Supabase
```

The UI, Controller, Model and Context are application helpers/state holders. They are **not independent authorities for Baraha data**.

For reads, the Service asks Supabase for the authoritative data available to the current viewer.

For writes, the Service requests the operation from Supabase, where RLS/RPC/database rules remain the final authority.

The frontend must never reproduce Supabase authorization merely to decide whether an operation is truly allowed.

### Authentication and public feed boundary

A public Baraha post may be readable without authentication if current RLS permits it.

Authentication is required where the operation is user-specific or depends on member/private access.

Therefore the architecture must not use “authenticated = can read Baraha” as a blanket rule. The Service asks Supabase for the current viewer's permitted result.

### Feed contract

The main feed is a viewer-relative representation of content the current viewer is allowed to read.

Default ordering is:

```text
created_at DESC
id DESC
```

The feed uses cursor/keyset pagination rather than page numbers.

The conceptual result contract is:

```js
{
  items: [...],
  nextCursor: "...",
  hasMore: true
}
```

Initial loading, loading more and refreshing are distinct states.

A refresh is represented by a new first-page request rather than by silently reordering the existing scroll position.

Stale asynchronous responses must be discarded when the feed context/request identity has changed.

### `getPostList()` contract

The planned Service contract is:

```js
getPostList({
  limit,
  cursor,
  category?,
  membershipId?
})
```

`membershipId` is a feed/filter context, not an authorization mechanism.

No explicit `userId` parameter is required for authority. Supabase Auth/session and database rules identify the current user.

No hard-coded status filter is required for the base feed; Supabase/RLS determines which rows are actually visible to the current viewer.

The feed may initially retrieve full post content and derive a short card preview in the presentation layer. A later implementation can switch to a lighter representation without inventing a permanent `summary` database field solely for the current UI.

### Single-post/deep-link contract

Every post is independently addressable by stable `baraha_posts.id`.

Initial deep-link form:

`baraha.html?post=<id>`

The same Baraha application can initially handle both feed and reading. A future dedicated reading route/page can be introduced without changing post identity or the core Service boundary.

An inaccessible, hidden or deleted direct post must result in a meaningful unavailable state rather than a blank page.

### Collections

A Collection is a future grouping of individual posts into a book, article set, series or similar structure.

A post belongs to zero or one Collection.

Existing `collection_key`, `collection_part` and `collection_order` are deliberate database foundation for future grouping/order. Collection UI and execution are not being implemented merely because the columns exist.

The guiding use case is **write first, club later**.

### Membership selector

The Baraha membership selector has two related but distinct meanings:

- **Current operating membership** — “Where am I operating?”
- **Feed/filter membership** — “Which membership's content am I asking to see?”

They may coincide in the current UI, but the architecture must not collapse these concepts permanently.

A membership can legitimately have zero Baraha posts.

Operations that require membership use an active/valid membership according to Supabase. Base feed retrieval does not require a current membership when RLS allows the requested content.

### Author identity and future author resolution

`baraha_posts.author_id` is the durable ownership identity.

The current demo author names are presentation-only mock values and are not the identity source.

Author display is deliberately separated from ownership/security identity.

The Service should provide a replaceable author-resolution capability such as:

```text
readAuthor(id)
readAuthors(ids[])
```

Batch resolution is preferred when several feed items need author information so that the application does not create avoidable N+1 lookups.

The resolver may determine whether an author has relevant membership context today and may later resolve profile/display information from a different safe Supabase destination. Controller, Model and View should not need to change when that underlying destination evolves.

The preferred implementation is a safe Supabase-side resolver/query/RPC/view rather than exposing arbitrary membership-table reads to the browser simply to classify authors.

No arbitrary author resolver is required to be implemented now; the architectural boundary is what is being fixed.

### Profile visibility and consent — future

Display names, avatars and other profile information are separate from `author_id` ownership.

When profile identity becomes a real UI/data requirement, appropriate visibility, privacy and consent rules will be defined and connected through the existing author-resolution boundary.

No profile redesign is required for the current Baraha foundation.

### Error and lifecycle model

State belongs to the relevant Model area rather than one giant global state:

```text
Model.feed.state
Model.post.state
Model.editor.state
```

Expected outcomes such as empty data, not found, not accessible and validation failure must remain distinguishable from technical failures such as network/Supabase errors.

A failed operation must not silently become an idle/blank state.

A lightweight future MessageHandler/ErrorHandler may classify technical/application errors and convert them into user-facing messages, but a large global error framework is not required now.

Post lifecycle remains subject to current Supabase truth; the Model must not assume a previously fetched state is permanently authoritative.

### Supabase remains the security boss

Baraha architecture does not move authorization into JavaScript.

The frontend may hide/disable UI controls for usability, but that is only presentation. RLS, database functions, triggers and server-side rules are the actual security boundary.

Where a business rule can change independently of the UI, it belongs at the Service/Supabase boundary rather than being duplicated across pages.

---

## 27. Baraha implementation roadmap and architecture maintenance

Baraha is no longer only static scaffolding. Its core feed, publishing, reader, moderation and lifecycle flows are implemented through the established boundaries below.

### Current architecture boundary

```text
Baraha HTML / View
        ↓
Controller
        ↓
Model / Context
        ↓
Service
        ↓
Supabase
```

Responsibilities remain explicit:

- **HTML / View / Reader** — presentation, DOM behaviour and user interaction only.
- **Controller** — orchestration of application actions and lifecycle transitions.
- **Model** — Baraha domain/feed state and post objects.
- **Context** — current session, user, memberships and capability snapshot.
- **Service** — the only Baraha application boundary that communicates with Supabase.
- **Supabase** — authoritative identity, membership, authorization, lifecycle and data boundary.

No raw Supabase query belongs in Baraha page code, View or Reader code.

### Current implementation modules

The current Baraha implementation includes:

- `baraha-context.js` — session/user/membership/capability context; no Supabase calls.
- `baraha-model.js` — Baraha domain/feed state and post models; no DOM/Supabase calls.
- `baraha-service.js` — Supabase reads, RPC calls, author enrichment and lifecycle actions.
- `baraha-controller.js` — orchestration of initialization, feed query state, pagination, publishing and lifecycle refresh.
- `baraha-view.js` — feed/card presentation and UI mapping.
- `baraha-reader.js` — reader presentation component and reader-level actions; no Supabase calls.
- `baraha.html` — page shell and Baraha-specific UI wiring only.

The architecture must remain modular rather than moving business/data logic back into `baraha.html`.

### Safe implementation order

The working direction remains:

```text
architecture decision
      ↓
README / durable contract
      ↓
small focused change
      ↓
inspect + implement
      ↓
commit
      ↓
post-commit compare/validation
      ↓
continue
```

### One capability / one foundation path

Future work must prefer the existing foundation rather than creating parallel refresh, authorization or data paths.

Examples:

- feed refreshes go through the controller's authoritative refresh path;
- load-more continues the same active feed query;
- category and My Posts changes reset through the same refresh path;
- publish/moderation/archive lifecycle changes return through the same authoritative feed refresh;
- auth changes reuse the existing Baraha initialization path;
- BFCache restoration reuses the same initialization/refresh path.

Do not add page-specific "quick refresh" methods when an existing lifecycle entry path can perform the required work.

### Architecture is revisitable, not frozen forever

This architecture is a durable boundary, not a claim that every method/class is permanent.

If future requirements show that a boundary is wrong or too small:

1. inspect the current repository and Supabase impact;
2. identify the smallest correct architectural change;
3. avoid parallel/competing paths;
4. implement the correction;
5. update this README when the decision becomes durable.

Do not bypass the architecture by placing a quick Supabase query directly into a page because it is faster for one feature.

### README is the continuity mechanism

The README is intentionally treated as a living architecture and development contract.

When a decision becomes durable, record it here. When a durable decision is superseded, update the relevant section rather than accumulating contradictory rules elsewhere.

Future AI sessions should use this README plus the current repository/Supabase state as the starting point, not assume that old conversation text is still the latest authority.

---

## 28. Current Baraha status — implemented foundation and regression rules

### Backend / Supabase foundation — established

- [x] `baraha_posts` schema foundation.
- [x] `baraha_post_memberships` normalized membership bridge.
- [x] Post lifecycle states.
- [x] Owner exceptional delete/security path.
- [x] Matching-admin moderation boundary.
- [x] Database-level protection of moderation changes.
- [x] RLS-based viewer-relative read access.
- [x] Multiple membership support.
- [x] Collection foundation fields reserved for future use.
- [x] Capability snapshot used by the application through controlled Supabase RPC access.
- [x] Controlled Baraha publish/lifecycle RPC boundary.
- [x] Moderation capability lookup through a controlled Supabase RPC boundary.
- [x] Baraha RPC permission hardening and repository migration-history alignment completed during the current stabilization work.

### Application architecture — established

- [x] View / Controller / Model / Context / Service boundary.
- [x] Service as the only Baraha application layer communicating with Supabase.
- [x] Supabase remains authoritative for read/write, identity, membership and authorization.
- [x] Viewer-relative feed.
- [x] Cursor/keyset pagination using `created_at DESC, id DESC`.
- [x] Single active feed-query state for category and My Posts filters.
- [x] Category changes reset pagination through the authoritative refresh path.
- [x] My Posts changes reset pagination through the same authoritative refresh path.
- [x] Load More continues the same active query/filter context.
- [x] Refresh waits for an in-flight authoritative read before starting a new first-page read.
- [x] Publish adds the newly returned/enriched post through the model and renders the feed.
- [x] Archive, approve and hide actions refresh the authoritative feed after the lifecycle RPC succeeds.
- [x] Reader presentation separated from Service/database access.
- [x] Reader actions currently include contextual edit/archive/approve/hide/share presentation with controller/service orchestration.
- [x] Shared auth-state event from the account widget reuses the normal Baraha initialization path.
- [x] Sign-out/account-switch protection clears user-specific My Posts filtering through identity comparison during initialization.
- [x] BFCache `pageshow` restoration reuses the same initialization path.
- [x] Browser Back/Forward restores reader/editor route state from the URL.
- [x] Deep-link reader state uses stable post identity and meaningful unavailable handling.
- [x] HTML remains a page/UI shell; Baraha controller/service/model/context logic belongs in their modules.

### Feed query and pagination contract

The active feed is represented by one controller-owned query state:

```text
feedQuery
  ├── category
  └── authorId (My Posts)
```

Pagination state remains separate:

```text
feedCursor
hasMorePosts
feedLoading
feedLoadPromise
```

Rules:

1. **Initial entry / authoritative refresh** starts from cursor `null`.
2. **Category change** updates the active query and resets through refresh.
3. **My Posts toggle** updates `authorId` and resets through refresh.
4. **Load More** uses the current query plus the current cursor; it must not silently broaden or change the filter.
5. A lifecycle/auth change must not race an existing read into stale visible state; refresh waits for the current authoritative read and then starts a fresh first-page request.
6. A selected category must remain semantically aligned with the data loaded by Load More.

The Model supports replacing the current live page and appending subsequent pages without returning to static demo data.

### Single authoritative refresh principle

The stabilization work established the following rule:

```text
Page entry
Auth change
BFCache restoration
Filter change
My Posts change
Lifecycle mutation
        ↓
appropriate controller entry
        ↓
authoritative refresh/query path
        ↓
Model state
        ↓
View render
```

New functionality may introduce a new user action or route hook, but it should call the existing foundation where the underlying requirement is "refresh Baraha data".

Do not solve future refresh issues by creating chains of page-specific methods that call one another or by maintaining multiple competing feed refresh listeners.

### Authentication lifecycle contract

The shared account widget publishes:

```text
sk:auth-state
```

Baraha listens to that shared application-level event and calls its existing initialization path to rebuild:

- session context;
- memberships;
- capability snapshot;
- viewer-relative feed.

The Baraha page must not create an additional independent account/auth refresh system.

User-specific feed state must not leak across:

```text
signed-in user A
        ↓
sign out
        ↓
signed-out state
        ↓
user B
```

In particular, the My Posts author filter must be cleared when authenticated identity changes.

### Reader and route contract

Baraha uses one reader panel rather than a separate full reading application.

Stable post identity remains:

```text
baraha.html?post=<id>
```

The reader:

- renders presentation data only;
- does not call Supabase directly;
- delegates lifecycle actions through configured handlers;
- supports route synchronization;
- closes/returns through the existing URL/history flow.

Reader action availability must remain contextual and capability-based. UI visibility is convenience only; the database/RPC boundary remains authoritative.

### Moderation / lifecycle orchestration

Lifecycle actions follow:

```text
Reader/UI action
      ↓
Controller
      ↓
Service
      ↓
controlled Supabase RPC
      ↓
authoritative refresh
```

Current focused actions include:

- approve;
- hide;
- archive;
- publish/create through the controlled publish RPC.

Do not update moderation/lifecycle state by directly mutating arbitrary frontend state as the security/authority source.

### UI cleanup rule

When stabilizing architecture, temporarily commented legacy code may be retained only when:

1. it is intentionally isolated;
2. the comment explains why it is temporarily retained;
3. the current replacement path is clear;
4. it is scheduled for removal after targeted UI/regression verification.

Commented code is not a permanent parallel implementation.

### Current regression expectations

Before treating Baraha changes as safe, verify at minimum:

- anonymous/public feed;
- signed-in feed;
- sign-out refresh;
- account switch;
- BFCache/page restore;
- category filter + Load More;
- My Posts + Load More;
- filter change after pagination;
- publish;
- archive;
- approve;
- hide;
- reader open/close;
- reader deep link;
- browser Back/Forward;
- inaccessible/hidden post behaviour;
- public/member/private visibility boundaries;
- admin moderation boundaries.

### Remaining work / intentionally not settled

The following should not be treated as silently complete merely because the current foundation exists:

- [ ] Full UI/manual regression pass after the latest stabilization commits.
- [ ] Final removal of intentionally commented legacy cleanup code after targeted UI verification.
- [ ] Broader end-to-end regression coverage across public/member/private/auth transitions.
- [ ] Any remaining polish of reader action layout/visual hierarchy.
- [ ] Explicit product decision for published-post editing; current UI must not imply an unsupported edit lifecycle.
- [ ] Collection execution/UI only when the product requirement becomes active.
- [ ] Future author/profile display improvements through the approved safe resolution boundary.

The existence of the implemented foundation does **not** authorize future features to bypass it. New Baraha functionality must enter through the existing Controller/Service boundaries and reuse the current refresh/query lifecycle where applicable.

---

## 29. Current project philosophy

Snehakoota is a community project first and a technology project second.

Technology should serve:

- Friends.
- Community participation.
- Easy discovery.
- Good storytelling.
- Trust.
- Simplicity.
- Long-term maintainability.
