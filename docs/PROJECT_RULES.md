# RAYKELS LUXURY COLLECTIONS — QUICK MEMORY

## PROJECT
Project 2 — separate from Victor LifeOS.

## CORE GOAL
Build a reusable, reproducible, editable e-commerce website template/platform.

## PRODUCT ORDER
1. Luxury Hair
2. Luxury Bags
3. Luxury Shoes

## SERVICES
1. Wig Care
2. Home Delivery
3. Consultation

## AFTER SERVICES
Children's Wear.

## HERO
WELCOME TO RAYKELS COLLECTION
Luxury, beautifully lived.

## DESIGN
Gen-Z Barbie + funky storybook + premium Nigerian luxury.

Use Head First HTML & CSS-style character storytelling.

Include a cartoon Gen-Z / Barbie-like fashion character as a recurring storytelling element.

Buttons/interactions should feel animated, playful and alive.

## HOMEPAGE
Hero first.

Catalogue-driven mixed-media product carousel must appear early near the hero/opening experience.

Do not bury the carousel.

## PRODUCT MEDIA
Images AND videos are first-class assets.

Videos must work in:
- Admin
- Homepage carousel
- Product cards
- Product pages

## DATA
Canonical product store:
data/products.json

Canonical API:
GET /api/products

Do not restore /products/catalog.json.

## SECURITY
Never weaken security to add visual or media features.

Maintain:
- validation
- upload MIME checks
- size limits
- safe filenames
- path traversal protection
- safe deletion
- escaped dynamic content
- secure filesystem boundaries
- predictable API contracts

## TEMPLATE
Separate:
ARCHITECTURE
from
BUSINESS CONFIGURATION.

The same architecture should eventually be reusable for another business.

## FUTURE
Keep API-driven architecture suitable for future Android/iPhone clients.

## DEVELOPMENT
Project:
~/RaykelsLuxury

User works from one Termux session.

Do not instruct user to open another Termux session.

## WORKING BACKEND
Product CRUD works.

Product image/video upload works.

Existing video removal works.

Physical orphaned media cleanup works.

Product deletion removes its media directory.

## DEVELOPMENT RULE
Inspect → change coherently → syntax check → API test → browser test → mobile test.

Never randomly rewrite working systems.


## Customer Inventory Visibility — 2026-09-30

Customer-facing product interfaces must never display internal inventory quantities or stock counts.

Customers may see:
- Product name
- Brand
- Colour
- Price
- Description
- Product media
- Customer-facing variant information

Customers must not see:
- Numeric stock quantities
- Internal inventory tracking state
- Internal stock keys or inventory data

Product catalogue visibility is controlled separately from inventory quantity. Administrators can remove/unpublish unavailable products from the customer catalogue while inventory remains an internal server-side system.

Inventory quantities remain available to the administrator and remain authoritative for order confirmation.
