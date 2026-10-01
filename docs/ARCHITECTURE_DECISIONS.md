# RAYKELS LUXURY COLLECTIONS
# ARCHITECTURE DECISION LOG

## ADR-001 — API is the catalogue source of truth

Decision:
The storefront reads products from /api/products.

Reason:
Prevents duplicated catalogue data and allows the website, future apps and other clients to consume the same product system.

Status:
Accepted.

---

## ADR-002 — Product video is first-class media

Decision:
Videos are stored and represented separately from images but normalized into a unified frontend media model.

Reason:
Raykels sells through visual storytelling and product video must be treated as a real catalogue asset rather than an afterthought.

Status:
Accepted.

---

## ADR-003 — Mixed-media product experiences

Decision:
Product carousels and product pages must support image and video media together.

Reason:
A product may need multiple photographs plus demonstration/lifestyle video.

Status:
Accepted.

---

## ADR-004 — Physical orphan cleanup

Decision:
When product media is removed through an update, files no longer referenced by the product are physically deleted.

Reason:
Prevents storage accumulation and keeps filesystem state aligned with catalogue state.

Status:
Accepted.

---

## ADR-005 — Secure media boundaries

Decision:
Product media deletion is restricted to the approved uploads/products directory and must reject unsafe paths.

Reason:
Filesystem operations must never become an arbitrary file-deletion mechanism.

Status:
Accepted.

---

## ADR-006 — Reusable template architecture

Decision:
The platform must separate reusable website architecture from Raykels-specific business content.

Reason:
The final system should be reproducible for other businesses.

Status:
Accepted.

---

## ADR-007 — Storytelling-first homepage

Decision:
The homepage is designed as a connected fashion story rather than a collection of unrelated sections.

Reason:
The Raykels experience is intended to feel like entering a fashion world.

Status:
Accepted.

---

## ADR-008 — Character as a UI/storytelling element

Decision:
A cartoon Gen-Z/Barbie-like fashion character is part of the experience.

Reason:
Inspired by Head First HTML & CSS visual storytelling and used to guide users through the brand world.

Status:
Accepted.

---

## ADR-009 — Playful interaction

Decision:
Buttons and interactive elements should have animated personality.

Reason:
The intended Gen-Z/funky identity requires interaction beyond conventional static CTAs.

Constraint:
Animations must remain accessible and respect reduced-motion preferences.

Status:
Accepted.

---

## ADR-010 — Security before convenience

Decision:
No design or feature request overrides security requirements.

Reason:
The platform is intended to become a reusable architecture and must establish trustworthy foundations.

Status:
Accepted.

---

## ADR-011 — Mobile-first development

Decision:
Mobile behaviour is a primary design target rather than a later adaptation.

Reason:
The platform is being developed and tested on an Android phone and must provide a strong mobile commerce experience.

Status:
Accepted.

---

## ADR-012 — Frontend/backend contract alignment

Decision:
Backend changes and frontend changes must be treated as one system.

Reason:
Incremental mismatches create fragile applications.

Status:
Accepted.

---

## ADR-013 — API-first future mobile compatibility

Decision:
Business data and catalogue logic should remain consumable independently of the website presentation.

Reason:
Future Android and iPhone applications should be able to use the same backend.

Status:
Accepted.


## Decision — Unified Homepage Collection/Service Cards — 2026-09-30

The RAYKELS homepage uses one unified card-sizing system across its primary collections and secondary service/collection cards.

Canonical sequence:
Luxury Hair → Luxury Bags → Luxury Shoes → Children's Wear → Wig Care → Home Delivery → Consultation.

Children's Wear follows the three primary product collections. The three services follow Children's Wear.

All seven cards use the same core visual sizing system as the three primary collection cards, with responsive adaptations permitted. The purpose is to maintain one coherent Gen-Z fashion/storybook visual language rather than allowing service sections to become disproportionately large.


---

## ADMIN ARCHITECTURE RESTRUCTURE — CHECKPOINT 2026-09-30

### Project Level
LEVEL 1 — Admin Architecture Restructure

### Current State
The existing admin architecture currently contains:
- Dashboard
- Products
- Add/Edit Product

The existing product, image, video, cart, and inventory systems are functioning and must be protected during the restructure.

### New Admin Architecture
The admin platform is being restructured into five primary modules:

1. Dashboard
2. Orders
3. Products
4. Analytics
5. Settings

The restructure must use a coherent view/state/event architecture rather than adding isolated patches to the existing three-view implementation.

### Order Architecture Decision
Customer order submission creates a PENDING ORDER REQUEST.

Submitting an order must NOT immediately decrement inventory.

The administrator must be able to:
- review the request
- inspect requested quantities
- contact the customer by WhatsApp
- contact the customer by phone
- discuss large orders
- confirm available quantity
- agree on delivery arrangements and delivery fee
- confirm or cancel the order

Inventory is committed/decremented only when the administrator confirms the order.

The server remains authoritative for product, pricing, inventory, order status, and confirmation operations.

### Analytics Architecture Decision
Analytics will be privacy-conscious and based on normal website events, including:
- visitors/sessions
- page views
- product views
- product interactions
- search/filter activity
- add-to-cart
- checkout initiation
- submitted orders
- conversion funnel
- traffic over time

Anonymous visitor activity must remain distinguishable from identifiable customer/order information.

### Architecture Safety Rules
- Inspect architecture before difficult fixes.
- Do not patch around structural problems indefinitely.
- Keep frontend and backend contracts aligned.
- Preserve existing security controls.
- Preserve product image/video lifecycle behavior.
- Preserve working product CRUD.
- Preserve server-side authority.
- Make structural changes incrementally.
- Test each layer before proceeding to the next.
- Create checkpoints before major structural changes.
- Do not introduce competing state/view architectures.
- New requirements must be documented in canonical project memory before or alongside implementation.
- Canonical memory must describe the project but must never be embedded into application runtime code unless explicitly required by a feature.

