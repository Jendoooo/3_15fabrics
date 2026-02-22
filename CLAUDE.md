# CLAUDE.md — iby_closet Project Brief

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

A full custom e-commerce website for **iby_closet** — a Lagos-based men's fashion brand by Ibrahim Hamed. Ibrahim designs everything himself. Strong editorial identity with themed collections (e.g. Rhythm & Thread, Back in the 90s). Targets style-conscious Nigerian men. Price points: ₦30,000–₦60,000+. Currently sells via Instagram DMs and phone. Physical walk-in space also being set up.

Inspiration: garmisland.com — but iby_closet should be more **editorial and brand-world-driven**, not just a product catalogue. Campaign shoots, lookbook pages, collection narratives — every collection has a story.

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

Every order regardless of source uses format `IBY-YYYYXXXX`:

1. **Website checkout** (Paystack)
2. **Instagram DMs** (Ibrahim manually logs in admin)
3. **WhatsApp** (Ibrahim manually logs in admin)
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
- Delivery fee calculation (GIG Logistics, Sendbox, Kwik)
- **Public order tracking** — order number only, no login
- **Mobile-optimized Admin Panel** for Ibrahim (non-technical)
- Site aesthetic: **editorial / minimal / luxury streetwear**

---

## File Structure

```
src/
  app/
    page.tsx                    ← Homepage
    layout.tsx                  ← Root layout (Header + Footer)
    globals.css
    shop/
      page.tsx                  ← Shop All
      [category-slug]/page.tsx  ← Category filter
    collections/page.tsx        ← Collections index
    products/[slug]/page.tsx    ← Product detail
    cart/page.tsx               ← Cart
    checkout/
      page.tsx                  ← Checkout form
      success/page.tsx          ← Order success
    track/page.tsx              ← Public order tracking
    admin/                      ← (not built yet)
    api/                        ← (not built yet)
  components/
    Header.tsx                  ← Sticky nav
    Footer.tsx                  ← Links + waitlist form
  lib/                          ← (not built yet — supabase.ts, types.ts, cart-store.ts)
```

---

## Database Schema

Migration: `supabase/migrations/20240221000000_initial_schema.sql`

Tables: `contacts`, `categories`, `collections`, `products`, `product_images`, `product_variants`, `customers`, `addresses`, `orders`, `order_items`, `delivery_tracking`, `waitlist`, `abandoned_carts`

Key fields:
- `orders.order_number`: `IBY-YYYYXXXX`
- `orders.source`: website / instagram / whatsapp / walk_in / other
- `orders.payment_method`: paystack_online / bank_transfer / cash / pos_terminal

---

## Progress Log

