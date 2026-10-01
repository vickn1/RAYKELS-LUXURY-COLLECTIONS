# RAYKELS LUXURY COLLECTIONS
# MASTER SYSTEM BLUEPRINT

**Version:** 1.0
**Date:** 2026-10-01
**Status:** Canonical Architecture Blueprint

---

# 1. PURPOSE

RAYKELS LUXURY COLLECTIONS is being built as a reusable,
intelligent commerce website architecture expressed through
a distinctive luxury fashion brand.

The architecture must support:

- commerce
- content
- media
- storytelling
- administration
- developer operations
- intelligent supervision
- security
- accessibility
- future mobile clients

The architecture comes first.
The brand experience comes second.
The implementation must serve both.

---

# 2. CORE ARCHITECTURAL PRINCIPLE

The system must behave as one coherent platform rather than
a collection of unrelated pages and patches.

Major systems must have explicit ownership, contracts,
dependencies and validation boundaries.

Existing working systems must be preserved unless a documented
architectural change requires modification.

Never rebuild a working subsystem merely because another subsystem
is being redesigned.

---

# 3. SYSTEM TOPOLOGY

RAYKELS is composed of five major layers:

1. Core Platform
2. Commerce / Business Modules
3. Admin Interface
4. Developer / Wizard Interface
5. Customer Experience

Conceptually:

    CUSTOMER
       |
       v
    STOREFRONT
       |
       v
    PLATFORM APIs
       |
       +----------------------+
       |                      |
       v                      v
    BUSINESS              EXPERIENCE
    MODULES               MODULES
       |                      |
       +----------+-----------+
                  |
                  v
             CORE PLATFORM
                  |
          +-------+-------+
          |               |
          v               v
       ADMIN           DEVELOPER
                       |
                       v
                     WIZARD

---

# 4. ADMIN / DEVELOPER ACCESS MODEL

The public control center presents two distinct authentication
paths.

    RAYKELS CONTROL CENTER

    ADMIN LOGIN
      Username
      Password
         |
         v
      ADMIN

    DEVELOPER LOGIN
      Username
      Password
         |
         v
      DEVELOPER
         |
         v
       WIZARD

Admin and Developer credentials are separate.

Admin authentication must never automatically grant Developer
privileges.

Developer authentication must never be implemented through a
hidden URL alone.

Every Developer endpoint must enforce Developer authentication
server-side.

Wizard exists inside the Developer interface.

---

# 5. ADMIN RESPONSIBILITY

Admin controls business operations.

Admin modules include:

- Dashboard
- Orders
- Products
- Analytics
- Settings

Future business modules may include:

- Sales
- Marketing
- Experience controls
- Customer management
- Delivery
- Consultation

Admin must not gain access to the Developer/Wizard filesystem,
developer operations or developer-only capabilities merely by
being authenticated as Admin.

---

# 6. DEVELOPER RESPONSIBILITY

Developer controls system operations.

Developer capabilities include:

- Wizard
- Architecture inspection
- System health
- Contract inspection
- Diagnostics
- Dependency inspection
- System registry
- Canonical memory
- Developer actions
- Front Page Builder
- controlled system configuration

Developer operations must use explicit permissions.

---

# 7. WIZARD

Wizard is the intelligent supervisory layer of the Raykels platform.

Wizard does not replace module ownership.

Wizard observes, understands and coordinates the system through
registered contracts and capabilities.

Wizard must not blindly modify arbitrary files.

Core cycle:

    OBSERVE
       |
    UNDERSTAND
       |
      CHECK
       |
     REASON
       |
    AUTHORIZE
       |
      ACT
       |
    VALIDATE
       |
     RECORD

Wizard may:

- inspect
- diagnose
- search
- recommend
- validate
- perform approved safe actions
- perform developer actions
- request explicit authorization for sensitive actions

---

# 8. WIZARD PERMISSION LEVELS

The initial permission model is:

Level 0 — Observe

Level 1 — Validate

Level 2 — Recommend

Level 3 — Safe Action

Level 4 — Developer Action

Level 5 — Sensitive Action requiring explicit authorization

The permission model must remain extensible.

