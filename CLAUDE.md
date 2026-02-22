# CLAUDE.md — 315 Fabrics Project Brief

**This file is auto-loaded by Claude Code at the start of every session.**
Claude reads AND writes this file. Other agents (Gemini, Codex) read it but do NOT edit it.

---

## Multi-Agent System Overview

This project uses 3 AI coding agents coordinated through shared files:

| File | Owner | Others |
|---|---|---|
| `CLAUDE.md` | Claude (read + write) | Gemini, Codex (read only) |
| `GEMINI.md` | Gemini (read + write) | Claude, Codex (read only) |
| `CODEX.md` | Codex (read + write) | Claude, Gemini (read only) |
| `task.md` | All agents can mark tasks DONE | Claude assigns new tasks |

**Claude's role:** Supervisor + architect. Assigns tasks in `task.md`, reviews agent logs, handles complex cross-cutting decisions. Does NOT duplicate work already assigned to Gemini or Codex.

**At the start of each Claude session:**
1. Read `task.md` — see current state of all tasks
2. Read `GEMINI.md` and `CODEX.md` — see what other agents completed or got blocked on
3. Assign next tasks in `task.md` if the queue is empty or agents are idle
4. Update the Progress Log at the bottom of this file

---

## What We're Building

A full custom e-commerce website for **315 Fabrics** — a fabric and asoebi materials store based in Epe, Lagos. Instagram: **@3_15fabrics**. Founded and run by **Ayodei Modinat Ayeola-Musari** — 8+ years in the fabric business. She sources and curates fabrics herself. Strong focus on premium Nigerian celebratory fabrics — asoebi sets, bridal fabrics, everyday wears. Price range: ₦5,000 – ₦350,000+. Currently operates entirely via Instagram DMs and WhatsApp — no website yet.

**Fabrics carried:** Ankara, French Lace, Swiss Voile, Senator material, Aso-Oke, Cotton, and more. Stock sourced from China, India, and local wholesale markets.

**Visual aesthetic:** Warm, rich, celebratory — deep earth tones, gold accents, vibrant fabric energy. NOT the cold minimal luxury of iby_closet.

**This repo is a fork of iby_closet** (a Lagos menswear brand). The tech stack is already fully built and working. We're adapting it for fabrics.

---

## How She Sells (critical — different from iby_closet clothing)

- **Yard-based products:** Customer picks quantity (e.g. 6 yards), pays price × yards. Minimum order enforced.
- **Bundle products:** Fixed set only (e.g. "5 yards French Lace for ₦85,000") — can't be split/reduced. Quantity locked at 1 at checkout.
- Each fabric + colorway combination is its own product listing
- Product variants = colorways only (`color` = colorway name, `size = null` for all fabric variants)

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend / DB | Supabase (Auth, Database, Storage) |
| Payments | Paystack |
| Email | Resend |
| WhatsApp | Fonnte |
| Images | Cloudinary |
| Analytics | PostHog |
| Caching | Upstash Redis |
| Hosting | Vercel |

---

## Sales Channels — Unified Order System

Every order regardless of source uses format `315-YYYY-XXXXXX`:

1. **Website checkout** (Paystack)
2. **Instagram DMs** (admin manual entry)
3. **WhatsApp** (admin manual entry)
4. **Walk-in at physical space** (Quick Sale screen in admin)

---

## Contact Capture

All interactions → `contacts` table (email + WhatsApp). Powers:
- Email campaigns via **Resend**
- WhatsApp broadcasts via **Fonnte**

Sources: `waitlist` / `newsletter` / `abandoned_cart` / `checkout` / `footer` / `walk_in`

---

## Key Requirements

- Fast for **Nigerian mobile networks**
- Delivery fee calculation (GIG Logistics)
- **Public order tracking** — order number only, no login
- **Mobile-optimized Admin Panel** for shop owner (non-technical)
- Site aesthetic: **warm / rich / celebratory** (earth tones, gold accents)
- WhatsApp business number: `2349066609177` (international format of 09066609177)

---

## What Changed from iby_closet Fork

| iby_closet | 315 Fabrics |
|---|---|
| Clothing (shirts, jackets) | Fabrics (Ankara, Lace, Senator, Aso-Oke, Voile) |
| Size variants (XS/S/M/L/XL) | Colour/pattern variants only (size = null) |
| Fixed unit quantity | Yards-based OR fixed bundle |
| Order prefix `IBY-` | Order prefix `315-` |
| Cart key `iby-closet-cart` | Cart key `315fabrics-cart` |
| WhatsApp: old number | WhatsApp: `2349066609177` |
| Brand "iby_closet" | Brand "315 Fabrics" |
| Instagram @iby_closet | Instagram @3_15fabrics |
| Location: general Lagos | Location: Epe, Lagos |
| Editorial/lookbook aesthetic | Warm celebratory fabric aesthetic |
| Size Guide (measurements) | Yardage Guide (how many yards per outfit) |