- **[2026-02-21 04:44]** Gemini: Initialized Next.js 14 project, installed dependencies, created Supabase schema migration.
- **[2026-02-21 05:15]** Gemini: Scaffolded UI pages (shop, collections, product, cart, checkout, track, Header, Footer).
- **[2026-02-21 05:18]** Gemini: Added agent tracking files, integrated logo images.
- **[2026-02-21]** Claude: Audited setup, created CLAUDE.md, set up multi-agent coordination system (task.md, CODEX.md).
- **[2026-02-21 09:30]** Claude: Full audit of Batch 2 + Batch 1 remaining work. All 30 tasks (G1-G15, C1-C15) marked done by agents. Found and fixed 6 issues:
  1. `collections/[slug]/page.tsx` — bare `<img>` tags replaced with `<Image />` (C13 missed this file)
  2. `admin/login/page.tsx` — removed unused imports (`supabaseBrowser`, `email`, `setEmail`), fixed `any` type
  3. `admin/_components/AdminSidebar.tsx` — removed unused `supabaseBrowser` import
  4. `api/waitlist/route.ts` — removed `source` field insertion (column doesn't exist in waitlist table)
  5. `api/admin/logout/route.ts` — fixed cookie deletion to specify `path=/admin` and `maxAge: 0`
  6. **Checkout page completely rebuilt** — C7 was marked done but file was still a static placeholder. Built full checkout with Paystack integration (dynamic import to avoid SSR window error), Zustand cart state, delivery calculation, 36 Nigerian states, form validation, and order creation flow.
- **[2026-02-21 09:30]** Claude: Assigned Batch 3 — C16-C17 (Codex: category page, PostHog), G16-G17 (Gemini: Redis caching, Resend email). Updated unassigned queue to reflect all admin tasks are complete.
- **[2026-02-21 10:00]** Claude: Audited Batch 3 output. Found and fixed 5 critical issues + 1 Redis config bug:
  1. `src/lib/cache.ts` — removed double `JSON.stringify()` (Upstash Redis auto-serializes, was causing cache hits to return strings instead of objects)
  2. `src/app/api/orders/route.ts` — added `payment_reference` to destructuring and DB insert (was being sent by checkout but completely ignored by the API, breaking webhook lookup)
  3. `src/app/api/orders/route.ts` — removed immediate email send on order creation (was duplicating the webhook email). Confirmation now only sent from webhook after `charge.success`.
  4. `src/app/api/paystack/webhook/route.ts` — added guard for empty `PAYSTACK_SECRET_KEY` (was silently passing HMAC verification)
  5. `src/app/(site)/layout.tsx` — wrapped `<PostHogPageView />` in `<Suspense>` boundary (required because `useSearchParams()` triggers dynamic rendering)
  6. `src/lib/redis.ts` — added `url.startsWith('https://')` validation so mock Redis kicks in for placeholder env vars (was crashing the build)
- **[2026-02-21 10:00]** Claude: Configured Paystack test keys in `.env.local` (pk_test and sk_test).
- **[2026-02-21 10:00]** Claude: Assigned Batch 4 — G18-G19 (Gemini: international delivery API, Vitest setup + API tests), C18-C19 (Codex: international checkout UI, component/store tests). Updated GEMINI.md and CODEX.md with audit notes from Batch 3.
- **[2026-02-21 11:00]** Claude: Audited Batch 4 — all tasks verified done (G18 08:40, G19 08:42, C18 08:51, C19 08:51). Fixed vitest.config.ts build error (excluded from tsconfig.json). Built 5 missing pages: /brand (Our Story editorial page), /lookbook (gallery from product images with "Coming Soon" fallback), /size-guide (tops + bottoms measurement tables, how-to-measure tips), /faq (accordion-style, 5 categories, 14 Q&As), /contact (WhatsApp/Instagram/email + contact form). Fixed ProductPurchasePanel.tsx: added quantity selector (± buttons, max 10 or stock limit), "Added ✓" green feedback for 2.5s, and "In Cart (qty) — Add More" when variant already exists in cart. Created ₦1,000 test product (test-checkout-tee, sizes S/M/L, 50 stock each) for checkout testing. Assigned Batch 5: G20-G21 (mobile hamburger menu, reusable ProductCard component), C20-C21 (cart page UX improvements, page transitions + loading states).
- **[2026-02-21 11:10]** Claude: Assigned Batch 6 — G22-G23 (Gemini: admin order search/filter, abandoned cart recovery API), C22-C23 (Codex: admin product bulk upload CSV, frontend abandoned cart recovery modal). All previous tasks audited and verified complete.
- **[2026-02-21 11:30]** Claude: Audited Batch 6 — all 4 tasks verified done (G22 09:37, G23 09:37, C22 10:13, C23 10:13). Fixed 3 build errors from Batch 5/6 output: (1) unused `Image` import in `src/app/(site)/shop/[category-slug]/page.tsx` after G21 refactored to ProductCard, (2) `cartData?: any` param in `src/lib/email.ts` — was declared but unused, caused ESLint any+unused errors, (3) `sendAbandonedCartRecovery(email, cart_data)` in `src/app/api/abandoned-cart/recover/route.ts` called with 2 args after param was removed — fixed to 1 arg. Also fixed `export const dynamic = 'force-dynamic'` placement in `page.tsx` and `shop/page.tsx` — had been inserted between import statements by Gemini G16 work. Assigned Batch 7: G24-G26 (Gemini: SEO metadata, stock decrement, admin stats API), C24-C26 (Codex: cart slug fix, admin dashboard, sitemap.ts).
- **[2026-02-21 12:00]** Claude: Ad-hoc fixes — (1) Built order status notification system: `sendOrderStatusUpdate()` added to `email.ts`; new `PATCH /api/admin/orders/[id]` route (auth-checked) updates DB status + inserts tracking row + sends Resend email AND Fonnte WhatsApp to customer in parallel. Admin order detail page now calls this route instead of raw Supabase — shows "Saved · Customer notified" on success. (2) Fixed non-guessable order numbers: replaced sequential `IBY-20260001` with random alphanumeric `IBY-2026-K3M7PQ` format. (3) Fixed GoTrueClient duplicate instance warning in `supabase.ts` using globalThis singleton pattern.
- **[2026-02-21 session resumed]** Claude: Fixed critical Vercel build crash — `supabase.ts` used `!` non-null assertions; during `next build` without env vars, `createClient(undefined, undefined)` threw "supabaseUrl is required". Fixed with `?? 'http://localhost'` / `?? 'placeholder-anon-key'` fallbacks so modules import safely at build time. Committed + pushed to master. User must still add all env vars to Vercel project settings. Assigned Batch 8: G27 (Cloudinary upload API + robots.txt), G28 (cache invalidation on admin edits), C27 (image upload UI in admin product forms), C28 (product search + category filter on shop page).
- **[2026-02-22]** Claude: Fixed email "Track Your Order" button 404 — all 3 email templates in `src/lib/email.ts` had hardcoded `https://iby-closet.com` URLs. Replaced with `process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'`. Added `NEXT_PUBLIC_APP_URL=https://ibycloset.vercel.app` to `.env.local`. Added `NEXT_PUBLIC_APP_URL` to `.env.example`. Committed + pushed. User must add `NEXT_PUBLIC_APP_URL=https://ibycloset.vercel.app` to Vercel env vars.
- **[2026-02-22]** Claude: Assigned Batch 10 — G34-G35 (Gemini: homepage real photo hero + lookbook strip + brand teaser + collection fallbacks), C31-C32 (Codex: lookbook full gallery with all 40 local images, brand page founder photo). Ibrahim has 40 real photos in `/public/images/instagram/` — this batch wires them into the site. Confirmed exact filenames: 15 editorial post_* and 23 product_* (product_108–113, 115, 116, 118, 120, 131 do NOT exist).
- **[2026-02-22]** Claude: Audited Batch 10 — all 4 tasks verified done (G34, G35, C31, C32). Build passes clean (0 errors). Fixed 1 issue: `export const dynamic = 'force-dynamic'` was again placed between import statements in `collections/page.tsx` (recurring Gemini pattern — also seen in G16, G32). Fixed by moving after all imports. **System note:** Going forward Gemini gets majority of tasks (faster). Always update all coordination .md files after each batch.
- **[2026-02-22 — Recurring Gemini bug]** `export const dynamic = 'force-dynamic'` must always go AFTER all import statements. Gemini repeatedly inserts it between imports. Claude must always check collections/page.tsx and any Gemini-edited page for this pattern after each batch.
- **[2026-02-22]** Claude: Audited Batch 11 (G36) — ProductImageGallery.tsx correctly created as `'use client'` component with useState, large selected image, thumbnail grid with ring-2 ring-black active state. product detail page.tsx correctly imports it, export const dynamic placed AFTER imports (Gemini fixed this one). Build passes clean (0 errors). All Batch 11 tasks verified done.
- **[2026-02-22]** Claude: Assigned Batch 12 (G37 to Gemini) — 3 UI polish fixes from Ibrahim's screenshot review: (1) hero image crop on desktop → change `object-top` to `object-[center_25%]` to reveal subject's face on landscape viewports; (2) lookbook strip has no desktop scroll arrows → extract strip to `LookbookStrip.tsx` client component with prev/next chevron buttons (hidden on mobile, visible md+); (3) collection cards cut off subject's face in landscape `aspect-video` container → add `object-top` to card images in both `page.tsx` and `collections/page.tsx`. GEMINI_DETAILED.md is confirmed useful for faster auditing.
- **[2026-02-22]** Claude: Fixed mobile hamburger menu bug — nav links (Shop, Collections, Brand, Lookbook, etc.) were present in code but invisible because the outer overlay div had both `flex flex-col` AND `overflow-y-auto`, which collapsed the `flex-1` nav to zero height. Removed `overflow-y-auto` from outer container. Build clean.
- **[2026-02-22]** Claude: Assigned Batch 13 (G38, G39, G40 all to Gemini) — G38: "You May Also Like" related products strip on product detail page; G39: collection detail hero upgrade with full-bleed image + gradient scrim + overlaid name/description/release date; G40: BackToTop floating button (`src/components/BackToTop.tsx`) added to (site)/layout.tsx.
