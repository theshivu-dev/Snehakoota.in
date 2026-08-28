# Snehakoota.in — Project Rules & Development Standards

## 1. Project purpose

**Snehakoota.in** is a Kannada-first community website for the Snehakoota school-friends community. The site is being built incrementally, with a strong focus on:

- Clean, warm, human/community-oriented visual design.
- Kannada-first content and typography.
- Excellent mobile experience without sacrificing desktop presentation.
- Simple, maintainable code that can grow into a larger platform.
- Preserving the existing visual identity and interaction patterns across pages.

The project may begin as static HTML/CSS/JavaScript and can later evolve into authenticated, database-backed community features.

---

## 2. Golden rule for AI-assisted development

Any AI tool (ChatGPT, Claude, or another coding assistant) working on this repository must **read this README before making or proposing code changes**.

Before modifying a page:

1. Inspect the current repository and relevant files.
2. Understand existing HTML structure, CSS, JavaScript, assets and shared UI patterns.
3. Reuse existing components/patterns wherever practical.
4. Make the smallest safe change that satisfies the request.
5. Do not rewrite an entire page when a targeted change is sufficient.
6. Do not remove existing functionality unless explicitly requested.
7. Do not introduce duplicate controls, buttons, icons, links or functionality.
8. Do not silently change unrelated pages.
9. Keep the implementation understandable for a non-specialist owner who will maintain the project with AI assistance.
10. Clearly state what files were changed and what was changed.

**Never assume that a visually similar redesign is acceptable if it changes established behaviour or layout without being requested.**

### Mandatory write/commit confirmation

**Before creating, modifying, deleting, or committing any file in the repository, the AI must first show the proposed change and obtain explicit confirmation from the user in chat. A question such as “Can you do this?” does not constitute permission to write or commit.**

---

## 3. Current development approach

The project currently uses a **static-web-first approach**.

Prefer:

- HTML
- CSS
- Vanilla JavaScript
- Existing assets
- Lightweight browser APIs

Avoid adding frameworks, build systems, packages or external dependencies unless there is a clear benefit and the owner agrees to the change.

The long-term architecture should remain capable of evolving into a modern application without forcing unnecessary complexity into the current static phase.

---

## 4. Responsive design standard

There should **not** be separate manually maintained versions of the same page for desktop and mobile.

Use one semantic HTML structure with responsive CSS/layout rules so the same page adapts naturally to:

- Mobile phones
- Tablets
- Laptops
- Large desktop displays

### Target layout expectations

For pages containing business-card-style tiles (such as `samparka.html`):

- **Mobile:** aim to show at least **2 collapsed cards** within a normal phone viewport where practical.
- **Expanded mobile card:** the important expanded content should fit within approximately one mobile screen/viewport where practical, without unnecessary scrolling.
- **Laptop/desktop:** aim to show at least **4 collapsed cards** in a comfortable grid when screen width permits.
- Card sizing must remain visually balanced rather than simply shrinking everything to achieve a numerical count.

Responsive behaviour should be achieved through CSS Grid/Flexbox, fluid sizing, sensible breakpoints and reusable components—not duplicated HTML pages.

---

## 5. Visual design language

Maintain the established Snehakoota visual identity:

- Warm cream/beige backgrounds.
- Terracotta/rust accents.
- Dark green accents where already established.
- Soft borders and rounded cards.
- Subtle shadows/glows where already used.
- Friendly, premium-but-community-oriented appearance.
- Kannada typography should remain readable and elegant.

Do not introduce a completely different visual language merely because a newer framework or design trend exists.

### Icons

Avoid icons that look overly generic, artificial, or strongly associated with a particular AI-generated UI style.

Prefer:

- Clean inline SVG icons.
- Simple neutral iconography.
- Consistent stroke/weight.
- Icons that visually belong to the site's design system.

Do not mix several unrelated icon styles on the same page.

---

## 6. Business-card component standard

Business-card-style tiles are intended to be reusable and expandable as more friends/businesses are added.

A collapsed card should generally contain:

- Image/visual area.
- Image heading/title visible in the collapsed state when the image contains a meaningful heading.
- Category/tag.
- Business/person title.
- Owner/person information where applicable.
- Short description.
- Share action.
- Single expand/details action.

### Important

If the image itself contains a heading such as **KIRANA STORE** or **SOLAR SOLUTIONS**, position/crop the image so that the heading remains visible in the collapsed card.

Do not allow the card's content panel to cover important image content.

When expanded, additional details may include:

