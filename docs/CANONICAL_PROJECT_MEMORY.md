# RAYKELS LUXURY COLLECTIONS
## CANONICAL PROJECT MEMORY & ARCHITECTURE SPECIFICATION

Version: 1.0
Date: 2026-09-29
Project: RAYKELS LUXURY COLLECTIONS
Project Number: 2
Status: Active Development

---

# 1. PROJECT IDENTITY

RAYKELS LUXURY COLLECTIONS is a premium Nigerian fashion and beauty commerce platform.

This project is separate from Victor LifeOS.

The website is NOT intended to be a one-off static website.

It must be designed as:

- a reusable website template
- an editable commerce platform
- a reproducible architecture
- a foundation that can be adapted to other businesses
- a future-compatible foundation for Android and iPhone applications

The system should separate reusable architecture from business-specific content.

Business content, branding, catalogue data, navigation, media and configuration should be editable without rebuilding the underlying platform.

---

# 2. CORE BUSINESS INFORMATION

Business name:

RAYKELS LUXURY COLLECTIONS

Office:

HiG 027 FATI ABUBAkAR Block,
Wuye Ultramodern Market,
Abuja, Nigeria.

WhatsApp:

07057193583

Website/social architecture:

- One Instagram profile/link only.
- Do not create multiple Instagram links for the same business.
- Facebook may be represented separately where appropriate.

---

# 3. BUSINESS OFFER

RAYKELS LUXURY COLLECTIONS provides:

## Main Products

1. Luxury Hair
2. Luxury Bags
3. Luxury Shoes

## Services

1. Wig Care
2. Home Delivery
3. Consultation

## Secondary Collection

Children's Wear

Children's Wear follows the main products and services in the site's information hierarchy.

---

# 4. PRIMARY INFORMATION HIERARCHY

The homepage must communicate the business in this order:

WELCOME / HERO

↓

Luxury Hair

↓

Luxury Bags

↓

Luxury Shoes

↓

Wig Care

↓

Home Delivery

↓

Consultation

↓

Children's Wear

↓

Social / Contact / Footer

The hierarchy must remain consistent across:

- navigation
- homepage storytelling
- catalogue
- category pages
- product discovery
- calls to action
- future mobile applications

---

# 5. VISUAL IDENTITY

The website should feel like a living luxury fashion world.

The desired visual direction is:

- Gen-Z
- Barbie-inspired
- funky
- playful
- fashionable
- feminine
- premium
- energetic
- editorial
- story-driven

It must NOT feel like:

- a generic corporate template
- a basic Shopify clone
- a plain grid of products
- an ordinary rectangular-button website
- an AI-generated generic luxury website

Luxury should remain visible underneath the playful personality.

The visual language should combine:

PREMIUM LUXURY
+
GEN-Z ENERGY
+
FASHION STORYTELLING
+
PLAYFUL INTERACTION

---

# 6. HEAD FIRST HTML & CSS INFLUENCE

The project takes inspiration from the visual storytelling philosophy of the book:

Head First HTML & CSS

Particularly:

- character-driven presentation
- visual storytelling
- personality
- playful composition
- visual elements that guide the reader
- interaction between character, content and layout

The Raykels implementation should modernize this concept for a premium fashion-commerce website.

A cartoon Gen-Z / Barbie-like fashion character should become part of the storytelling system.

The character is not merely decoration.

It can:

- introduce sections
- point toward products
- guide the user
- react to interaction
- appear beside CTAs
- provide visual transitions
- create continuity between sections

The character system must remain reusable and replaceable.

---

# 7. HOMEPAGE EXPERIENCE

The homepage should feel like entering a fashion world.

Opening experience:

WELCOME TO RAYKELS COLLECTION

Primary lifestyle phrase:

Luxury, beautifully lived.

The hero should be visually dominant and immersive.

Requirements:

- full-width hero
- responsive desktop/mobile layout
- rotating imagery
- multiple slides
- smooth transitions
- mobile swipe/drag
- navigation controls
- indicators
- overlaid content
- usable CTAs
- accessible controls
- lightweight loading
- reusable carousel architecture