Sensitive operations must never be silently escalated.

---

# 9. SYSTEM REGISTRY

Wizard operates through a System Registry.

The Registry is the canonical map of:

- modules
- settings
- contracts
- permissions
- capabilities
- ownership
- dependencies
- editability
- validation rules

Canonical identity must use stable IDs rather than fragile
physical file paths.

Examples:

    front_page.hero.height
    front_page.hero.rotation_seconds
    settings.social.instagram
    settings.accessibility.reduced_motion
    products.media.video
    experience.editorial.enabled

Wizard searches the Registry rather than blindly searching
source files.

---

# 10. GLOBAL SYSTEM SEARCH

Developer/Wizard provides global system search.

Examples:

    "hero height"
        -> Front Page
        -> Hero
        -> Layout
        -> Section Height

    "Instagram"
        -> Settings
        -> Connections
        -> Meta
        -> Instagram

    "rotation seconds"
        -> Front Page
        -> Hero
        -> Media
        -> Rotation Interval

    "reduced motion"
        -> Settings
        -> Accessibility
        -> Motion

    "product video"
        -> Products
        -> Media
        -> Videos

Search must resolve to registered system identities.

---

# 11. MODULE OWNERSHIP

Every major capability has one authoritative owner.

Products owns:

- products
- product fields
- variants
- stock
- product images
- product videos
- product media lifecycle

Orders owns:

- order requests
- order state
- confirmation
- cancellation

Inventory owns:

- authoritative stock changes
- inventory validation

Settings owns:

- business settings
- contact information
- social links
- payment configuration where applicable

Front Page owns:

- homepage structure
- section ordering
- presentation configuration

Experience owns:

- editorial assets
- decorative assets
- story elements
- experience-specific motion

Analytics owns:

- anonymous activity events
- reporting
- conversion information

Wizard owns:

- supervision
- diagnostics
- registry
- architecture awareness
- controlled system actions

Wizard does not duplicate the data owned by these modules.

---

# 12. PRODUCT DATA SOURCE

The canonical product store is:

    data/products.json

The canonical product API is:

    GET /api/products

The frontend catalogue loader uses:

    /api/products

The obsolete:

    /products/catalog.json

must not become the active source again.

---

# 13. PRODUCT MEDIA MODEL

The existing media architecture is canonical.

Frontend normalization is provided by:

    products/catalog.js

Important function:

    getProductMedia(product)

It combines:

    product.images
    +
    product.videos

into one unified media model.

Each media item may contain:

- id
- type
- url
- alt/title
- poster where applicable

This architecture must be preserved.

---

# 14. PRODUCT MEDIA OWNERSHIP

Product media belongs to Products.

Product uploads use:

    /api/uploads/products/:productId

Supported formats currently include:

- JPEG
- PNG
- WebP
- MP4
- WebM
- QuickTime video

Current maximum product video size:

    100 MB

Do not weaken these restrictions merely for convenience.

Product media storage:

    uploads/products/<product-id>/

Deleting a product must remove its product media directory.

Updating a product must remove physical media no longer referenced
by the product.

Orphan cleanup is intentional and must remain.

---

# 15. EXPERIENCE MEDIA

Editorial and decorative media are separate from product media.

Proposed ownership:

    Experience module

Proposed structure:

    assets/experience/
        editorial/
        decorative/
        motion/

Experience media must not be placed inside product folders.

Experience systems must not modify:

- product catalogue data
- product upload logic
- product video lifecycle
- product API
- product inventory
- order logic

---

# 16. EXPERIENCE / GEN-Z STORYTELLING

The visual direction is:

GEN-Z BARBIE
+
FUNKY STORYBOOK
+
LUXURY FASHION
+
HEAD-FIRST CHARACTER STORYTELLING

Experience elements may include:

- editorial characters
- decorative artwork
- border artwork
- floating edge elements
- story illustrations
- playful micro-interactions

Placement must be semantic rather than arbitrary pixel positioning.

Potential placement identities:

- border-left
- border-right
- border-top
- border-bottom
- corner-left
- corner-right
- section-edge
- floating-edge

Potential motion presets:

