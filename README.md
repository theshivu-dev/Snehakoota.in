# Snehakoota.in — Project Rules & Development Standards

> **Last updated:** 2026-08-29
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

### Step 6 — Report
State changed files, main changes, assumptions, browser/device tests still needed and intentionally deferred work.

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

The site is intentionally **open to people at the account level**. Membership is the deeper community relationship and follows its own consent, approval and lifecycle rules.

---

## 25. Working instruction for future AI sessions

Treat this README as the baseline project contract.

If a current user request conflicts with this README, the user's explicit current request takes priority, but the AI should point out the conflict before making a potentially destructive or architectural change.

When uncertain, **inspect the existing repository first and ask rather than guessing**.