The hero and catalogue should not feel like disconnected components.

---

# 8. PRODUCT CAROUSEL

A catalogue-driven product carousel must appear EARLY in the homepage.

It should be close to the opening experience rather than buried near the bottom.

The carousel must use live catalogue data from:

/api/products

The frontend must not maintain a second hard-coded product catalogue.

Product media must support:

- images
- videos
- mixed image/video sequences

Videos are FIRST-CLASS product media.

The carousel must be capable of showing:

IMAGE
IMAGE
VIDEO
IMAGE
VIDEO

or any other valid catalogue-driven sequence.

Video cards must:

- load safely
- display correctly
- provide playback
- respect mobile behaviour
- avoid unnecessarily loading every large video at once
- remain compatible with the product page media system

---

# 9. PRODUCT ARCHITECTURE

Products are catalogue entities.

A product may contain:

- id
- name
- slug
- category
- description
- price
- images
- videos
- variants
- stock
- published state
- timestamps
- additional structured metadata

Media may be represented as strings or structured objects, but the canonical frontend media layer must normalize them.

Frontend media normalization is provided by:

products/catalog.js

Important function:

getProductMedia(product)

This function combines:

product.images
+
product.videos

into a unified media model.

The media model identifies:

- id
- type
- url
- alt/title
- poster where applicable

This architecture must be preserved.

---

# 10. CURRENT DATA SOURCE

Active product store:

data/products.json

Primary catalogue API:

GET /api/products

The frontend catalogue loader uses:

/api/products

Do NOT revert to:

/products/catalog.json

The API is the source of truth.

---

# 11. ADMIN PRODUCT SYSTEM

The administrator must be able to:

- create products
- edit products
- delete products
- add images
- add videos
- remove selected videos
- remove existing videos
- update product information
- manage product visibility
- manage variants/stock where supported

Product uploads are handled through:

/api/uploads/products/:productId

Supported media currently includes:

- JPEG
- PNG
- WebP
- MP4
- WebM
- QuickTime video

Current maximum product video size:

100 MB

Do not weaken upload restrictions merely to make uploads easier.

---

# 12. MEDIA STORAGE

Product media is stored beneath:

uploads/products/<product-id>/

Deleting a product must remove its product media directory.

Updating a product must remove physical media files that are no longer referenced by the product.

The backend currently performs orphaned product-media cleanup during PUT.

This behaviour is intentional and must be preserved.

---

# 13. SECURITY PRINCIPLES

Security is a CORE architectural requirement.

Never trade security for convenience or visual functionality.

Required principles:

- validate all incoming data
- validate uploaded file types
- enforce file size limits
- prevent path traversal
- restrict filesystem deletion to approved product-media directories
- never trust client-provided filenames
- do not allow arbitrary filesystem access through API parameters
- avoid unsafe dynamic HTML
- escape user-controlled content when inserted into HTML
- keep backend filesystem operations server-side
- keep API boundaries explicit
- avoid exposing secrets
- avoid unnecessary permissions
- do not introduce insecure CORS behaviour
- do not expose internal files/directories unnecessarily
- preserve product ownership/control boundaries
- fail safely when data is malformed

Any future authentication/admin security layer must be added without breaking the public catalogue API.

---

# 14. FRONTEND SECURITY

Frontend code must assume catalogue data may contain unexpected values.

Use safe rendering practices.

Where HTML is dynamically constructed:

- escape product names
- escape labels
- escape media IDs
- escape URLs appropriately
- avoid innerHTML for untrusted content where possible
- never execute catalogue data as code

Existing escapeHtml mechanisms should be preserved.

---

# 15. API CONTRACT PRINCIPLE

Frontend and backend must be designed together.

Every API contract should have:

- documented request structure
- documented response structure
- predictable error behaviour
- validation
- compatibility considerations

Do not change backend response structures without checking every frontend consumer.

Do not change frontend assumptions without checking the backend.

Before major changes:

1. inspect backend
2. inspect consuming frontend
3. modify both where necessary
4. syntax-check
5. test the API
6. test the browser behaviour

---