- jiggle
- float
- sway
- bounce-in
- scroll-reveal

Motion must respect:

    prefers-reduced-motion

Product imagery remains visually dominant.

---

# 17. FRONT PAGE BUILDER

Front Page Builder belongs inside Wizard.

It manages the homepage as a coherent system.

Areas include:

- Structure
- Sections
- Hero
- Collections
- Services
- Editorial
- Images
- Videos
- Text
- Typography
- Spacing
- Heights
- Responsive behaviour
- Motion
- Preview
- Validation

Semantic homepage components include:

- Hero
- Luxury Hair
- Luxury Bags
- Luxury Shoes
- Children's Collection
- Wig Care
- Home Delivery
- Consultation
- Editorial Story
- Social / Contact
- Footer

Changing one component must trigger awareness of related
dependencies.

For example, changing Hero height may require checking:

- hero container
- text alignment
- CTA position
- decorative artwork
- following section spacing
- mobile layout
- responsive behaviour

---

# 18. CANONICAL HOMEPAGE WORLD

Homepage sequence:

1. Luxury Hair
2. Luxury Bags
3. Luxury Shoes
4. Children's Wear
5. Wig Care
6. Home Delivery
7. Consultation

Primary visual anchors:

- Luxury Hair
- Luxury Bags
- Luxury Shoes

Children's Wear is secondary.

Services follow the product collections.

Cards must share:

- consistent dimensions
- visual rhythm
- responsive sizing
- spacing
- interaction behaviour
- Gen-Z / storybook aesthetic

Products and services remain semantically distinct.

---

# 19. HOMEPAGE STORY

The homepage should feel like one connected story:

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

The homepage must not feel like unrelated blocks assembled together.

---

# 20. REUSABLE TEMPLATE ARCHITECTURE

The platform must be reusable for other businesses.

Business-specific configuration should eventually contain:

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

Reusable systems include:

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
- cart
- checkout
- CTA components
- responsive layout

Principle:

    ONE ARCHITECTURE
           +
    DIFFERENT BUSINESS CONFIGURATION

---

# 21. API-FIRST ARCHITECTURE

The website is the first client of the platform, not the entire
platform.

Business data must be API-driven.

Catalogue data must not be hard-coded into pages.

Product media must have stable URLs.

API contracts must remain documented.

Authentication must remain separable from presentation.

Business logic must not depend entirely on browser-specific code.

Future clients:

- Android
- iPhone
- Web

must be able to consume the same platform foundations.

---

# 22. API CONTRACT RULE

Every API contract should define:

- request structure
- response structure
- validation
- error behaviour
- compatibility expectations

Before changing an API:

1. inspect backend
2. identify all consumers
3. modify backend/frontend coherently
4. syntax-check
5. test API
6. test browser behaviour
7. test mobile behaviour

Never change a backend response casually.

---

# 23. ADMIN SECURITY

The existing Admin security foundation is protected.

Current principles include:

- scrypt password hashing
- random password salts
- timing-safe password comparison
- cryptographically random sessions
- hashed session tokens at rest
- session expiration
- login rate limiting
- server-side authentication
- SameSite session cookies
- HttpOnly session cookies
- protected state-changing endpoints

Do not weaken this architecture.

---

# 24. DEVELOPER SECURITY

Developer authentication must be independently enforced.

Developer credentials must be separate from Admin credentials.

Developer sessions must have their own authorization boundary.

Developer endpoints must not rely on:

- hidden URLs
- frontend-only checks
- JavaScript flags
- HTML visibility
- client-supplied role values

Secrets must never be stored in frontend code.

Developer access must not automatically expose Admin credentials.

---

# 25. FRONTEND SECURITY

Frontend code must treat catalogue data as untrusted.

Preserve safe rendering mechanisms such as:

    escapeHtml()

User-controlled values must not become executable HTML or code.

Where possible:

- avoid innerHTML for untrusted content
- escape product names
- escape labels
- escape media IDs
- safely handle URLs
- never execute catalogue data as code

---

# 26. CORE SECURITY PRINCIPLES

Always:

- validate incoming data
- validate uploads
- enforce file-size limits
- prevent path traversal
- restrict filesystem deletion
- avoid arbitrary filesystem access
- keep filesystem operations server-side
- keep API boundaries explicit
- protect secrets
- minimize permissions
- avoid unsafe CORS
- avoid unnecessary exposure of internal files
- fail safely on malformed data

Security must never be traded for visual functionality.

---

# 27. ACCESSIBILITY

Accessibility is architectural.

Requirements include:

- semantic HTML
- keyboard accessibility
- meaningful alt text
- accessible carousel controls
- visible focus states
- adequate contrast
- reduced-motion support
- correct buttons/links
- meaningful headings
- mobile usability

Animation must never make the site unusable.

---

# 28. PERFORMANCE

The experience should remain lightweight.

Use:

- lazy loading
- responsive media
- video posters
- controlled video playback
- efficient DOM updates
- reusable components
- minimal unnecessary JavaScript
- minimal dependencies

Do not automatically load every large product video simultaneously.

---

# 29. ANIMATION

The system may use:

- playful button movement
- subtle dancing
- hover reactions
- character reactions
- scroll storytelling
- micro-interactions
- carousel movement

Animation must remain:

- intentional
- responsive
- lightweight
- accessible
- non-annoying

Always respect:

    prefers-reduced-motion

---

# 30. COMMERCE FOUNDATION

The platform is designed to grow toward complete commerce.

Foundations include:

- catalogue
- categories
- products
- variants
- inventory
- cart
- checkout
- customer order flow
- delivery
- consultation
- product enquiry
- order management
- administration

Complex features should not be implemented prematurely.

---

# 31. ORDER LIFECYCLE

Customer checkout creates a pending order request.

Submission does not immediately consume inventory.

Admin may:

- review request
- contact customer
- confirm availability
- discuss quantities
- arrange delivery
- determine delivery fee
- confirm
- cancel

Inventory is committed only during confirmed order processing.

Server remains authoritative for:

- pricing
- product existence
- variants
- inventory
- order state
- confirmation

---

# 32. ANALYTICS

Analytics are first-party and privacy-conscious.

Potential events include:

- visitors
- sessions
- page views
- product views
- product interactions
- search/filter activity
- add-to-cart
- checkout initiation
- submitted orders
- conversion funnel

Anonymous visitor activity must remain distinct from identifiable
customer/order information.

---

# 33. SETTINGS

Settings remain business-focused.

Potential areas:

- Homepage
- Contact & Social
- Payment
- Basic Site
- Accessibility

Ordinary Admin should not become an arbitrary HTML/CSS editor.

Wizard may locate and manage registered settings when authorized.

---

# 34. WIZARD + SETTINGS RELATIONSHIP

Wizard does not duplicate Settings.

Instead:

    Wizard
       |
       v
    Registry
       |
       v
    Setting ID
       |
       v
    Owning Module
       |
       v
    Validated Change
       |
       v
    Persistence
       |
       v
    Validation
       |
       v
    Audit

Example:

    "change Instagram"

Wizard resolves:

    settings.social.instagram

then delegates the actual ownership to the Settings/Integration
module.

---

# 35. SYSTEM HEALTH

Wizard should eventually monitor:

- API health
- data integrity
- filesystem state
- media consistency
- contract compatibility
- module availability
- authentication health
- dependency status
- frontend/backend mismatch
- configuration validity
- orphaned resources
- failed operations

Health checks should be observational before becoming
automatically corrective.

---

# 36. DIAGNOSTICS

Diagnostics should produce:

- detected condition
- affected module
- severity
- evidence
- probable cause where supported
- recommended action
- available safe action
- validation result

Wizard must distinguish:

FACT
from
INFERENCE
from
RECOMMENDATION

It must not present guesses as confirmed system facts.

---

# 37. AUDITABILITY

Developer/Wizard actions should eventually record:

- actor
- action
- target
- reason
- before state where appropriate
- after state where appropriate
- timestamp
- validation result
- authorization level

Sensitive actions require explicit authorization.

---

# 38. CHANGE MANAGEMENT

