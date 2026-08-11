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

The current site is static and does **not** yet require user login/database functionality.

A future phase may introduce:

- Invitation-based membership.
- User accounts/login.
- Invitation codes/links that allow existing members to invite others.
- Public viewing of approved posts.
- Authenticated posting/commenting.
- Blogs, poems and community posts.
- Gallery uploads.
- Database-backed member/content records.

A service such as Supabase may be considered for authentication/database/storage when that phase begins.

**Do not prematurely add authentication, database code, invitation systems or backend dependencies to the current static pages.**

When this phase begins, design public access and authenticated access as separate permissions while keeping public content viewable where intended.

---

## 15. Security and privacy

Never place secrets in HTML, CSS or client-side JavaScript.

Do not commit:

- API secret keys.
- Database passwords.
- Service-role keys.
- Private access tokens.
- Personal authentication credentials.

Public client-side configuration may be used only when the relevant service explicitly documents it as safe for client exposure.

---

## 16. AI change protocol

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

### Step 6 — Report
State:

- Files changed.
- Main changes.
- Any assumptions.
- Anything that still needs browser/device testing.

---

## 17. Do not over-engineer the current project

Snehakoota.in is being built incrementally.

The priority is:

**working → clean → responsive → maintainable → extensible**

not:

**complex → framework-heavy → over-engineered**

Future architecture should be anticipated, but future infrastructure should not be implemented before it is needed.

---

## 18. Current project philosophy

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

## 19. Working instruction for future AI sessions

When starting work on this repository, the AI should treat this README as the **baseline project contract**.

If a future user request conflicts with this README, the user's explicit current request takes priority, but the AI should point out the conflict before making a potentially destructive or architectural change.

When uncertain, **inspect the existing repository first and ask rather than guessing**.