# 16. REUSABLE TEMPLATE ARCHITECTURE

The final architecture should make it possible to reproduce the site for another business by replacing configuration/content rather than rebuilding the application.

Business-specific information should eventually be centralized into configuration/data such as:

- brand name
- logo
- colours
- typography
- business description
- address
- WhatsApp
- social links
- navigation
- categories
- services
- hero slides
- featured sections

Reusable systems should include:

- header
- navigation
- hero carousel
- catalogue loader
- product carousel
- product card
- media viewer
- product page
- admin product manager
- API layer
- upload layer
- cart foundation
- checkout foundation
- reusable CTA components
- responsive layout system

The goal is:

ONE ARCHITECTURE
+
DIFFERENT BUSINESS CONFIGURATION

---

# 17. FUTURE COMMERCE ARCHITECTURE

The platform should be capable of growing into a complete e-commerce system.

Planned foundations include:

- product catalogue
- categories
- product pages
- variants
- stock
- cart
- checkout
- customer/order flow
- delivery
- consultation
- product enquiry
- order management
- admin management

Do not prematurely implement complicated features if they are not required yet.

Build strong foundations first.

---

# 18. FUTURE MOBILE APPLICATION

The web platform should eventually support Android and iPhone clients.

Therefore:

- business data should be API-driven
- catalogue data should not be hard-coded into pages
- product media should have stable URLs
- API contracts should remain documented
- authentication should be separable from presentation
- business logic should not depend entirely on browser-specific code

The website is the first client of the platform, not the entire platform.

---

# 19. ACCESSIBILITY

Accessibility is part of the architecture.

Requirements include:

- semantic HTML
- keyboard-accessible controls
- meaningful alt text
- accessible carousel controls
- visible focus states
- adequate contrast
- reduced-motion consideration
- buttons used for actions
- links used for navigation
- meaningful headings
- mobile usability

Animations must never make the website unusable.

---

# 20. PERFORMANCE

The website should remain lightweight despite rich visuals.

Use:

- lazy loading
- responsive media where possible
- poster images for video
- controlled video playback
- efficient DOM updates
- reusable components
- minimal unnecessary JavaScript
- minimal unnecessary dependencies

Do not automatically load every large product video simultaneously.

---

# 21. ANIMATION SYSTEM

Interactive elements should have personality.

Desired interactions include:

- playful button movement
- subtle dancing motion
- hover reactions
- character reactions
- scroll-based storytelling
- playful micro-interactions
- smooth carousel movement

Animations should remain:

- intentional
- responsive
- lightweight
- accessible
- non-annoying

Respect prefers-reduced-motion.

---

# 22. HOMEPAGE CONTENT WORLDS

The homepage should eventually tell a coherent story.

Suggested narrative:

1. Enter Raykels
2. Discover Luxury Hair
3. Discover Luxury Bags
4. Discover Luxury Shoes
5. Discover Wig Care
6. Discover Home Delivery
7. Meet Consultation
8. Discover Children's Wear
9. Connect socially
10. Contact / Footer

Sections should feel connected rather than like unrelated website blocks.

---

# 23. CURRENT CODEBASE STATE

Known working architecture as of 2026-09-29:

- data/products.json is active
- GET /api/products works
- POST /api/products works
- PUT /api/products/:id works
- DELETE /api/products/:id works
- product media upload works
- image upload works
- video upload works
- physical orphaned product media cleanup works
- product deletion removes product media
- products/catalog.js uses /api/products
- getProductMedia() supports image + video media
- admin product editing can display existing videos
- existing video removal works
- storefront can display the test product video

Known current issue being addressed:

The homepage product carousel exists in the current HTML/JS architecture but is not yet positioned/visualized as intended.

The intended carousel belongs near the beginning of the homepage, around the opening "Luxury, beautifully lived" experience.

Do not assume the current carousel implementation is the final design.

---

# 24. CURRENT DESIGN CSS

Current stylesheet is:

style.css

Current styling is predominantly:

- cream
- black
- gold
- brown
- Cormorant Garamond
- Montserrat
- conventional luxury-editorial styling