---

## Database Schema

Migration files:
- `supabase/migrations/20240221000000_initial_schema.sql` — original schema (inherited)
- `supabase/migrations/20260222000001_315fabrics_schema.sql` — 315 Fabrics additions

### Schema Additions (Batch 1 — G1)

```sql
ALTER TABLE products ADD COLUMN unit_type TEXT DEFAULT 'yard'
  CHECK (unit_type IN ('yard', 'bundle'));
ALTER TABLE products ADD COLUMN minimum_quantity NUMERIC NOT NULL DEFAULT 1;
ALTER TABLE products ADD COLUMN fabric_type TEXT;
ALTER TABLE order_items ADD COLUMN yards_ordered NUMERIC;
```

### All Tables

- **contacts** — email + WhatsApp subscribers (source: waitlist/newsletter/checkout/footer/walk_in)
- **categories** — fabric categories: Ankara & African Print, French Lace & Swiss Voile, Aso-Oke & Traditional, Senator & Corporate, Wedding & Asoebi, New Arrivals
- **collections** — optional themed collections (future use)
- **products** — fabric listings. `unit_type` (yard/bundle), `minimum_quantity` (min yards to order or bundle size), `fabric_type` (Ankara/Lace/etc). `fit_notes` column repurposed as general notes.
- **product_images** — images per product
- **product_variants** — colorways only. `color` = colorway name (e.g. "Wine Red"), `size = null` always. `stock_quantity` = yards in stock.
- **customers** / **addresses**
- **orders** — `order_number` format: `315-YYYY-XXXXXX`. `source`: website/instagram/whatsapp/walk_in/other
- **order_items** — includes `yards_ordered NUMERIC` (new field). `quantity` = yards ordered (or 1 for bundles).
- **delivery_tracking** — order status timeline
- **waitlist** / **abandoned_carts**

---

## File Structure

```
src/
  app/
    layout.tsx                  ← Root layout (site-wide metadata: "315 Fabrics")
    globals.css
    (site)/
      layout.tsx                ← Site layout (Header + Footer + BackToTop + PostHog)
      page.tsx                  ← Homepage
      loading.tsx               ← "315 FABRICS" loading state
      shop/
        page.tsx                ← Shop All
        [category-slug]/page.tsx
        _components/ShopFilter.tsx
      collections/page.tsx      ← Collections index
      products/[slug]/
        page.tsx                ← Product detail
        ProductPurchasePanel.tsx  ← Fabric UX: colour selector + yard input / bundle lock
        ProductImageGallery.tsx
      cart/page.tsx
      checkout/
        page.tsx
        success/page.tsx
      track/page.tsx
      yardage-guide/page.tsx    ← How many yards per outfit style
      brand/page.tsx            ← About / Our Story
      contact/page.tsx
      faq/page.tsx
      lookbook/page.tsx         ← "Coming Soon" state (no photos yet)
    admin/
      _components/ProductForm.tsx  ← Includes fabric fields (unit_type, fabric_type, minimum_quantity)
      ...all other admin pages unchanged
    api/
      orders/route.ts           ← prefix 315-, inserts yards_ordered into order_items
      ...all other API routes unchanged
  components/
    Header.tsx                  ← "315 Fabrics" brand, Yardage Guide nav link
    Footer.tsx                  ← @3_15fabrics, Epe Lagos, WhatsApp 2349066609177
    ProductCard.tsx / BackToTop.tsx / FadeIn.tsx / etc. — unchanged
  lib/
    cart-store.ts               ← CartItem: +unit_type, +minimum_quantity; key '315fabrics-cart'
    email.ts                    ← "315 Fabrics" branding, WhatsApp 2349066609177
    types.ts                    ← Product (+unit_type, +minimum_quantity, +fabric_type, +gender); OrderItem (+yards_ordered)
    supabase.ts / redis.ts / cache.ts / invalidate-cache.ts  ← unchanged
supabase/
  migrations/
    20240221000000_initial_schema.sql  ← original
    20260222000001_315fabrics_schema.sql  ← unit_type, minimum_quantity, fabric_type, yards_ordered (already run)
    20260222000002_gender_column.sql      ← gender column on products (G1 — run in Supabase after creation)
scripts/
  seed_fabric_categories.js     ← seeds 6 fabric categories (G3)
  seed_from_instagram.js        ← imports 100 IG posts as draft products with Cloudinary images (G4)
```

---

## Unknowns (must confirm before building these features)

| Unknown | Current status | Impact |
|---|---|---|
| Owner's name | **Ayodei Modinat Ayeola-Musari** (goes by Ayodeji) — 8+ years in business | About/Brand page |
| New Supabase project | Must create — .env.local still has iby_closet credentials | DB won't work |
| New Paystack account | Must create for sister's store | Payments won't work |
| Domain / Vercel URL | Unknown — update `NEXT_PUBLIC_APP_URL` when known | Email tracking links |
| Exact bundle sizes per fabric | Unknown — admin enters via product form | `minimum_quantity` field |
| Supplier tracking per fabric | Unknown — skip for now | Future feature |
| Payment: full upfront vs 50% deposit | Unknown — assume full upfront | Checkout flow |
| Clean product photos | Unknown — Lookbook deferred | Visual content |
| Admin password | Currently `admin` (insecure!) | Must change before deployment |