- Services/details.
- Contact actions.
- Website.
- Location/map.
- Download/share functionality.

Do not duplicate the same action in multiple places unless there is a clear UX reason.

---

## 7. Expand/collapse behaviour

Expansion must be predictable and reversible.

- Clicking the expand/details control opens the card.
- Clicking the same control again, or the designated close control, must reliably collapse it.
- Do not create multiple independent expanded states accidentally.
- If only one card is intended to be expanded at a time, maintain that behaviour consistently.
- Preserve the existing left-side toggle/bookmark behaviour where present.
- Any interaction that already works on `index.html` or `story.html` should be treated as a reference pattern before implementing the same interaction elsewhere.

---

## 8. Share and download actions

Avoid duplicate share buttons.

Each business card should have **one clear Share action** in its appropriate location. Do not add another copy of the same action merely because the card has expanded.

### Download target

The planned download feature is intended to produce **one commonly supported image format** containing only the selected business-card information—not the entire webpage.

The exact image format/implementation can be finalized when the feature is developed. Do not add three separate PDF/PNG/JPG choices unless explicitly requested.

---

## 9. Maps/location standard

For business cards with a location:

- Show the address clearly.
- Where an embedded Google Map is provided, use the supplied Google Maps Embed code rather than inventing a different location.
- The current reference location for the dummy content is the Hukkerimath High School area in Haveri.
- The supplied coordinates/reference may be used when required:
  - Latitude: `14.79026552521703`
  - Longitude: `75.40818465727922`
- A Google Maps embed may contain its own Maps control. Do not unnecessarily add duplicate Maps buttons.
- If a Maps link/button is explicitly required, use the supplied Google Maps destination rather than generating a different location.

Current reference Google Maps destination:

`https://maps.app.goo.gl/DmsACrZU8KJLaRtNA`

When using a Google Maps iframe, keep it responsive and resize it through CSS/container dimensions rather than relying on the original fixed `600x450` dimensions.

Do not add a Google Maps API key merely to display an existing embed unless a future requirement actually needs API functionality.

---

## 10. Page scope rule

When the owner says a change applies to a specific page, **touch only that page and the minimum necessary shared asset/code**.

For example:

> “Work only on `samparka.html`.”

means do not redesign `index.html`, `story.html`, navigation, or other pages unless a dependency genuinely requires it.

Before changing shared CSS/JS, check whether the change could unintentionally affect other pages.

---

## 11. Preserve working functionality

Existing working behaviour is valuable reference material.

Before changing an interaction:

- Check whether the same behaviour already works elsewhere in the project.
- Reuse or align with the working implementation where practical.
- Do not replace working code with a new implementation without a reason.

Examples include:

- Left-side navigation/bookmark toggle.
- Expand/collapse behaviour.
- Share controls.
- Responsive card layout.
- Header/navigation behaviour.

---

## 12. Code quality and maintainability

Prefer code that is:

- Semantic.
- Modular where useful.
- Clearly named.
- Commented only where comments add real value.
- Free from unnecessary duplication.
- Easy for another AI assistant to understand later.
- Easy for a human to inspect and modify.

Avoid:

- Massive repeated inline styles.
- Unexplained magic numbers where a CSS variable or named value would help.
- Multiple competing implementations of the same component.
- Dead JavaScript/CSS.
- Unnecessary libraries.
- Hard-coded desktop-only dimensions that break on mobile.

Use CSS custom properties for recurring design values where practical.

---

## 13. Content and language

The website is primarily Kannada-first.

Do not translate or rewrite existing Kannada content unless requested.

When adding Kannada text:

- Preserve the intended meaning.
- Keep wording natural and readable.
- Avoid unnecessary formal/robotic language.
- Do not replace Kannada with English simply because English is easier to implement.

English may be used where it is part of a real business name, technical term, URL, product/service name, or user-provided content.

---

## 14. Future authenticated/community features

The current site may remain static during the early development phase, but the long-term architecture is intended to support authenticated, database-backed community features without requiring the frontend to be moved away from GitHub unnecessarily.

A future phase may introduce:

- Invitation-based membership.
- User accounts/login.
- Multiple authentication methods such as Google, email/password, magic link/OTP, Apple, or other methods supported in the future.
- Account/profile settings.
- Public viewing of approved posts.
- Authenticated posting/editing/deletion.
- Blogs, poems and community posts.
- Gallery uploads and media storage.
- Database-backed member/content records.
- Project/batch-specific access and content.
- Community chat/realtime features.