Major changes follow:

    INSPECT
      ↓
    PLAN
      ↓
    CHECKPOINT
      ↓
    IMPLEMENT
      ↓
    SYNTAX CHECK
      ↓
    API TEST
      ↓
    BROWSER TEST
      ↓
    MOBILE TEST
      ↓
    VALIDATE
      ↓
    CHECKPOINT

Never randomly rewrite working files.

---

# 39. MIGRATION STRATEGY

The current working application must not be destroyed in order
to reach the target architecture.

Migration occurs incrementally.

Existing systems remain operational while their ownership and
contracts are progressively formalized.

Migration priorities:

1. document architecture
2. establish registry
3. establish Developer authentication
4. establish Developer interface
5. establish Wizard foundation
6. establish module contracts
7. establish Front Page Builder
8. establish Experience module
9. migrate presentation systems
10. remove obsolete architecture only after dependency validation

---

# 40. CURRENT PROTECTED SYSTEMS

The following must be treated as protected during redesign:

- product CRUD
- product images
- product videos
- unified product media model
- product upload validation
- orphaned media cleanup
- product deletion
- inventory authority
- cart foundations
- checkout foundations
- order confirmation
- Admin authentication
- API security
- frontend/backend contracts

---

# 41. DEVELOPMENT ENVIRONMENT

Project:

    ~/RaykelsLuxury

Server:

    node server.js

Expected server:

    RAYKELS ADMIN SERVER RUNNING

Local address:

    http://localhost:3000

Development is performed on Android using Termux.

Only one Termux session is available.

Commands must therefore use:

- background processes
- shell job control
- sequential execution

Never require a second Termux session.

---

# 42. CURRENT ARCHITECTURAL STATE

Known working foundations:

- data/products.json
- GET /api/products
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id
- product image uploads
- product video uploads
- media deletion
- orphaned media cleanup
- products/catalog.js
- getProductMedia()
- existing video rendering
- existing video removal
- Admin authentication foundation
- Admin session handling
- Admin module registry

The homepage carousel remains subject to visual/architectural
refinement and must remain near the beginning of the intended
"Luxury, beautifully lived" experience.

---

# 43. TARGET SYSTEM STRUCTURE

The target architecture may eventually evolve toward:

    core/
      registry/
      security/
      events/
      validation/

    wizard/
      interface/
      search/
      front-page/
      diagnostics/
      health/
      contracts/
      memory/
      actions/

    admin/
      interface/
      modules/

    modules/
      products/
      orders/
      inventory/
      analytics/
      marketing/
      experience/
      front-page/
      settings/
      notifications/

    integrations/
      meta/
      payments/
      messaging/
      storage/

    frontend/
      pages/
      components/
      styles/
      scripts/

This structure is a target architecture.

Existing files must not be moved blindly.

Migration requires dependency inspection and checkpoints.

---

# 44. CANONICAL IDENTITY

Project:

    RAYKELS LUXURY COLLECTIONS

Tagline:

    Luxury, beautifully lived.

Primary categories:

    Luxury Hair
    Luxury Bags
    Luxury Shoes

Secondary collection:

    Children's Wear

Services:

    Wig Care & Revamping
    Home Delivery
    Product Consultation

The brand experience should remain distinctive and should not
collapse into a generic corporate luxury template.

---

# 45. FINAL ARCHITECTURAL RULE

When future development becomes difficult:

DO NOT immediately add another patch.

First inspect:

- architecture
- ownership
- lifecycle
- registry
- contract
- dependency
- security boundary

Then determine whether the problem belongs to:

- Core
- Product
- Commerce
- Experience
- Admin
- Developer
- Wizard
- Front Page
- Integration

The goal is not merely to make features work.

The goal is to make the entire system understandable,
maintainable, secure, extensible and reusable.

---

# 46. STATUS

This document defines the target Raykels system architecture.

It complements rather than replaces:

- WIZARD.md
- docs/CANONICAL_PROJECT_MEMORY.md
- docs/ARCHITECTURE_DECISIONS.md
- docs/PROJECT_RULES.md

When these documents appear to conflict, stop and resolve the
conflict explicitly before changing implementation.

---

**END OF MASTER SYSTEM BLUEPRINT**