---

## Recurring Patterns / Bugs to Watch

1. **`export const dynamic = 'force-dynamic'` must ALWAYS be AFTER all imports** — Gemini repeatedly inserts this between imports, causing ESLint build failures. Always check after Gemini tasks.
2. **React hydration with Zustand** — Always wrap Zustand reads in `useEffect` mounted checks on SSR pages.
3. **Yards vs quantity** — In the cart, `quantity` field = yards ordered for yard-type products, or 1 for bundles. Line total = `unit_price × quantity`. The subtotal calculation is unchanged.
4. **Cloudinary images** — `next.config.js` `remotePatterns` already configured.

---

## Progress Log

- **[2026-02-22]** Claude: Forked from iby_closet. Audited full codebase. Created all coordination files (CLAUDE.md, GEMINI.md, CODEX.md, task.md) for 315 Fabrics. Assigned Batch 1: G1-G3 (Gemini: schema migration + types, backend branding + cart-store, category seeding + sitemap), C1-C3 (Codex: ProductPurchasePanel rewrite for yard/bundle UX, global branding text, admin ProductForm fabric fields).
- **[2026-02-22]** Claude: Executed all C2 branding work directly (Header, Footer, loading.tsx, (site)/layout.tsx, root layout.tsx, page.tsx, brand/page.tsx, lookbook/page.tsx). Deleted public/images/instagram/ (Ibrahim's 40 photos). Build passes 0 errors. Confirmed Supabase migration 001 was already run by user.
- **[2026-02-22]** Claude: User provided Instagram export (IGPOSTS_USERS_3_15fabrics_100.xlsx — 100 posts, 25 columns, non-video posts have image CDN URLs). User wants: (1) Instagram data → draft products pipeline, (2) gender classification (men/women/unisex) on products, (3) stock tracking confirmed working via existing product_variants.sku + stock_quantity. Assigned Batch 2: amended G1 to add gender migration (20260222000002_gender_column.sql) + update types.ts with all new fields including gender; G4 to Gemini (Instagram import pipeline script); C4 to Codex (shop gender filter + admin gender dropdown); C5 to Codex (yardage guide page). Marked C2 done (Claude did it).
- **[2026-02-22]** Claude: Audited Batch 2 output (G1-G4 done by Gemini, C1-C5 done by Codex). Build passes 37 pages 0 errors. Fixed 9 issues: (1-4) 8 remaining iby_closet refs missed by agents — cart localStorage keys, Paystack reference prefix, checkout success fallback, collections metadata, contact page WhatsApp/Instagram/TikTok→Location/email; (5) products/[slug]/page.tsx metadata still had "iby_closet" (Codex missed lines 76-77); (6) ProductForm "Sizes / Variants" header not renamed to "Colorway / Pattern"; (7) TypeScript error — gender state typed as `string` but Product type requires `'men' | 'women' | 'unisex'` literal union — fixed to `useState<'men' | 'women' | 'unisex'>`; (8) onChange cast to `e.target.value as 'men' | 'women' | 'unisex'`. Asked agents to write detailed rationale in progress logs going forward.
- **[2026-02-22]** Claude: Assigned Batch 3: G5 to Gemini (admin session cookie rename `iby_admin_session` → `315fabrics_admin_session` across 7 files + middleware + Cloudinary folder rename + admin sidebar/login UI branding + abandoned cart URL fix); G6 to Gemini (FAQ page full rewrite for fabric store Q&As + track page order format example fix); C6 to Codex (cart page yards/bundle unit display labels); C7 to Codex (delete size-guide page + track page order format example). All Batch 3 specs written to GEMINI.md and CODEX.md.
- **[2026-02-22]** Claude: Audited Batch 3 (G5, G6, C6, C7 all done). Build 36 pages 0 errors (size-guide gone). Fixed: orders/route.ts comment "IBY-" → "315-"; ProductForm gender state typed as `string` again — reset to `useState<'men' | 'women' | 'unisex'>`. Key findings: collections/page.tsx still iby_closet editorial style with broken fallback images; homepage "Shop by Category" queries collections not fabric categories; email.ts still says "Size: N/A" for fabric items. Assigned Batch 4 — 8 tasks to Gemini (G7-G14): G7 email/WhatsApp yards display; G8 collections page → fabric categories grid; G9 homepage categories section → categories table; G10 test products seed script; G11 shop sort param; G12 admin manual order yards field; G13 admin quick-sale yards; G14 admin products list fabric_type columns. 2 tasks to Codex (C8-C9): C8 checkout success fabric copy; C9 sort UI pills.