This is a starting point, NOT the final visual direction.

The stylesheet must evolve toward the established:

GEN-Z BARBIE
+
FUNKY STORYBOOK
+
LUXURY FASHION
+
HEAD-FIRST CHARACTER STORYTELLING

direction.

Do not destroy working functionality while transforming the visual system.

---

# 25. DEVELOPMENT METHOD

Every significant change follows this workflow:

1. Inspect current implementation.
2. Identify the exact component responsible.
3. Preserve working API/backend behaviour.
4. Make the smallest coherent architectural change.
5. Syntax-check changed JavaScript.
6. Test API if backend was changed.
7. Test browser behaviour.
8. Inspect mobile behaviour.
9. Only then proceed to the next layer.

Do not randomly rewrite files.

Do not repeatedly recreate already-established architecture.

---

# 26. TERMUX DEVELOPMENT CONSTRAINT

Development is being performed on an Android phone using Termux.

The user cannot open another Termux session.

Therefore commands must work in a single session.

When a server needs to remain running while other operations occur, use:

- background processes
- shell job control
- carefully sequenced commands

Do not instruct the user to open another Termux session.

---

# 27. SERVER

Project directory:

~/RaykelsLuxury

Backend:

node server.js

Expected server message:

RAYKELS ADMIN SERVER RUNNING

Local address:

http://localhost:3000

---

# 28. DESIGN PHILOSOPHY

The site should feel intelligent.

It should not merely contain features.

Its architecture should express relationships between:

CONTENT
MEDIA
PRODUCTS
CHARACTER
STORY
INTERACTION
COMMERCE
DATA
SECURITY

The user experience should feel intentionally designed rather than assembled from disconnected components.

---

# 29. NON-NEGOTIABLE RULES

DO NOT:

- lose established project requirements
- revert the API to the old catalog JSON
- make products image-only
- remove video support
- bury the product carousel
- turn the site into a generic corporate luxury template
- remove the character/storytelling concept
- remove the playful interaction concept
- weaken security
- break existing admin functionality
- hard-code products into the homepage
- create multiple Instagram links
- destroy existing product data during redesign
- make frontend/backend contracts inconsistent
- sacrifice mobile usability
- sacrifice accessibility for animation
- create a one-off architecture when a reusable template is possible

---

# 30. CANONICAL PRINCIPLE

RAYKELS LUXURY COLLECTIONS is being built as:

A reusable intelligent commerce website architecture
expressed through a distinctive luxury fashion brand.

The architecture comes first.

The brand experience comes second.

The implementation must serve both.

This document is the canonical project memory.

When future work conflicts with this document, stop and identify the conflict before changing the architecture.


## CANONICAL HOMEPAGE CARD SYSTEM — 2026-09-30

The Raykels homepage follows this canonical world sequence:

1. Luxury Hair
2. Luxury Bags
3. Luxury Shoes
4. Children's Wear
5. Wig Care
6. Home Delivery
7. Consultation

The three primary product collections remain the main visual anchors:
- Luxury Hair
- Luxury Bags
- Luxury Shoes

Children's Wear follows the three primary collections as a secondary collection.

Wig Care, Home Delivery, and Consultation follow Children's Wear as the core service collection.

### Unified Card Rule

Children's Wear, Wig Care, Home Delivery, and Consultation must use the same visual card sizing system as the three primary product cards.

Cards should feel like members of the same RAYKELS visual world:
- consistent dimensions
- consistent visual rhythm
- responsive sizing
- consistent spacing
- shared interaction behavior
- shared Gen-Z / funky storybook aesthetic

Do not create oversized service blocks that visually dominate or break the proportions of the three primary collection cards.

The homepage architecture should present the collections and services as one coherent RAYKELS world while keeping product collections and services semantically distinct.

This is a reusable-template rule and must be preserved in future homepage redesigns.

---

## CURRENT DEVELOPMENT CHECKPOINT — 2026-09-30

**Project:** RAYKELS LUXURY COLLECTIONS  
**Level:** LEVEL 1 — ADMIN ARCHITECTURE RESTRUCTURE