Supabase is the planned candidate for authentication, database, storage and realtime functionality when this phase begins.

### Authentication foundation principles

When authentication is introduced:

1. **Supabase Auth should provide the permanent authentication identity.**
2. The Supabase Auth user UUID (`auth.users.id`) should be treated as the durable identity key for a person.
3. Our application profile/user table should reference that UUID rather than creating a separate authentication identity.
4. A person's authentication method (Google, email/password, Apple, etc.) must not be treated as the person's identity itself.
5. The architecture should allow multiple authentication identities/methods to be associated with the same underlying user where supported.
6. A user who signs in with Google or Apple should not be required to create a separate Snehakoota password unless they later choose to add one.
7. Invitation/onboarding should be treated as an access or membership mechanism, not as a separate type of user.
8. Authentication should remain independent of the device/platform. The same underlying user should be able to authenticate through supported browser/mobile clients.
9. Account settings should eventually provide user-facing controls for supported authentication/security operations such as password setup/change, linked identities, password recovery and MFA where enabled.
10. Secrets, service-role keys and other privileged credentials must never be placed in GitHub-hosted frontend code.

### Application roles and project membership

Snehakoota application roles are **not the same thing as Supabase Dashboard/project administrators**.

The long-term application model should allow a user to have a project-specific relationship such as:

`user → project → role`

For example:

- `member`
- `admin`

A user may eventually be an admin in one project and only a member in another project.

Application roles should be represented by application authorization data and enforced by database security policies, rather than by trusting frontend JavaScript.

### Row Level Security (RLS)

Supabase/PostgreSQL Row Level Security is part of the planned database security model.

RLS should be enabled and policies should define what authenticated users can do. The application should not rely only on hiding or showing buttons in HTML.

For the future post system, the intended baseline is:

- Anyone/appropriate public users → read published content where intended.
- Authenticated user → create a post.
- Author → edit/delete their own post.
- Snehakoota admin → moderate other users' posts where explicitly permitted.
- Similar rules should apply to future community features such as chat.

A Snehakoota admin does **not** automatically become a Supabase infrastructure/Dashboard administrator.

### Project and content model

The database should be designed around durable concepts rather than today's page layout.

The intended long-term separation is:

- **User** → who the person is.
- **Project** → where the content/community belongs.
- **Project membership/role** → what the user can do in that project.
- **Post** → the common content entity.
- **Post category** → how a project classifies/presents a post.

For Snehakoota, `ಬರಹಗಳು` is the user-facing umbrella for posts. Initial categories are:

- `ಲೇಖನಗಳು`
- `ಕವಿತೆಗಳು`
- `ನೆನಪುಗಳು`
- `ಚಿಂತನೆಗಳು`

These are categories/metadata of a common `Post` entity, not separate database systems.

The same underlying post model should remain reusable for other projects such as OneHaveri, where the categories and presentation may be completely different.

### Schema evolution and data preservation

The database should be designed so future changes can be made through migrations/version-controlled schema changes rather than manual rebuilding.

The project should aim for:

**upgrade → migrate → preserve existing users/data → continue**

rather than:

**replace → recreate users/data → manually repair content**

When Supabase/database development begins:

- Track important schema changes through migration files/version control.
- Avoid designing tables around temporary UI labels or today's HTML structure.
- Use stable IDs/relationships for users, projects, categories and posts.
- Keep authentication identity separate from application profile data.
- Keep database records separate from uploaded files/storage objects.
- Plan backups/export strategy before real community data becomes significant.
- Do not add tables or infrastructure merely because a future feature might someday need them; introduce them when the requirement becomes real.

### Frontend/backend separation

The website frontend may continue to be hosted from GitHub/Cloudflare or another suitable static frontend host.

Introducing Supabase does **not** by itself require moving HTML/CSS/JavaScript away from GitHub.

The intended separation is:

- **GitHub** → source code/version control.
- **Frontend hosting (for example Cloudflare/GitHub Pages)** → serves the website.
- **Supabase Auth** → authentication and sessions.
- **Supabase Database/PostgreSQL** → application data.
- **Supabase Storage** → uploaded files/media where appropriate.
- **Supabase Realtime** → future live features such as chat where appropriate.

Privileged server-side operations, when eventually required, may use a secure backend/Edge Function. Privileged keys must never be exposed in browser code.

### Development principle

Do not prematurely add authentication, database code, invitation systems or backend dependencies to today's static pages merely because they are planned.