### Current Checkpoint
Admin HTML has been inspected.
Admin JavaScript lifecycle has been inspected.
Existing admin navigation contains Dashboard, Products, and Add Product.
Existing event binding and initialization have been inspected.
The next implementation step is restructuring the admin navigation/view architecture before implementing Orders or Analytics.

### Protected Systems
Do not unnecessarily modify:
- product media/video upload lifecycle
- product CRUD
- product API contracts
- cart behavior
- existing inventory security
- storefront product rendering

### Next Step
Create the expanded admin navigation/view architecture safely, then syntax-check and verify existing product functionality before implementing order operations.


---

## CHECKPOINT — LEVEL 1 / STEP 1 — VIEW REGISTRY COMPLETE — 2026-09-30

### Completed
- Existing admin HTML and JavaScript lifecycle inspected.
- Central `adminModules` registry established in `admin.js`.
- `setView()` now uses the centralized module registry.
- Dashboard, Orders, Products, Add Product, Analytics, and Settings are defined as admin module contracts.
- Orders, Analytics, and Settings are registered only; their functionality has NOT yet been implemented.
- `node --check admin.js` passed with exit code 0.

### Architectural Purpose
The admin interface now has a single source of truth for module names, view IDs, titles, and subtitles. Future modules must use this architecture rather than creating independent navigation/view logic.

### Protected Systems
No intentional changes were made to:
- product CRUD
- product image/video lifecycle
- cart behavior
- inventory security
- storefront product rendering

### Current Level
LEVEL 1 — Admin Architecture Restructure

### Current Step
STEP 1 — View Registry Foundation — COMPLETE

### Next Step
Add the corresponding admin HTML navigation and view containers, then perform syntax and regression checks before implementing Orders.


---

## CHECKPOINT — LEVEL 1 / STEP 2 — HTML MODULE STRUCTURE COMPLETE — 2026-09-30

### Completed
The admin HTML now contains the six architectural modules:
- Dashboard
- Orders
- Products
- Add Product
- Analytics
- Settings

The navigation contains matching `data-view` entries for all six modules.

The existing Products and Add Product interfaces remain intact.

`admin.js` syntax validation passed with exit code 0.

### Current Level
LEVEL 1 — Admin Architecture Restructure

### Current Step
STEP 2 — HTML Module Structure — COMPLETE

### Next Step
STEP 3 — Orders Architecture.

The next stage will inspect and redesign the order lifecycle before implementing admin order controls. Customer order submission must remain a pending request and must not consume inventory until administrator confirmation.


## Security Foundation — Verified 2026-09-30

The Raykels admin architecture now uses server-enforced authentication and same-origin protection.

Verified controls:
- Admin credentials stored outside public frontend code.
- Passwords stored using Node crypto scrypt hashing.
- Cryptographically random server-side admin sessions.
- HttpOnly SameSite admin session cookie.
- Session expiration.
- Login rate limiting.
- Admin authentication middleware on protected routes.
- Same-origin protection on authenticated state-changing admin routes.
- Product create/update/delete protected.
- Product media upload protected.
- Admin order access protected.
- Admin logout protected.
- Admin session endpoint protected.
- Public catalogue endpoint remains separate.
- Public customer order submission remains separate.
- No password or authentication token is stored in admin.js.
- Public password recovery is intentionally not implemented.

Security boundary tests:
- Unauthenticated admin product mutation: HTTP 401.
- Authenticated mutation without Origin: HTTP 403.
- Browser admin login: successful.
- Browser admin logout: successful.
- Session after logout: HTTP 401.

This security foundation must remain intact during subsequent order, analytics, and admin architecture work.

# ARCHITECTURE DECISION — 2026-09-30
## Lean Settings + First-Party Analytics

### Decision

Raykels will use a small server-managed settings layer and a first-party analytics layer.

### Settings

Settings are limited to business-relevant controls:

1. Homepage
2. Contact & Social
3. Payment
4. Basic Site

No arbitrary HTML/CSS editor or excessive configuration controls.

Public-safe settings may be exposed to the storefront through a read-only API.

Administrative settings remain protected by admin authentication and same-origin protection.

### Analytics

Raykels will not depend on Google Analytics or Meta Pixel for its own Admin Analytics.

External analytics remain optional integrations.

Raykels will maintain its own lightweight event data for:
- visitors
- sessions
- page views
- product views
- product clicks
- search/filter activity
- add-to-cart
- checkout started
- orders submitted

The system will provide aggregate reporting to the administrator.

Analytics should use anonymous/session identifiers rather than unnecessary personal tracking.

### Data Flow

Storefront
  ↓
Raykels tracking/event client
  ↓
POST /api/analytics/events
  ↓
server-side analytics store
  ↓
protected admin analytics API
  ↓
Admin Analytics UI

Settings:

Admin Settings
  ↓
protected admin settings API
  ↓
server-side site configuration
  ↓
public-safe site configuration API
  ↓
storefront components

### Security

Analytics administration and settings administration require authenticated admin sessions.

Customer-facing analytics event submission remains separate from administrative analytics retrieval.

Do not expose raw administrative analytics storage directly to the public.

### Compatibility

The architecture must remain reusable for a future Raykels mobile application.

The API contracts should therefore remain platform-independent and should not depend on browser-only storage or DOM structures.

### Protected Existing Architecture

This decision does not replace or weaken:
- product/media management
- video support
- cart engine
- checkout
- order creation
- admin order confirmation
- admin authentication
- payment settings