The Raykels admin system is being deliberately restructured from the original Dashboard / Products / Add Product structure into:

- Dashboard
- Orders
- Products
- Analytics
- Settings

This is an architectural change, not a collection of unrelated UI patches.

The order model is also changing: customer checkout creates a pending order request rather than immediately consuming inventory. Admin reviews the request, contacts the customer by WhatsApp or phone where necessary, discusses large quantities and delivery arrangements/fees, then confirms or cancels the request. Inventory is committed only on administrator confirmation.

Analytics will provide privacy-conscious website activity information such as visitors/sessions, page views, product views, interactions, cart activity, checkout initiation, submitted orders, traffic trends, and conversion funnel data. Anonymous visitor activity must remain distinct from identifiable customer/order information.

All future site requirements supplied by the project owner must be treated as canonical project requirements and documented without embedding the documentation into application runtime code unless explicitly required.

Architecture-first rule: when a problem becomes difficult or inconsistent, inspect the architecture, lifecycle, and frontend/backend contract before adding further patches.

Existing working systems — especially product CRUD, product image/video lifecycle, cart behavior, server-side inventory authority, and security controls — must be preserved unless a documented architectural change explicitly requires modification.

Every major development step must leave a checkpoint stating:
- current project level
- completed work
- current change
- protected systems
- next step

This checkpoint exists so development can resume accurately after interruptions or context limits without repeating completed work or moving backward.


---

## BUILD CHECKPOINT — LEVEL 1 / STEP 1 — 2026-09-30

The first implementation step of the Raykels admin architecture restructure is complete.

A centralized `adminModules` registry now defines the admin modules:
- Dashboard
- Orders
- Products
- Add Product
- Analytics
- Settings

`setView()` now consumes this registry as the single navigation/view contract.

Orders, Analytics, and Settings are currently architectural registrations only. Their business logic and UI have not yet been implemented.

`admin.js` passed syntax validation with exit code 0.

No intentional changes were made to product CRUD, product image/video lifecycle, cart behavior, inventory security, or storefront rendering.

The next implementation step is to add the corresponding HTML navigation and view containers while preserving the existing product interface.


---

## BUILD CHECKPOINT — LEVEL 1 / STEP 2 — 2026-09-30

The admin HTML architecture now exposes six modules:
Dashboard, Orders, Products, Add Product, Analytics, and Settings.

All six navigation entries and corresponding view containers have been verified.

The existing product-management interface remains intact and `admin.js` passes syntax validation.

The project is now ready for the next architectural stage: Orders.

Order implementation must follow the established pending-request model. Customer submission creates a request; inventory is not consumed until administrator confirmation.


## Checkpoint — Admin Security Foundation Complete — 2026-09-30

Project: RAYKELS LUXURY COLLECTIONS

Current Build Level:
Admin architecture security foundation established and verified.

Current Architecture:
Server-enforced admin authentication using scrypt password hashing, random server-side sessions, HttpOnly SameSite cookies, login rate limiting, and same-origin protection for authenticated state-changing admin routes.

Completed:
- Admin login/logout/session flow.
- Protected admin APIs.
- Protected product mutations.
- Protected product media uploads.
- Protected admin order access.
- Same-origin protection.
- Security boundary testing.

Protected Systems:
- Product/media architecture.
- Public customer order submission.
- Admin authentication.
- Inventory authority.
- Existing video lifecycle.

Known Issues:
- Pending customer orders still use the previous stock-commit behavior and must be redesigned.
- Admin order confirmation workflow has not yet been implemented.
- Delivery fee confirmation workflow has not yet been implemented.

Last Verified:
2026-09-30 — authenticated request without Origin returned HTTP 403.

Next Step:
Redesign the customer order workflow so orders are submitted as pending requests and inventory is committed only when the administrator confirms the order.

# CANONICAL UPDATE — 2026-09-30 — SETTINGS, ANALYTICS & STOREFRONT WORKFLOW

## Raykels Project Direction

RAYKELS LUXURY COLLECTIONS is being developed as a reusable, editable e-commerce website/template platform rather than a one-off static website.