However, once the authenticated phase begins, **do not take shortcuts that make future invitation, multiple-login-method, mobile, project/batch, role or permission support difficult**.

The foundation should be deliberately small, but transformation-ready.

---

## 15. Current invitation and membership foundation

The invitation system has now moved from planning into an initial working implementation. This section records the decisions that future AI sessions must preserve unless the owner explicitly changes them.

### Registration and invitation concepts

Two concepts must remain separate:

- **Authentication/signup availability** → whether Supabase Auth permits creation of a new authentication user.
- **Snehakoota registration/invitation policy** → whether the application requires an invitation or otherwise permits onboarding/membership.

Supabase provides a Dashboard-level **Allow new users to sign up** switch. When it is OFF, existing users can still sign in while new authentication users cannot be created. This is useful as a temporary development/operational safety switch and should not be duplicated unnecessarily in the application configuration table.

The application's invitation/registration policy may later become invitation-only. A frontend switch may control presentation/UX, but security decisions must remain enforced server-side.

### Membership foundation

`HSHS2004` is currently the default/initial Snehakoota membership concept. The architecture must not assume that it will remain the only membership forever.

The intended long-term model supports:

- One user → one or more memberships.
- Membership-specific status such as `pending` or `active`.
- Membership data separate from Supabase authentication identity.
- Future selection of one or more memberships when the schema and UI are ready.

The current invitation RPC intentionally supports **one optional membership per invitation** plus a **general invitation**. Multiple-membership invitation selection is a planned schema enhancement, not to be simulated through repeated single-membership fields.

### Invitation types

The current design supports two invitation meanings:

1. **Membership-specific invitation** — the sender selects an active membership and the invitation carries that suggested membership context.
2. **General Snehakoota invitation** — the sender does not pre-attach a membership. The receiver can authenticate and later be presented with available membership choices according to the onboarding rules.

A general invitation must not automatically grant an administrative role or manufacture a membership merely because authentication succeeded.

### Invitation generation rules

The current backend RPC is:

`public.create_invitation(p_membership_id bigint default null)`

The intended sequence is:

`authenticated sender → validate profile → validate invitation configuration → validate optional membership → generate secure random token → hash token → persist invitation → return usable token/path`

Important rules:

- Only authenticated users may execute the invitation RPC.
- The inviter must have an active application profile.
- A supplied membership must belong to the inviter and be active.
- Referenced school/batch data must be active.
- The raw invitation token is not stored; a secure hash is stored.
- The invitation record is persisted before the UI displays the resulting link.
- Invitation validity is checked server-side, not by trusting frontend values.
- Invitation errors should return structured application-level codes/types/messages rather than raw database errors such as duplicate-key violations.
- A new invitation generation creates a **new invitation/token**. An old link is not silently reused for a later invitation.

### Invitation expiry and retention

The current standard invitation validity/retention period is **5 days**, represented through configuration rather than scattered hard-coded backend values.

The intended lifecycle is:

`created → usable until expires_at → cleanup/delete`

The project should prefer deleting expired invitation records rather than accumulating a permanent history of expired tokens on the free database plan unless a future audit requirement makes retention necessary.

A scheduled cleanup mechanism is planned. Manual SQL cleanup is acceptable during development/testing, but cleanup logic should eventually be handled by a controlled server-side job/RPC.

### Invitation UI philosophy

The Account widget is the entry point for a signed-in sender.

The current sender flow is intentionally lightweight and mobile-friendly:

`Invite a friend → membership/general choice → Generating… → persisted invitation → link → Copy/Share`

The UI should not expose a link before the backend has successfully persisted the invitation.

The sender can close the panel at any time. **Copy and Share must not close the panel.** Copy should give a simple human-facing confirmation such as `Link copied.` and then return to the normal invitation message. Share should similarly leave the panel available.

The invitation UI should remain modular. Current frontend UX switches include the membership-selection mode and whether the general-invitation option is shown. These are presentation controls only and must never be treated as security controls.

The current invitation wording should describe the link as an **invitation link**, not a "reusable invitation link", because each generation creates a new token/link.

### Receiver-side design — pending implementation

The invitation URL is expected to carry enough information for the application to identify and validate the invitation before granting or creating membership.

The planned receiver flow is:

`open invitation URL → identify invitation → show invitation context → authenticate if required → validate invitation server-side → determine membership/onboarding result`

A receiver who already has an account must be able to authenticate without being treated as a new user. A general invitation should allow the receiver to choose from currently available membership options according to the eventual onboarding rules.

Receiver-side implementation is **not yet complete** and must not be assumed to exist merely because invitation generation works.

### Multiple-membership invitation — explicit future item

The sender UI may eventually allow selecting **one or more memberships** in a single invitation. This requires a deliberate schema/API enhancement before implementation.

Do not encode multiple memberships by overloading the current single `suggested_school_id` / `suggested_batch_id` fields.

When this item is resumed, decide and document:

- One invitation → multiple membership selections.
- Whether the receiver can accept all or choose among them.
- How duplicate/already-existing memberships are handled.
- How membership status is created/updated for each selection.
- How the invitation is displayed and audited.
- Whether one token represents the whole invitation set.

---

## 16. Supabase operational foundation

The project now has a small amount of real Supabase infrastructure in addition to the planned architecture.

### Configuration

Application configuration is intended to live in a configuration table so operational values can be changed without scattering constants through SQL functions.

Current invitation-related configuration includes:

- `invitation_enabled` → controls whether the invitation-generation backend is available.
- `invitation_expiry_days` → controls the invitation lifetime; current standard value is 5 days.

Configuration is application policy. Frontend controls may hide/show UI, but RPCs must still validate the relevant configuration server-side.

### Heartbeat / project activity

A lightweight `supabase_heartbeat()` function has been established as an operational activity check for the Supabase projects. It is intentionally not dependent on application data tables and may read a PostgreSQL system catalog so the call represents a real database interaction.

GitHub Actions is being used to call the heartbeat on a schedule. This is an operational keep-alive mechanism, not an application feature, and it should remain isolated from Snehakoota business logic.

If a heartbeat workflow fails, the failure should be investigated/retried by the workflow/operations setup; it is not a reason to add heartbeat code to the website UI.

### Supabase Auth signup switch

For development and temporary operational control, Supabase Dashboard's **Allow new users to sign up** setting can be turned OFF when the owner is not actively testing onboarding. Existing users remain able to sign in.

This is intentionally separate from the application's invitation policy.

### Security baseline

The invitation RPC is a `SECURITY DEFINER` operation with a controlled search path and explicit execution grants. Privileged database logic must remain server-side.

The browser may use a Supabase publishable/anonymous client key where Supabase documents that key as safe for client use, but must never contain a service-role key or database secret.

RLS remains part of the database authorization model. Hiding UI controls is never sufficient protection.

---

## 17. Security and privacy

Never place secrets in HTML, CSS or client-side JavaScript.

Do not commit:

- API secret keys.
- Database passwords.
- Service-role keys.
- Private access tokens.
- Personal authentication credentials.

Public client-side configuration may be used only when the relevant service explicitly documents it as safe for client exposure.

---

## 18. AI change protocol

For every requested change, the AI should follow this order:

### Step 1 — Understand
Identify the exact page, component and behaviour being changed.

### Step 2 — Inspect
Read the current implementation from the repository before proposing code.

### Step 3 — Plan
Explain briefly what will change and what will remain untouched if the change is non-trivial.

### Step 4 — Implement
Make the smallest appropriate change.

### Step 5 — Verify
Check for:

- Broken HTML.
- Broken JavaScript.
- Missing assets.
- Duplicate controls.
- Mobile layout problems.
- Desktop layout problems.
- Regression of existing interactions.
- For Supabase changes: authorization, RLS/grants, error handling, configuration dependencies and persistence order.

### Step 6 — Report
State:

- Files changed.
- Main changes.
- Any assumptions.
- Anything that still needs browser/device testing.
- Any follow-up architectural item deliberately left pending.

---

## 19. Do not over-engineer the current project

Snehakoota.in is being built incrementally.

The priority is:

**working → clean → responsive → maintainable → extensible**

not:

**complex → framework-heavy → over-engineered**

Future architecture should be anticipated, but future infrastructure should not be implemented before it is needed.

---

## 20. Current project philosophy

This project is a community project first and a technology project second.

Technology should serve:

- Friends.
- Community participation.
- Easy discovery.
- Good storytelling.
- Trust.
- Simplicity.
- Long-term maintainability.

Every new feature should be evaluated against these principles.

---

## 21. Working instruction for future AI sessions

When starting work on this repository, the AI should treat this README as the **baseline project contract**.

If a future user request conflicts with this README, the user's explicit current request takes priority, but the AI should point out the conflict before making a potentially destructive or architectural change.

When uncertain, **inspect the existing repository first and ask rather than guessing**.