Frontend and backend contracts must remain aligned. Architecture should be designed so future Android/iPhone applications can reuse the same backend/API concepts.

## Customer Availability & Inventory Model

Customer-facing inventory counts are intentionally removed.

A product being listed in the public catalogue means the customer may request it.

Customers must NOT see:
- stock numbers
- "X left" messages
- out-of-stock badges
- inventory counters
- customer-side stock validation
- automatic rejection because requested quantity exceeds internal inventory

Customers may request any quantity.

The customer-facing product information should focus on:
- product name
- brand
- colour
- price
- description
- product media
- relevant customer-facing variants

Inventory remains an internal administrative data source only.

The administrator decides actual availability after receiving the customer's request and contacting the customer.

Current order workflow:
1. Customer submits requested quantity.
2. Order is created as pending.
3. Admin sees requested quantity.
4. Admin discusses availability with customer through WhatsApp/phone.
5. Admin enters the agreed confirmed quantity.
6. Admin confirms or rejects the order.
7. Stored inventory is NOT used to block the customer request.
8. Stored inventory is NOT automatically decremented during current confirmation.
9. Inventory functions remain available for future internal/manual inventory management.

## Product Media

Product videos are first-class product assets.

Products must support:
- images
- MP4/WebM/QuickTime video
- adding videos through admin
- removing videos
- displaying videos on product pages
- displaying videos in homepage/product carousels where appropriate

Do not redesign the media architecture as image-only.

## Cart Architecture

Customer cart uses localStorage with key:

raykels_cart

The existing RaykelsCart module remains the central cart engine.

Customer cart quantities are not limited by internal inventory.

The storefront should eventually provide a floating cart control visible across storefront pages.

Floating cart behavior:
- hidden when cart is empty
- becomes visible immediately after the first item is added
- remains available across storefront pages
- visually behaves similarly to the existing floating WhatsApp control
- must use the existing RaykelsCart event system rather than creating a second cart engine

## Checkout & Payment

Checkout is already functional and submits customer order requests to /api/orders.

Payment methods currently include:
- Card
- Bank Transfer
- Cash

Bank Transfer details are administrator-managed and server-side.

Bank details must NOT be stored in public frontend configuration.

Current architecture:
- data/payment-settings.json
- server/lib/payment-settings.js
- protected /api/admin/payment-settings
- public read-only /api/payment-settings

Admin can edit:
- bank name
- account name
- account number
- transfer instructions
- transfer enabled/disabled

Payment settings must remain protected and should not expose unnecessary administrative information.

Financial/private configuration files should not be committed to source control.

## Lean Admin Settings Architecture

The admin Settings area must remain deliberately limited.

Do NOT create a large settings/control panel or arbitrary website builder.

Relevant settings only:

### Homepage
- Hero on/off
- Hero rotation on/off
- Hero rotation speed
- Featured products on/off
- Collections section on/off
- Services/consultation section on/off

### Contact & Social
- WhatsApp number/link
- Instagram link
- Facebook link
- office/contact information

Only one Instagram profile/link should be used throughout the site.

### Payment
- Bank transfer details
- Bank transfer enabled/disabled
- Cash payment enabled/disabled
- Card payment enabled/disabled

### Basic Site
- Site/business name
- Homepage headline
- Homepage subheadline
- SEO title
- SEO description

Do not expose:
- arbitrary HTML editing
- arbitrary CSS editing
- section-builder controls
- dozens of unnecessary toggles
- internal implementation settings

## Settings Architecture

Settings should be stored server-side and consumed by the relevant frontend components.

The existing data/site.json is the canonical site configuration source.

The architecture must eventually make the homepage actually consume the relevant site configuration instead of merely storing unused values.

Settings API should distinguish:
- public-safe settings
- authenticated admin settings

Administrative settings must be protected by the existing admin authentication and same-origin protection.

## Analytics Architecture

Raykels requires a first-party, privacy-conscious analytics system inside the admin portal.

External Google Analytics and Meta Pixel remain optional integrations.

Raykels Analytics must work even when external analytics IDs are empty.

Current assets/tracking/tracking.js only loads optional:
- Meta Pixel
- Google Analytics
- Google Ads

It does NOT currently provide a Raykels-owned event store.

Therefore the next analytics architecture is:

PUBLIC STOREFRONT
    ↓
Raykels tracking/events
    ↓
POST /api/analytics/events
    ↓
first-party analytics data store
    ↓
ADMIN ANALYTICS

The analytics system should measure normal website activity rather than covert surveillance.

Required analytics:
- total visitors
- visits/sessions
- page views
- product page views
- products clicked
- search activity
- filter activity
- add-to-cart events
- checkout started
- orders submitted
- traffic/activity over time
- most-viewed products
- popular pages
- recent customer actions
- simple conversion funnel
- visitor journey such as:
  Homepage → Collection → Product → Add to Cart → Checkout → Order

Analytics should distinguish anonymous visitors/sessions from identifiable customer/order information.

Avoid unnecessary personal-data collection.

## Admin Analytics Architecture

Admin navigation currently includes:

Dashboard
Orders
Products
Add Product
Analytics
Settings

Analytics is currently only a placeholder and must be made functional.

The Analytics view should eventually provide concise useful information rather than an overloaded reporting system.

Initial sections:
- traffic summary
- visitor/session summary
- page views
- product views
- customer actions
- conversion funnel
- popular products
- popular pages
- activity over time

## Security

Admin security is mandatory.

Existing security architecture includes:
- server-side admin authentication
- scrypt password hashing
- random session tokens
- server-side sessions
- HttpOnly cookies
- SameSite protection
- Secure cookies in production
- authentication middleware
- login rate limiting
- same-origin protection for authenticated state-changing requests
- protected product administration
- protected order administration
- protected analytics administration
- protected settings administration

Never remove security controls merely to make testing easier.

Public password recovery is intentionally NOT part of the current architecture.

## Architecture-First Debugging Rule

When a bug becomes difficult or inconsistent, stop adding patches and inspect the architecture, contracts, lifecycle, and data flow.

Development sequence:
1. Inspect before editing.
2. Back up before structural changes.
3. Change one architectural layer at a time.
4. Preserve working product/media systems.
5. Keep frontend/backend contracts aligned.
6. Syntax-check meaningful changes.
7. Test the affected flow before continuing.
8. If behavior remains inconsistent, inspect architecture rather than stacking patches.
9. Never remove security controls to force a test to pass.
10. Update canonical project documentation when a requirement or architecture level changes.

## Development Environment Constraint

Raykels development is performed from a single Termux session.

Do not require opening another Termux session.

Use background processes/job control when a server must remain running.

Do not use /tmp for project-generated files because this Termux environment has a read-only /tmp.

## Current Build Checkpoint — 2026-09-30

Project:
RAYKELS LUXURY COLLECTIONS Website

Current Build Level:
Reusable e-commerce foundation with secured admin architecture, customer ordering workflow, payment settings, product/media management, and foundational storefront/cart/checkout systems.

Current Architecture:
Frontend + Node/Express backend + JSON data stores + secured admin APIs.

Completed:
- product catalogue API
- product administration
- product image/video lifecycle
- customer cart
- checkout
- customer order requests
- admin order workflow
- customer-side inventory restrictions removed
- admin confirmation workflow
- admin authentication/security foundation
- bank transfer settings
- admin view registry
- admin module structure
- settings/analytics architectural plan

Current Change:
Build lean Admin Settings and first-party Admin Analytics together.

Protected Systems:
- product/media architecture
- cart engine
- checkout/order creation
- admin authentication
- order confirmation security
- payment settings security

Known Issues / Next Implementation:
- Raykels first-party analytics event store/API not yet implemented
- Admin Analytics UI remains placeholder
- Homepage does not yet consume all site.json settings
- Lean Settings UI still needs completion
- Floating cart across storefront pages still needs implementation
- payment-settings.json should be protected from accidental source-control commits

Last Verified:
2026-09-30

Next Step:
Implement the backend contracts/data layer for first-party analytics and lean site settings, then connect the Admin Analytics and Settings interfaces.

