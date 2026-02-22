# CODEX.md — Codex Agent Workspace

**This file belongs to Codex (OpenAI ChatGPT/Codex).**
- Codex reads AND writes this file
- Other agents (Claude, Gemini) read this file but do NOT edit it
- Always append to the Progress Log when completing work

---

## ⚠ STANDING INSTRUCTION — Detailed Log File

After completing each batch of tasks, append a section to **`CODEX_DETAILED.md`** (create it if it doesn't exist) at the project root. Format:

```
## Batch N — YYYY-MM-DD
### Task CXX: Short Title
**Objective:** ...
**Implementation Details:**
- Why you made each key decision
- Edge cases you handled and how
- Any patterns or gotchas
- What you removed / replaced and why
```

This helps Claude audit your work faster without having to re-read all the code.

---

## ⚠ NEW TASKS — Batch 10 (2026-02-22)

You have 2 new tasks: **C31, C32**. Read `task.md` for full specs. Work order: **C31 → C32**.

**Summary:**
- **C31** — Lookbook page (`src/app/(site)/lookbook/page.tsx`): Full rewrite. Remove the Supabase `getLookbookImages()` call entirely. Define two static arrays (`EDITORIAL` 15 items, `PRODUCTS` 23 items) at the top of the file. Render a masonry gallery — editorial in 3 columns, products in 4 columns. Black bg, hero with `post_19.jpg` at `opacity-40`.
- **C32** — Brand page (`src/app/(site)/brand/page.tsx`): Add missing `import Image from 'next/image'`. Replace the gradient div placeholder with `<Image src="/images/instagram/product_100.jpg" fill className="object-cover object-top" />`.

**Critical image filenames — ONLY use these (all in `/images/instagram/`):**
- Editorial: `post_0, post_1, post_4, post_5, post_7, post_8, post_10, post_12, post_14, post_16, post_18, post_19, post_20, post_22, post_24` (all `.jpg`)
- Product: `product_100, 101, 102, 103, 104, 105, 106, 107, 114, 117, 119, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 132, 133` (all `.jpg`)
- DO NOT reference: product_108–113, 115, 116, 118, 120, 131 — these files DO NOT EXIST

**Key constraint for C31 — masonry + images:**
- Use `width={600} height={800}` (NOT `fill`) for editorial masonry images
- Use `width={400} height={500}` (NOT `fill`) for product masonry images
- CSS `columns` layout does NOT work with Next.js `<Image fill>` — must use fixed width/height
- Add `className="w-full object-cover"` to each image so it fills its column cell
- Keep existing `metadata` export unchanged, keep as server component (no `'use client'`)

---

## ⚠ PATH CHANGE — READ BEFORE CONTINUING

Claude restructured the project between your sessions. Here is exactly what changed:

**All customer-facing pages moved into a route group folder:**
```
OLD path                              NEW path
src/app/shop/page.tsx           →   src/app/(site)/shop/page.tsx
src/app/collections/page.tsx    →   src/app/(site)/collections/page.tsx
src/app/products/[slug]/...     →   src/app/(site)/products/[slug]/...
src/app/cart/page.tsx           →   src/app/(site)/cart/page.tsx
src/app/checkout/page.tsx       →   src/app/(site)/checkout/page.tsx
src/app/checkout/success/...    →   src/app/(site)/checkout/success/...
src/app/track/page.tsx          →   src/app/(site)/track/page.tsx
src/app/page.tsx                →   src/app/(site)/page.tsx
```

**Why:** The `(site)` is a Next.js route group — it does NOT change any URLs (`/shop` still works as `/shop`). It was needed so the admin panel (`src/app/admin/`) gets a completely separate layout with no Header/Footer.

**What NOT to touch:**
- `src/app/admin/` — Claude already built the admin panel. Do not edit these files.
- `src/app/(site)/layout.tsx` — already exists with Header + Footer, do not create another one.
- `src/app/layout.tsx` — root layout, already correct.

**Your remaining tasks are C8, C9, C10 only** (C11 and C12 have been reassigned to Gemini).
All three tasks already have the correct new file paths in `task.md`. Just read task.md and proceed.

---

## Your Role

You are a **coding agent** for the iby_closet project. You implement assigned tasks from `task.md`.

**Before starting any session:**
1. Read this file top to bottom (especially the ⚠ section above)
2. Read `task.md` — find your incomplete tasks, work top-to-bottom
3. Read `context_window.md` if you need a fast project overview

**After completing a task:**
1. Mark it done in `task.md` — change `[ ]` to `[x]`, append `| Done: YYYY-MM-DD HH:MM`
2. Log what you did in the Progress Log below

---

## Project Context Quick Reference

- **Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase, Paystack, Resend, Fonnte, Cloudinary, PostHog, Upstash Redis
- **DB:** Supabase — see migration at `supabase/migrations/20240221000000_initial_schema.sql`
- **Components:** `src/components/` (Header, Footer)
- **Customer pages:** `src/app/(site)/` — shop, collections, products/[slug], cart, checkout, track
- **Admin pages:** `src/app/admin/` — DO NOT touch, built by Claude
- **API routes:** `src/app/api/` — DO NOT touch, built by Gemini
- **Lib:** `src/lib/` — supabase.ts, types.ts, cart-store.ts
- **Order format:** `IBY-YYYYXXXX`
- **Full brief:** `CLAUDE.md`
- **All tasks:** `task.md`

---

## Coding Standards

- TypeScript — no `any` types
- Tailwind only for styling — no inline styles, no CSS modules
- Server Components by default; `'use client'` only when needed (event handlers, hooks, browser APIs)
- All Supabase queries go through `src/lib/supabase.ts`
- Mobile-first — test layouts at 375px width first

---

## Progress Log

- 2026-02-21 05:43 | TASK C1 complete
  - Installed `zustand` dependency.
  - Created `src/lib/cart-store.ts` with persisted Zustand cart store (`items`, `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `totalItems`, `subtotal`).
- 2026-02-21 05:48 | TASK C2 complete
  - Updated `src/components/Header.tsx` to a client component.
  - Wired live cart count using Zustand (`Cart ({totalItems})`) with existing styles preserved.
- 2026-02-21 05:50 | TASK C3 complete
  - Replaced shop placeholder with server-side Supabase fetch for active products.
  - Added primary image lookup from `product_images`, 2-col mobile / 4-col desktop product grid, and price formatting (`₦XX,XXX`) with links to product detail pages.
- 2026-02-21 05:56 | TASK C4 complete
  - Replaced collections placeholder with server-side Supabase fetch for `active` and `upcoming` collections.
  - Implemented editorial collection cards with cover image, 2-line description clamp, upcoming amber badge, and conditional CTA text (`Notify Me` / `Explore`).
- 2026-02-21 05:59 | TASK C5 complete
  - Rebuilt product detail page with server-side fetch for product, variants, images, and collection name.
  - Added client purchase panel (`src/app/(site)/products/[slug]/ProductPurchasePanel.tsx`) for size selection + cart integration and sold-out button disabling.
  - Added fabric details and care instructions accordions with required product layout and gallery structure.
- 2026-02-21 06:04 | TASK C6 complete
  - Replaced the cart placeholder with a client-side Zustand cart page (`src/app/(site)/cart/page.tsx`).
  - Added item rendering, quantity +/- controls, remove action, order summary sidebar, checkout CTA, and empty-cart state linking to `/shop`.
- 2026-02-21 06:09 | TASK C7 complete
  - Rebuilt checkout as a client flow with form validation, Nigerian state dropdown, and dynamic delivery option fetch via `POST /api/delivery/calculate`.
  - Integrated Paystack inline payments using `react-paystack` and wired success callback to `POST /api/orders` with `payment_reference`, then redirect to `/checkout/success?order=...`.
  - Connected sidebar summary to Zustand cart state and added loading/error feedback handling.
- 2026-02-21 06:20 | TASK C8 complete
  - Built `src/app/(site)/checkout/success/page.tsx` as a client page.
  - Reads `?order=` query param, shows large order number, links to `/track?order=...` and `/shop`, and clears cart on mount.
- 2026-02-21 06:20 | TASK C9 complete
  - Built `src/app/(site)/track/page.tsx` with order lookup form calling `GET /api/orders/[orderNumber]`.
  - Added state badge, items list, delivery address display, vertical tracking timeline, and 404 "Order not found" handling.
- 2026-02-21 06:20 | TASK C10 complete
  - Updated `src/components/Footer.tsx` to a client component and wired newsletter form to `POST /api/contacts` with `{ email, source: 'footer' }`.
  - Added inline success/error feedback and loading state while preserving existing footer styling.
- 2026-02-21 07:37 | TASK C11 complete
  - Rebuilt `src/app/(site)/page.tsx` as a server component connected to Supabase featured products and collections.
  - Replaced placeholder sections with real product cards (with primary images) and a new featured collections section while preserving the existing hero.
- 2026-02-21 07:37 | TASK C12 complete
  - Built `src/app/(site)/collections/[slug]/page.tsx` as a server-rendered collection detail page with `notFound()` handling.
  - Added hero rendering (cover image or fallback black hero), release date label, and active product grid with primary images and empty-state message.
- 2026-02-21 07:37 | TASK C13 complete
  - Replaced bare `<img>` tags with Next.js `<Image />` in the required files:
    `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/app/(site)/shop/page.tsx`, `src/app/(site)/collections/page.tsx`, `src/app/(site)/products/[slug]/page.tsx`, `src/app/(site)/cart/page.tsx`.
  - Added responsive `sizes` and `fill` usage where needed, and configured remote image domains in `next.config.mjs`.
- 2026-02-21 07:37 | TASK C14 complete
  - Added `src/app/(site)/collections/_components/NotifyMeButton.tsx` (client component) with expandable email/WhatsApp waitlist form.
  - Integrated notify form into upcoming collection cards in `src/app/(site)/collections/page.tsx` and wired POST to `/api/waitlist`.
- 2026-02-21 08:02 | TASK C15 complete
  - Extended `src/app/(site)/products/[slug]/ProductPurchasePanel.tsx` for two new states:
    no variants => "Enquire on WhatsApp" CTA using `NEXT_PUBLIC_WHATSAPP_NUMBER`; variants with zero stock => out-of-stock messaging.
  - Updated `src/app/(site)/products/[slug]/page.tsx` to pass all variants (not only in-stock), so stock-state UI can render correctly.
  - Added `NEXT_PUBLIC_WHATSAPP_NUMBER` to `.env.example`.
- 2026-02-21 08:23 | TASK C16 complete
  - Built `src/app/(site)/shop/[category-slug]/page.tsx` as a server category filter page with slug lookup, `notFound()` guard, active-product fetch, primary image mapping, and "Back to Shop" navigation.
  - Rendered products using the same responsive card grid style as the main shop page.
- 2026-02-21 08:23 | TASK C17 complete
  - Added `src/components/PostHogProvider.tsx` and `src/components/PostHogPageView.tsx` for PostHog initialization and route-based `$pageview` capture.
  - Wired PostHog provider + pageview component into `src/app/(site)/layout.tsx`.
  - Added `add_to_cart` event capture in `src/lib/cart-store.ts` via dynamic import of `posthog-js` inside `addItem`.
- 2026-02-21 08:51 | TASK C18 complete
  - Updated `src/app/(site)/checkout/page.tsx` to support international orders with country selection (Nigeria default + custom "Other"), conditional state/province input, and country-aware delivery option requests.
  - Included `country` in the checkout order payload `delivery_address` JSON object.
- 2026-02-21 08:51 | TASK C19 complete
  - Added component test stack dependencies (`@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, and ensured `vitest`/`@vitejs/plugin-react` availability).
  - Created `__tests__/components/cart-store.test.ts` and `__tests__/components/PaystackButton.test.tsx`.
  - Updated `vitest.config.ts` for component-test jsdom matching and kept shared setup in `__tests__/setup.ts`.
  - Ran full test suite successfully (`15 passed`).
- 2026-02-21 09:26 | TASK C20 complete
  - Refined `src/app/(site)/cart/page.tsx` item rows with 40x50 rounded thumbnails, clearer size/color/unit metadata, quantity controls, line totals, and remove action.
  - Added a `Continue Shopping` link below cart items and kept the existing empty-cart state unchanged.
  - Updated order summary copy to show `Delivery calculated at checkout` as the delivery note.
- 2026-02-21 09:26 | TASK C21 complete
  - Added `src/components/PageTransition.tsx` with a 300ms fade-in animation and route-aware remount via `usePathname`.
  - Wrapped site layout children in `PageTransition` at `src/app/(site)/layout.tsx` while preserving the existing PostHog Suspense boundary.
  - Added branded loading UIs at `src/app/(site)/loading.tsx` and `src/app/admin/loading.tsx`.
- 2026-02-21 10:13 | TASK C22 complete
  - Extended `src/app/admin/products/page.tsx` with CSV bulk-upload flow: file selection, parser, preview table, row validation, and confirmation action.
  - Added product/variant/image insertion logic with per-row error reporting and rollback on partial insert failures.
  - Added guidance for CSV headers and supported `variants`/`image_urls` formats directly in the admin UI.
- 2026-02-21 10:13 | TASK C23 complete
  - Updated `src/app/(site)/cart/page.tsx` with abandoned-cart detection using a 30-minute localStorage activity window.
  - Added recovery modal with email/WhatsApp inputs that calls `POST /api/abandoned-cart/recover` and sends cart data payload.
  - Added inline recovery success/error feedback and localStorage cooldown flag to prevent repeated prompt spam.
- 2026-02-21 10:52 | TASK C24 complete
  - Added `slug: string` to the `CartItem` shape in `src/lib/cart-store.ts`.
  - Updated `src/app/(site)/products/[slug]/ProductPurchasePanel.tsx` add-to-cart payload to include `slug` from the route params.
  - Updated `src/app/(site)/cart/page.tsx` product title to render `item.slug ? <Link ...> : <span>` for backward compatibility with older persisted cart items.
- 2026-02-21 10:52 | TASK C25 complete
  - Replaced the redirect in `src/app/admin/page.tsx` with a client dashboard page.
  - Added 4 stat cards with zero-safe fallback when `GET /api/admin/stats` is unavailable.
  - Added recent orders panel (latest 5 via `supabaseBrowser`) with status badges, amount, and `DD MMM HH:mm` timestamp display plus quick actions.
- 2026-02-21 10:52 | TASK C26 complete
  - Created `src/app/sitemap.ts` returning `MetadataRoute.Sitemap` for static routes and dynamic product/collection URLs.
  - Added Supabase queries for active products and active/upcoming collections using `supabaseServer`.
  - Applied per-route priorities/frequencies and hardcoded base URL `https://iby-closet.com`.
- 2026-02-21 11:28 | TASK C27 complete
  - Added reusable `src/components/ImageUploader.tsx` with dashed drop-zone label, local preview (`URL.createObjectURL`), upload state, and inline error handling.
  - Refactored `src/app/admin/products/_components/ProductForm.tsx` image section to use uploader-driven image slots (`onUpload` updates image URL state).
  - Applied the same uploader-based flow to both create/edit product forms via shared `ProductForm` and kept admin products CSV functionality unchanged.
- 2026-02-21 11:28 | TASK C28 complete
  - Added `src/app/(site)/shop/_components/ShopFilter.tsx` client component with search + category pills and filtered product grid rendering.
  - Updated `src/app/(site)/shop/page.tsx` to fetch categories server-side and pass `products` + `categories` to `ShopFilter`.
  - Preserved the existing `cachedFetch('shop:products', ...)` wrapping for product data.
- 2026-02-22 04:10 | TASK C31 complete
  - Fully rewrote `src/app/(site)/lookbook/page.tsx` to remove Supabase-powered image fetching and use static local image arrays (`EDITORIAL`, `PRODUCTS`) as specified.
  - Implemented the requested black hero, section labels, editorial masonry, product masonry, and Instagram CTA structure using Next.js `Image` with fixed width/height in masonry blocks.
  - Kept the page as a server component and preserved the existing `metadata` export.
- 2026-02-22 04:10 | TASK C32 complete
  - Updated `src/app/(site)/brand/page.tsx` to import `Image` from `next/image`.
  - Replaced the founder placeholder gradient block with the real founder photo block using `/images/instagram/product_100.jpg` and `fill` sizing.
  - Kept all surrounding brand-page layout and copy unchanged.

---

## ⚠ NEW TASKS ASSIGNED — Batch 7 (2026-02-21)

You have 3 new tasks: **C24, C25, C26**. Read `task.md` for full specs. Work order: **C24 → C25 → C26**.

**Summary:**
- **C24** — Add `slug: string` to the `CartItem` type in `cart-store.ts`. Pass `product.slug` when calling `addItem` in `ProductPurchasePanel.tsx`. In the cart page, wrap product names in `<Link href={/products/${item.slug}}>` (with a guard for old items without slug).
- **C25** — Build Admin Dashboard at `src/app/admin/page.tsx`. Fetch `GET /api/admin/stats` (Gemini builds G26) for stat cards: Revenue, Orders, Products, New Today. Show last 5 recent orders from Supabase. Quick action buttons: New Manual Order, Quick Sale.
- **C26** — Create `src/app/sitemap.ts`. Export async sitemap function returning static routes + all active product `/products/[slug]` routes + all active/upcoming collection `/collections/[slug]` routes. Base URL: `https://iby-closet.com`.

**⚠ Claude audit notes from Batch 6 (C22-C23):**
- C22 (CSV upload) and C23 (abandoned cart modal) were correctly implemented.
- Claude fixed 3 build errors from prior batches: unused `Image` import in `shop/[category-slug]/page.tsx`, `cartData?: any` param in `email.ts`, wrong arg count in `abandoned-cart/recover/route.ts`.
- `export const dynamic = 'force-dynamic'` must be placed AFTER all imports, not between them — Claude fixed this in `page.tsx` and `shop/page.tsx`.
- **C25 depends on G26** — if stats API isn't ready, show 0 placeholders. Don't block.
- **CartItem slug guard** (C24): use `item.slug ? <Link href=...> : <span>` for backwards compatibility with old localStorage cart items.

---

## ⚠ NEW TASKS ASSIGNED — Batch 5 (2026-02-21)

You have 2 new tasks: **C20, C21**. Read `task.md` for full specs. Work order: **C20 → C21**.

**Summary:**
- **C20** — Improve the Cart page UX. Add product image thumbnails for each item, improve layout with better spacing, add "Continue Shopping" link, and delivery note in the order summary. Clean up the responsive layout.
- **C21** — Add smooth page transitions and loading states. Create a `PageTransition` component with fade-in effect, wrap site content in it. Create `loading.tsx` files for both `(site)` and `admin` route groups with minimal branded loading UI.

**⚠ Claude notes from Batch 4 + current session:**
- Claude fixed ProductPurchasePanel: added quantity selector with +/- buttons, "Added ✓" feedback for 2.5s after adding to cart, and "In Cart (qty) — Add More" button text when variant is already in cart. Do NOT revert these changes.
- Claude built 5 new pages: `/brand`, `/lookbook`, `/size-guide`, `/faq`, `/contact`. These are in `src/app/(site)/brand/`, `lookbook/`, `size-guide/`, `faq/`, `contact/`. Do NOT edit these.
- `vitest.config.ts` is now excluded from `tsconfig.json` to fix a build error. Do NOT add it back.
- Cart items have these fields: `product_id`, `variant_id`, `product_name`, `size`, `color`, `unit_price`, `quantity`, `image_url`. Note: there is no `slug` field — use product name without links if needed.
- All previous batch audit notes still apply.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C18, C19**. Read `task.md` for full specs. Work order: **C18 → C19**.

**Summary:**
- **C18** — Add international order support to the checkout page. Add a country selector (Nigeria default, plus Ghana, Kenya, South Africa, UK, US, Canada, Other). When non-Nigeria, swap the state dropdown for a text input. Pass `country` to the delivery API and include it in the order's delivery_address JSONB.
- **C19** — Write frontend tests using Vitest + React Testing Library. Test the Zustand cart store (add/remove/update/clear/computed values) and the PaystackButton component (render, disabled state, amount format). Vitest will already be installed by Gemini's G19 task.

**⚠ Important notes:**
- **C19 depends on G19** — Gemini installs vitest and creates the base config. You add `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` and write component/store tests. If vitest isn't installed yet, install it yourself.
- **Checkout page** was rebuilt by Claude with full Paystack integration. Read `src/app/(site)/checkout/page.tsx` carefully before editing — it has: PaystackButton dynamic import, Nigerian states dropdown, delivery option fetch, form validation, and order creation flow.
- **PaystackButton** is at `src/app/(site)/checkout/PaystackButton.tsx` — a client component using `react-paystack`.
- The delivery API now accepts an optional `country` field (G18 adds this). Default to `'Nigeria'` if G18 isn't done yet.

**⚠ Claude audit notes from Batch 3:**
- PostHogPageView needed a `<Suspense>` boundary because `useSearchParams()` triggers dynamic rendering. Claude wrapped it in `<Suspense fallback={null}>` in the site layout. Don't remove this.
- All other C16-C17 work was clean.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C16, C17**. Read `task.md` for full specs. Work order: **C16 → C17**.

**Summary:**
- **C16** — Build Category filter page (`src/app/(site)/shop/[category-slug]/page.tsx`). Server component. Fetch category by slug, then fetch products in that category. Same grid layout as the shop page. Use `notFound()` if slug invalid. Use `supabaseServer`, `Image` from `next/image`.
- **C17** — Set up PostHog analytics. Create `PostHogProvider.tsx` and `PostHogPageView.tsx` in `src/components/`. Add them to `src/app/(site)/layout.tsx`. Track page views + add-to-cart events. Use `posthog-js` (already installed).

**⚠ Claude audit notes from previous batches:**
- Checkout page (C7) was still a placeholder — Claude rebuilt it with full Paystack integration, delivery calculation, cart state, and form validation.
- `collections/[slug]/page.tsx` (C12) had bare `<img>` tags that C13 missed — Claude fixed.
- Several unused imports were cleaned up from admin files.
- The waitlist API route had a `source` field that doesn't exist in the DB — Claude fixed.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 3 (2026-02-21)

You have 1 new task: **C15**. Read `task.md` for full spec. Summary:

- **C15** — Improve the product detail page for the "no variants" case. In `ProductPurchasePanel.tsx`: if NO variants exist, show a WhatsApp enquiry button (`https://wa.me/${NEXT_PUBLIC_WHATSAPP_NUMBER}?text=...`) instead of the size selector. If variants exist but stock is 0, show an out-of-stock message. Add `NEXT_PUBLIC_WHATSAPP_NUMBER` to `.env.example`. Keep all other existing logic unchanged.

**Work order: C15 only.**

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 2 (2026-02-21)

You have 4 new tasks: **C11, C12, C13, C14**. Read `task.md` for full specs. Summary:

- **C11** — Wire Homepage (`src/app/(site)/page.tsx`) to real Supabase data. Fetch is_featured products + collections. Server component. Use `supabaseServer` from `@/lib/supabase`.
- **C12** — Build Collection detail page (`src/app/(site)/collections/[slug]/page.tsx`). Hero + products in that collection. Server component. Use `notFound()` if slug not found.
- **C13** — Replace all `<img>` tags with Next.js `<Image />` across: `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/app/(site)/shop/page.tsx`, `src/app/(site)/collections/page.tsx`, `src/app/(site)/products/[slug]/page.tsx`, `src/app/(site)/cart/page.tsx`. Also check `next.config.js` and add `images.remotePatterns` for any external image domains (Cloudinary, Instagram CDN, etc).
- **C14** — Wire "Notify Me" CTA on collections page. Create `src/app/(site)/collections/_components/NotifyMeButton.tsx` (client component). POST to `/api/waitlist`. **Do C14 last** — it depends on Gemini finishing G13 first.

**Work order: C11 → C12 → C13 → C14**

---

## ⚠ NEW TASKS ASSIGNED — Batch 6 (2026-02-21)

You have 2 new tasks: **C22, C23**. Read `task.md` for full specs. Work order: **C22 → C23**.

**Summary:**
- **C22** — Add CSV upload to `/admin/products/page.tsx`. Parse CSV, insert products/variants/images, show preview, handle errors.
- **C23** — On cart page, detect abandoned cart (>30min), show modal offering recovery link via email/WhatsApp. Call `/api/abandoned-cart/recover`.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C18, C19**. Read `task.md` for full specs. Work order: **C18 → C19**.

**Summary:**
- **C18** — Add international order support to the checkout page. Add a country selector (Nigeria default, plus Ghana, Kenya, South Africa, UK, US, Canada, Other). When non-Nigeria, swap the state dropdown for a text input. Pass `country` to the delivery API and include it in the order's delivery_address JSONB.
- **C19** — Write frontend tests using Vitest + React Testing Library. Test the Zustand cart store (add/remove/update/clear/computed values) and the PaystackButton component (render, disabled state, amount format). Vitest will already be installed by Gemini's G19 task.

**⚠ Important notes:**
- **C19 depends on G19** — Gemini installs vitest and creates the base config. You add `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` and write component/store tests. If vitest isn't installed yet, install it yourself.
- **Checkout page** was rebuilt by Claude with full Paystack integration. Read `src/app/(site)/checkout/page.tsx` carefully before editing — it has: PaystackButton dynamic import, Nigerian states dropdown, delivery option fetch, form validation, and order creation flow.
- **PaystackButton** is at `src/app/(site)/checkout/PaystackButton.tsx` — a client component using `react-paystack`.
- The delivery API now accepts an optional `country` field (G18 adds this). Default to `'Nigeria'` if G18 isn't done yet.

**⚠ Claude audit notes from Batch 3:**
- PostHogPageView needed a `<Suspense>` boundary because `useSearchParams()` triggers dynamic rendering. Claude wrapped it in `<Suspense fallback={null}>` in the site layout. Don't remove this.
- All other C16-C17 work was clean.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C16, C17**. Read `task.md` for full specs. Work order: **C16 → C17**.

**Summary:**
- **C16** — Build Category filter page (`src/app/(site)/shop/[category-slug]/page.tsx`). Server component. Fetch category by slug, then fetch products in that category. Same grid layout as the shop page. Use `notFound()` if slug invalid. Use `supabaseServer`, `Image` from `next/image`.
- **C17** — Set up PostHog analytics. Create `PostHogProvider.tsx` and `PostHogPageView.tsx` in `src/components/`. Add them to `src/app/(site)/layout.tsx`. Track page views + add-to-cart events. Use `posthog-js` (already installed).

**⚠ Claude audit notes from previous batches:**
- Checkout page (C7) was still a placeholder — Claude rebuilt it with full Paystack integration, delivery calculation, cart state, and form validation.
- `collections/[slug]/page.tsx` (C12) had bare `<img>` tags that C13 missed — Claude fixed.
- Several unused imports were cleaned up from admin files.
- The waitlist API route had a `source` field that doesn't exist in the DB — Claude fixed.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 3 (2026-02-21)

You have 1 new task: **C15**. Read `task.md` for full spec. Summary:

- **C15** — Improve the product detail page for the "no variants" case. In `ProductPurchasePanel.tsx`: if NO variants exist, show a WhatsApp enquiry button (`https://wa.me/${NEXT_PUBLIC_WHATSAPP_NUMBER}?text=...`) instead of the size selector. If variants exist but stock is 0, show an out-of-stock message. Add `NEXT_PUBLIC_WHATSAPP_NUMBER` to `.env.example`. Keep all other existing logic unchanged.

**Work order: C15 only.**

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 2 (2026-02-21)

You have 4 new tasks: **C11, C12, C13, C14**. Read `task.md` for full specs. Summary:

- **C11** — Wire Homepage (`src/app/(site)/page.tsx`) to real Supabase data. Fetch is_featured products + collections. Server component. Use `supabaseServer` from `@/lib/supabase`.
- **C12** — Build Collection detail page (`src/app/(site)/collections/[slug]/page.tsx`). Hero + products in that collection. Server component. Use `notFound()` if slug not found.
- **C13** — Replace all `<img>` tags with Next.js `<Image />` across: `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/app/(site)/shop/page.tsx`, `src/app/(site)/collections/page.tsx`, `src/app/(site)/products/[slug]/page.tsx`, `src/app/(site)/cart/page.tsx`. Also check `next.config.js` and add `images.remotePatterns` for any external image domains (Cloudinary, Instagram CDN, etc).
- **C14** — Wire "Notify Me" CTA on collections page. Create `src/app/(site)/collections/_components/NotifyMeButton.tsx` (client component). POST to `/api/waitlist`. **Do C14 last** — it depends on Gemini finishing G13 first.

**Work order: C11 → C12 → C13 → C14**

---

## ⚠ NEW TASKS ASSIGNED — Batch 6 (2026-02-21)

You have 2 new tasks: **C22, C23**. Read `task.md` for full specs. Work order: **C22 → C23**.

**Summary:**
- **C22** — Add CSV upload to `/admin/products/page.tsx`. Parse CSV, insert products/variants/images, show preview, handle errors.
- **C23** — On cart page, detect abandoned cart (>30min), show modal offering recovery link via email/WhatsApp. Call `/api/abandoned-cart/recover`.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C18, C19**. Read `task.md` for full specs. Work order: **C18 → C19**.

**Summary:**
- **C18** — Add international order support to the checkout page. Add a country selector (Nigeria default, plus Ghana, Kenya, South Africa, UK, US, Canada, Other). When non-Nigeria, swap the state dropdown for a text input. Pass `country` to the delivery API and include it in the order's delivery_address JSONB.
- **C19** — Write frontend tests using Vitest + React Testing Library. Test the Zustand cart store (add/remove/update/clear/computed values) and the PaystackButton component (render, disabled state, amount format). Vitest will already be installed by Gemini's G19 task.

**⚠ Important notes:**
- **C19 depends on G19** — Gemini installs vitest and creates the base config. You add `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` and write component/store tests. If vitest isn't installed yet, install it yourself.
- **Checkout page** was rebuilt by Claude with full Paystack integration. Read `src/app/(site)/checkout/page.tsx` carefully before editing — it has: PaystackButton dynamic import, Nigerian states dropdown, delivery option fetch, form validation, and order creation flow.
- **PaystackButton** is at `src/app/(site)/checkout/PaystackButton.tsx` — a client component using `react-paystack`.
- The delivery API now accepts an optional `country` field (G18 adds this). Default to `'Nigeria'` if G18 isn't done yet.

**⚠ Claude audit notes from Batch 3:**
- PostHogPageView needed a `<Suspense>` boundary because `useSearchParams()` triggers dynamic rendering. Claude wrapped it in `<Suspense fallback={null}>` in the site layout. Don't remove this.
- All other C16-C17 work was clean.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C16, C17**. Read `task.md` for full specs. Work order: **C16 → C17**.

**Summary:**
- **C16** — Build Category filter page (`src/app/(site)/shop/[category-slug]/page.tsx`). Server component. Fetch category by slug, then fetch products in that category. Same grid layout as the shop page. Use `notFound()` if slug invalid. Use `supabaseServer`, `Image` from `next/image`.
- **C17** — Set up PostHog analytics. Create `PostHogProvider.tsx` and `PostHogPageView.tsx` in `src/components/`. Add them to `src/app/(site)/layout.tsx`. Track page views + add-to-cart events. Use `posthog-js` (already installed).

**⚠ Claude audit notes from previous batches:**
- Checkout page (C7) was still a placeholder — Claude rebuilt it with full Paystack integration, delivery calculation, cart state, and form validation.
- `collections/[slug]/page.tsx` (C12) had bare `<img>` tags that C13 missed — Claude fixed.
- Several unused imports were cleaned up from admin files.
- The waitlist API route had a `source` field that doesn't exist in the DB — Claude fixed.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 3 (2026-02-21)

You have 1 new task: **C15**. Read `task.md` for full spec. Summary:

- **C15** — Improve the product detail page for the "no variants" case. In `ProductPurchasePanel.tsx`: if NO variants exist, show a WhatsApp enquiry button (`https://wa.me/${NEXT_PUBLIC_WHATSAPP_NUMBER}?text=...`) instead of the size selector. If variants exist but stock is 0, show an out-of-stock message. Add `NEXT_PUBLIC_WHATSAPP_NUMBER` to `.env.example`. Keep all other existing logic unchanged.

**Work order: C15 only.**

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 2 (2026-02-21)

You have 4 new tasks: **C11, C12, C13, C14**. Read `task.md` for full specs. Summary:

- **C11** — Wire Homepage (`src/app/(site)/page.tsx`) to real Supabase data. Fetch is_featured products + collections. Server component. Use `supabaseServer` from `@/lib/supabase`.
- **C12** — Build Collection detail page (`src/app/(site)/collections/[slug]/page.tsx`). Hero + products in that collection. Server component. Use `notFound()` if slug not found.
- **C13** — Replace all `<img>` tags with Next.js `<Image />` across: `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/app/(site)/shop/page.tsx`, `src/app/(site)/collections/page.tsx`, `src/app/(site)/products/[slug]/page.tsx`, `src/app/(site)/cart/page.tsx`. Also check `next.config.js` and add `images.remotePatterns` for any external image domains (Cloudinary, Instagram CDN, etc).
- **C14** — Wire "Notify Me" CTA on collections page. Create `src/app/(site)/collections/_components/NotifyMeButton.tsx` (client component). POST to `/api/waitlist`. **Do C14 last** — it depends on Gemini finishing G13 first.

**Work order: C11 → C12 → C13 → C14**

---

## ⚠ NEW TASKS ASSIGNED — Batch 6 (2026-02-21)

You have 2 new tasks: **C22, C23**. Read `task.md` for full specs. Work order: **C22 → C23**.

**Summary:**
- **C22** — Add CSV upload to `/admin/products/page.tsx`. Parse CSV, insert products/variants/images, show preview, handle errors.
- **C23** — On cart page, detect abandoned cart (>30min), show modal offering recovery link via email/WhatsApp. Call `/api/abandoned-cart/recover`.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C18, C19**. Read `task.md` for full specs. Work order: **C18 → C19**.

**Summary:**
- **C18** — Add international order support to the checkout page. Add a country selector (Nigeria default, plus Ghana, Kenya, South Africa, UK, US, Canada, Other). When non-Nigeria, swap the state dropdown for a text input. Pass `country` to the delivery API and include it in the order's delivery_address JSONB.
- **C19** — Write frontend tests using Vitest + React Testing Library. Test the Zustand cart store (add/remove/update/clear/computed values) and the PaystackButton component (render, disabled state, amount format). Vitest will already be installed by Gemini's G19 task.

**⚠ Important notes:**
- **C19 depends on G19** — Gemini installs vitest and creates the base config. You add `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` and write component/store tests. If vitest isn't installed yet, install it yourself.
- **Checkout page** was rebuilt by Claude with full Paystack integration. Read `src/app/(site)/checkout/page.tsx` carefully before editing — it has: PaystackButton dynamic import, Nigerian states dropdown, delivery option fetch, form validation, and order creation flow.
- **PaystackButton** is at `src/app/(site)/checkout/PaystackButton.tsx` — a client component using `react-paystack`.
- The delivery API now accepts an optional `country` field (G18 adds this). Default to `'Nigeria'` if G18 isn't done yet.

**⚠ Claude audit notes from Batch 3:**
- PostHogPageView needed a `<Suspense>` boundary because `useSearchParams()` triggers dynamic rendering. Claude wrapped it in `<Suspense fallback={null}>` in the site layout. Don't remove this.
- All other C16-C17 work was clean.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C16, C17**. Read `task.md` for full specs. Work order: **C16 → C17**.

**Summary:**
- **C16** — Build Category filter page (`src/app/(site)/shop/[category-slug]/page.tsx`). Server component. Fetch category by slug, then fetch products in that category. Same grid layout as the shop page. Use `notFound()` if slug invalid. Use `supabaseServer`, `Image` from `next/image`.
- **C17** — Set up PostHog analytics. Create `PostHogProvider.tsx` and `PostHogPageView.tsx` in `src/components/`. Add them to `src/app/(site)/layout.tsx`. Track page views + add-to-cart events. Use `posthog-js` (already installed).

**⚠ Claude audit notes from previous batches:**
- Checkout page (C7) was still a placeholder — Claude rebuilt it with full Paystack integration, delivery calculation, cart state, and form validation.
- `collections/[slug]/page.tsx` (C12) had bare `<img>` tags that C13 missed — Claude fixed.
- Several unused imports were cleaned up from admin files.
- The waitlist API route had a `source` field that doesn't exist in the DB — Claude fixed.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 3 (2026-02-21)

You have 1 new task: **C15**. Read `task.md` for full spec. Summary:

- **C15** — Improve the product detail page for the "no variants" case. In `ProductPurchasePanel.tsx`: if NO variants exist, show a WhatsApp enquiry button (`https://wa.me/${NEXT_PUBLIC_WHATSAPP_NUMBER}?text=...`) instead of the size selector. If variants exist but stock is 0, show an out-of-stock message. Add `NEXT_PUBLIC_WHATSAPP_NUMBER` to `.env.example`. Keep all other existing logic unchanged.

**Work order: C15 only.**

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 2 (2026-02-21)

You have 4 new tasks: **C11, C12, C13, C14**. Read `task.md` for full specs. Summary:

- **C11** — Wire Homepage (`src/app/(site)/page.tsx`) to real Supabase data. Fetch is_featured products + collections. Server component. Use `supabaseServer` from `@/lib/supabase`.
- **C12** — Build Collection detail page (`src/app/(site)/collections/[slug]/page.tsx`). Hero + products in that collection. Server component. Use `notFound()` if slug not found.
- **C13** — Replace all `<img>` tags with Next.js `<Image />` across: `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/app/(site)/shop/page.tsx`, `src/app/(site)/collections/page.tsx`, `src/app/(site)/products/[slug]/page.tsx`, `src/app/(site)/cart/page.tsx`. Also check `next.config.js` and add `images.remotePatterns` for any external image domains (Cloudinary, Instagram CDN, etc).
- **C14** — Wire "Notify Me" CTA on collections page. Create `src/app/(site)/collections/_components/NotifyMeButton.tsx` (client component). POST to `/api/waitlist`. **Do C14 last** — it depends on Gemini finishing G13 first.

**Work order: C11 → C12 → C13 → C14**

---

## ⚠ NEW TASKS ASSIGNED — Batch 6 (2026-02-21)

You have 2 new tasks: **C22, C23**. Read `task.md` for full specs. Work order: **C22 → C23**.

**Summary:**
- **C22** — Add CSV upload to `/admin/products/page.tsx`. Parse CSV, insert products/variants/images, show preview, handle errors.
- **C23** — On cart page, detect abandoned cart (>30min), show modal offering recovery link via email/WhatsApp. Call `/api/abandoned-cart/recover`.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C18, C19**. Read `task.md` for full specs. Work order: **C18 → C19**.

**Summary:**
- **C18** — Add international order support to the checkout page. Add a country selector (Nigeria default, plus Ghana, Kenya, South Africa, UK, US, Canada, Other). When non-Nigeria, swap the state dropdown for a text input. Pass `country` to the delivery API and include it in the order's delivery_address JSONB.
- **C19** — Write frontend tests using Vitest + React Testing Library. Test the Zustand cart store (add/remove/update/clear/computed values) and the PaystackButton component (render, disabled state, amount format). Vitest will already be installed by Gemini's G19 task.

**⚠ Important notes:**
- **C19 depends on G19** — Gemini installs vitest and creates the base config. You add `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` and write component/store tests. If vitest isn't installed yet, install it yourself.
- **Checkout page** was rebuilt by Claude with full Paystack integration. Read `src/app/(site)/checkout/page.tsx` carefully before editing — it has: PaystackButton dynamic import, Nigerian states dropdown, delivery option fetch, form validation, and order creation flow.
- **PaystackButton** is at `src/app/(site)/checkout/PaystackButton.tsx` — a client component using `react-paystack`.
- The delivery API now accepts an optional `country` field (G18 adds this). Default to `'Nigeria'` if G18 isn't done yet.

**⚠ Claude audit notes from Batch 3:**
- PostHogPageView needed a `<Suspense>` boundary because `useSearchParams()` triggers dynamic rendering. Claude wrapped it in `<Suspense fallback={null}>` in the site layout. Don't remove this.
- All other C16-C17 work was clean.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C16, C17**. Read `task.md` for full specs. Work order: **C16 → C17**.

**Summary:**
- **C16** — Build Category filter page (`src/app/(site)/shop/[category-slug]/page.tsx`). Server component. Fetch category by slug, then fetch products in that category. Same grid layout as the shop page. Use `notFound()` if slug invalid. Use `supabaseServer`, `Image` from `next/image`.
- **C17** — Set up PostHog analytics. Create `PostHogProvider.tsx` and `PostHogPageView.tsx` in `src/components/`. Add them to `src/app/(site)/layout.tsx`. Track page views + add-to-cart events. Use `posthog-js` (already installed).

**⚠ Claude audit notes from previous batches:**
- Checkout page (C7) was still a placeholder — Claude rebuilt it with full Paystack integration, delivery calculation, cart state, and form validation.
- `collections/[slug]/page.tsx` (C12) had bare `<img>` tags that C13 missed — Claude fixed.
- Several unused imports were cleaned up from admin files.
- The waitlist API route had a `source` field that doesn't exist in the DB — Claude fixed.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 3 (2026-02-21)

You have 1 new task: **C15**. Read `task.md` for full spec. Summary:

- **C15** — Improve the product detail page for the "no variants" case. In `ProductPurchasePanel.tsx`: if NO variants exist, show a WhatsApp enquiry button (`https://wa.me/${NEXT_PUBLIC_WHATSAPP_NUMBER}?text=...`) instead of the size selector. If variants exist but stock is 0, show an out-of-stock message. Add `NEXT_PUBLIC_WHATSAPP_NUMBER` to `.env.example`. Keep all other existing logic unchanged.

**Work order: C15 only.**

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 2 (2026-02-21)

You have 4 new tasks: **C11, C12, C13, C14**. Read `task.md` for full specs. Summary:

- **C11** — Wire Homepage (`src/app/(site)/page.tsx`) to real Supabase data. Fetch is_featured products + collections. Server component. Use `supabaseServer` from `@/lib/supabase`.
- **C12** — Build Collection detail page (`src/app/(site)/collections/[slug]/page.tsx`). Hero + products in that collection. Server component. Use `notFound()` if slug not found.
- **C13** — Replace all `<img>` tags with Next.js `<Image />` across: `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/app/(site)/shop/page.tsx`, `src/app/(site)/collections/page.tsx`, `src/app/(site)/products/[slug]/page.tsx`, `src/app/(site)/cart/page.tsx`. Also check `next.config.js` and add `images.remotePatterns` for any external image domains (Cloudinary, Instagram CDN, etc).
- **C14** — Wire "Notify Me" CTA on collections page. Create `src/app/(site)/collections/_components/NotifyMeButton.tsx` (client component). POST to `/api/waitlist`. **Do C14 last** — it depends on Gemini finishing G13 first.

**Work order: C11 → C12 → C13 → C14**

---

## ⚠ NEW TASKS ASSIGNED — Batch 6 (2026-02-21)

You have 2 new tasks: **C22, C23**. Read `task.md` for full specs. Work order: **C22 → C23**.

**Summary:**
- **C22** — Add CSV upload to `/admin/products/page.tsx`. Parse CSV, insert products/variants/images, show preview, handle errors.
- **C23** — On cart page, detect abandoned cart (>30min), show modal offering recovery link via email/WhatsApp. Call `/api/abandoned-cart/recover`.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C18, C19**. Read `task.md` for full specs. Work order: **C18 → C19**.

**Summary:**
- **C18** — Add international order support to the checkout page. Add a country selector (Nigeria default, plus Ghana, Kenya, South Africa, UK, US, Canada, Other). When non-Nigeria, swap the state dropdown for a text input. Pass `country` to the delivery API and include it in the order's delivery_address JSONB.
- **C19** — Write frontend tests using Vitest + React Testing Library. Test the Zustand cart store (add/remove/update/clear/computed values) and the PaystackButton component (render, disabled state, amount format). Vitest will already be installed by Gemini's G19 task.

**⚠ Important notes:**
- **C19 depends on G19** — Gemini installs vitest and creates the base config. You add `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` and write component/store tests. If vitest isn't installed yet, install it yourself.
- **Checkout page** was rebuilt by Claude with full Paystack integration. Read `src/app/(site)/checkout/page.tsx` carefully before editing — it has: PaystackButton dynamic import, Nigerian states dropdown, delivery option fetch, form validation, and order creation flow.
- **PaystackButton** is at `src/app/(site)/checkout/PaystackButton.tsx` — a client component using `react-paystack`.
- The delivery API now accepts an optional `country` field (G18 adds this). Default to `'Nigeria'` if G18 isn't done yet.

**⚠ Claude audit notes from Batch 3:**
- PostHogPageView needed a `<Suspense>` boundary because `useSearchParams()` triggers dynamic rendering. Claude wrapped it in `<Suspense fallback={null}>` in the site layout. Don't remove this.
- All other C16-C17 work was clean.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C16, C17**. Read `task.md` for full specs. Work order: **C16 → C17**.

**Summary:**
- **C16** — Build Category filter page (`src/app/(site)/shop/[category-slug]/page.tsx`). Server component. Fetch category by slug, then fetch products in that category. Same grid layout as the shop page. Use `notFound()` if slug invalid. Use `supabaseServer`, `Image` from `next/image`.
- **C17** — Set up PostHog analytics. Create `PostHogProvider.tsx` and `PostHogPageView.tsx` in `src/components/`. Add them to `src/app/(site)/layout.tsx`. Track page views + add-to-cart events. Use `posthog-js` (already installed).

**⚠ Claude audit notes from previous batches:**
- Checkout page (C7) was still a placeholder — Claude rebuilt it with full Paystack integration, delivery calculation, cart state, and form validation.
- `collections/[slug]/page.tsx` (C12) had bare `<img>` tags that C13 missed — Claude fixed.
- Several unused imports were cleaned up from admin files.
- The waitlist API route had a `source` field that doesn't exist in the DB — Claude fixed.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 3 (2026-02-21)

You have 1 new task: **C15**. Read `task.md` for full spec. Summary:

- **C15** — Improve the product detail page for the "no variants" case. In `ProductPurchasePanel.tsx`: if NO variants exist, show a WhatsApp enquiry button (`https://wa.me/${NEXT_PUBLIC_WHATSAPP_NUMBER}?text=...`) instead of the size selector. If variants exist but stock is 0, show an out-of-stock message. Add `NEXT_PUBLIC_WHATSAPP_NUMBER` to `.env.example`. Keep all other existing logic unchanged.

**Work order: C15 only.**

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 2 (2026-02-21)

You have 4 new tasks: **C11, C12, C13, C14**. Read `task.md` for full specs. Summary:

- **C11** — Wire Homepage (`src/app/(site)/page.tsx`) to real Supabase data. Fetch is_featured products + collections. Server component. Use `supabaseServer` from `@/lib/supabase`.
- **C12** — Build Collection detail page (`src/app/(site)/collections/[slug]/page.tsx`). Hero + products in that collection. Server component. Use `notFound()` if slug not found.
- **C13** — Replace all `<img>` tags with Next.js `<Image />` across: `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/app/(site)/shop/page.tsx`, `src/app/(site)/collections/page.tsx`, `src/app/(site)/products/[slug]/page.tsx`, `src/app/(site)/cart/page.tsx`. Also check `next.config.js` and add `images.remotePatterns` for any external image domains (Cloudinary, Instagram CDN, etc).
- **C14** — Wire "Notify Me" CTA on collections page. Create `src/app/(site)/collections/_components/NotifyMeButton.tsx` (client component). POST to `/api/waitlist`. **Do C14 last** — it depends on Gemini finishing G13 first.

**Work order: C11 → C12 → C13 → C14**

---

## ⚠ NEW TASKS ASSIGNED — Batch 6 (2026-02-21)

You have 2 new tasks: **C22, C23**. Read `task.md` for full specs. Work order: **C22 → C23**.

**Summary:**
- **C22** — Add CSV upload to `/admin/products/page.tsx`. Parse CSV, insert products/variants/images, show preview, handle errors.
- **C23** — On cart page, detect abandoned cart (>30min), show modal offering recovery link via email/WhatsApp. Call `/api/abandoned-cart/recover`.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C18, C19**. Read `task.md` for full specs. Work order: **C18 → C19**.

**Summary:**
- **C18** — Add international order support to the checkout page. Add a country selector (Nigeria default, plus Ghana, Kenya, South Africa, UK, US, Canada, Other). When non-Nigeria, swap the state dropdown for a text input. Pass `country` to the delivery API and include it in the order's delivery_address JSONB.
- **C19** — Write frontend tests using Vitest + React Testing Library. Test the Zustand cart store (add/remove/update/clear/computed values) and the PaystackButton component (render, disabled state, amount format). Vitest will already be installed by Gemini's G19 task.

**⚠ Important notes:**
- **C19 depends on G19** — Gemini installs vitest and creates the base config. You add `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` and write component/store tests. If vitest isn't installed yet, install it yourself.
- **Checkout page** was rebuilt by Claude with full Paystack integration. Read `src/app/(site)/checkout/page.tsx` carefully before editing — it has: PaystackButton dynamic import, Nigerian states dropdown, delivery option fetch, form validation, and order creation flow.
- **PaystackButton** is at `src/app/(site)/checkout/PaystackButton.tsx` — a client component using `react-paystack`.
- The delivery API now accepts an optional `country` field (G18 adds this). Default to `'Nigeria'` if G18 isn't done yet.

**⚠ Claude audit notes from Batch 3:**
- PostHogPageView needed a `<Suspense>` boundary because `useSearchParams()` triggers dynamic rendering. Claude wrapped it in `<Suspense fallback={null}>` in the site layout. Don't remove this.
- All other C16-C17 work was clean.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C16, C17**. Read `task.md` for full specs. Work order: **C16 → C17**.

**Summary:**
- **C16** — Build Category filter page (`src/app/(site)/shop/[category-slug]/page.tsx`). Server component. Fetch category by slug, then fetch products in that category. Same grid layout as the shop page. Use `notFound()` if slug invalid. Use `supabaseServer`, `Image` from `next/image`.
- **C17** — Set up PostHog analytics. Create `PostHogProvider.tsx` and `PostHogPageView.tsx` in `src/components/`. Add them to `src/app/(site)/layout.tsx`. Track page views + add-to-cart events. Use `posthog-js` (already installed).

**⚠ Claude audit notes from previous batches:**
- Checkout page (C7) was still a placeholder — Claude rebuilt it with full Paystack integration, delivery calculation, cart state, and form validation.
- `collections/[slug]/page.tsx` (C12) had bare `<img>` tags that C13 missed — Claude fixed.
- Several unused imports were cleaned up from admin files.
- The waitlist API route had a `source` field that doesn't exist in the DB — Claude fixed.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 3 (2026-02-21)

You have 1 new task: **C15**. Read `task.md` for full spec. Summary:

- **C15** — Improve the product detail page for the "no variants" case. In `ProductPurchasePanel.tsx`: if NO variants exist, show a WhatsApp enquiry button (`https://wa.me/${NEXT_PUBLIC_WHATSAPP_NUMBER}?text=...`) instead of the size selector. If variants exist but stock is 0, show an out-of-stock message. Add `NEXT_PUBLIC_WHATSAPP_NUMBER` to `.env.example`. Keep all other existing logic unchanged.

**Work order: C15 only.**

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 2 (2026-02-21)

You have 4 new tasks: **C11, C12, C13, C14**. Read `task.md` for full specs. Summary:

- **C11** — Wire Homepage (`src/app/(site)/page.tsx`) to real Supabase data. Fetch is_featured products + collections. Server component. Use `supabaseServer` from `@/lib/supabase`.
- **C12** — Build Collection detail page (`src/app/(site)/collections/[slug]/page.tsx`). Hero + products in that collection. Server component. Use `notFound()` if slug not found.
- **C13** — Replace all `<img>` tags with Next.js `<Image />` across: `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/app/(site)/shop/page.tsx`, `src/app/(site)/collections/page.tsx`, `src/app/(site)/products/[slug]/page.tsx`, `src/app/(site)/cart/page.tsx`. Also check `next.config.js` and add `images.remotePatterns` for any external image domains (Cloudinary, Instagram CDN, etc).
- **C14** — Wire "Notify Me" CTA on collections page. Create `src/app/(site)/collections/_components/NotifyMeButton.tsx` (client component). POST to `/api/waitlist`. **Do C14 last** — it depends on Gemini finishing G13 first.

**Work order: C11 → C12 → C13 → C14**

---

## ⚠ NEW TASKS ASSIGNED — Batch 6 (2026-02-21)

You have 2 new tasks: **C22, C23**. Read `task.md` for full specs. Work order: **C22 → C23**.

**Summary:**
- **C22** — Add CSV upload to `/admin/products/page.tsx`. Parse CSV, insert products/variants/images, show preview, handle errors.
- **C23** — On cart page, detect abandoned cart (>30min), show modal offering recovery link via email/WhatsApp. Call `/api/abandoned-cart/recover`.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C18, C19**. Read `task.md` for full specs. Work order: **C18 → C19**.

**Summary:**
- **C18** — Add international order support to the checkout page. Add a country selector (Nigeria default, plus Ghana, Kenya, South Africa, UK, US, Canada, Other). When non-Nigeria, swap the state dropdown for a text input. Pass `country` to the delivery API and include it in the order's delivery_address JSONB.
- **C19** — Write frontend tests using Vitest + React Testing Library. Test the Zustand cart store (add/remove/update/clear/computed values) and the PaystackButton component (render, disabled state, amount format). Vitest will already be installed by Gemini's G19 task.

**⚠ Important notes:**
- **C19 depends on G19** — Gemini installs vitest and creates the base config. You add `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` and write component/store tests. If vitest isn't installed yet, install it yourself.
- **Checkout page** was rebuilt by Claude with full Paystack integration. Read `src/app/(site)/checkout/page.tsx` carefully before editing — it has: PaystackButton dynamic import, Nigerian states dropdown, delivery option fetch, form validation, and order creation flow.
- **PaystackButton** is at `src/app/(site)/checkout/PaystackButton.tsx` — a client component using `react-paystack`.
- The delivery API now accepts an optional `country` field (G18 adds this). Default to `'Nigeria'` if G18 isn't done yet.

**⚠ Claude audit notes from Batch 3:**
- PostHogPageView needed a `<Suspense>` boundary because `useSearchParams()` triggers dynamic rendering. Claude wrapped it in `<Suspense fallback={null}>` in the site layout. Don't remove this.
- All other C16-C17 work was clean.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C16, C17**. Read `task.md` for full specs. Work order: **C16 → C17**.

**Summary:**
- **C16** — Build Category filter page (`src/app/(site)/shop/[category-slug]/page.tsx`). Server component. Fetch category by slug, then fetch products in that category. Same grid layout as the shop page. Use `notFound()` if slug invalid. Use `supabaseServer`, `Image` from `next/image`.
- **C17** — Set up PostHog analytics. Create `PostHogProvider.tsx` and `PostHogPageView.tsx` in `src/components/`. Add them to `src/app/(site)/layout.tsx`. Track page views + add-to-cart events. Use `posthog-js` (already installed).

**⚠ Claude audit notes from previous batches:**
- Checkout page (C7) was still a placeholder — Claude rebuilt it with full Paystack integration, delivery calculation, cart state, and form validation.
- `collections/[slug]/page.tsx` (C12) had bare `<img>` tags that C13 missed — Claude fixed.
- Several unused imports were cleaned up from admin files.
- The waitlist API route had a `source` field that doesn't exist in the DB — Claude fixed.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 3 (2026-02-21)

You have 1 new task: **C15**. Read `task.md` for full spec. Summary:

- **C15** — Improve the product detail page for the "no variants" case. In `ProductPurchasePanel.tsx`: if NO variants exist, show a WhatsApp enquiry button (`https://wa.me/${NEXT_PUBLIC_WHATSAPP_NUMBER}?text=...`) instead of the size selector. If variants exist but stock is 0, show an out-of-stock message. Add `NEXT_PUBLIC_WHATSAPP_NUMBER` to `.env.example`. Keep all other existing logic unchanged.

**Work order: C15 only.**

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 2 (2026-02-21)

You have 4 new tasks: **C11, C12, C13, C14**. Read `task.md` for full specs. Summary:

- **C11** — Wire Homepage (`src/app/(site)/page.tsx`) to real Supabase data. Fetch is_featured products + collections. Server component. Use `supabaseServer` from `@/lib/supabase`.
- **C12** — Build Collection detail page (`src/app/(site)/collections/[slug]/page.tsx`). Hero + products in that collection. Server component. Use `notFound()` if slug not found.
- **C13** — Replace all `<img>` tags with Next.js `<Image />` across: `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/app/(site)/shop/page.tsx`, `src/app/(site)/collections/page.tsx`, `src/app/(site)/products/[slug]/page.tsx`, `src/app/(site)/cart/page.tsx`. Also check `next.config.js` and add `images.remotePatterns` for any external image domains (Cloudinary, Instagram CDN, etc).
- **C14** — Wire "Notify Me" CTA on collections page. Create `src/app/(site)/collections/_components/NotifyMeButton.tsx` (client component). POST to `/api/waitlist`. **Do C14 last** — it depends on Gemini finishing G13 first.

**Work order: C11 → C12 → C13 → C14**

---

## ⚠ NEW TASKS ASSIGNED — Batch 6 (2026-02-21)

You have 2 new tasks: **C22, C23**. Read `task.md` for full specs. Work order: **C22 → C23**.

**Summary:**
- **C22** — Add CSV upload to `/admin/products/page.tsx`. Parse CSV, insert products/variants/images, show preview, handle errors.
- **C23** — On cart page, detect abandoned cart (>30min), show modal offering recovery link via email/WhatsApp. Call `/api/abandoned-cart/recover`.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C18, C19**. Read `task.md` for full specs. Work order: **C18 → C19**.

**Summary:**
- **C18** — Add international order support to the checkout page. Add a country selector (Nigeria default, plus Ghana, Kenya, South Africa, UK, US, Canada, Other). When non-Nigeria, swap the state dropdown for a text input. Pass `country` to the delivery API and include it in the order's delivery_address JSONB.
- **C19** — Write frontend tests using Vitest + React Testing Library. Test the Zustand cart store (add/remove/update/clear/computed values) and the PaystackButton component (render, disabled state, amount format). Vitest will already be installed by Gemini's G19 task.

**⚠ Important notes:**
- **C19 depends on G19** — Gemini installs vitest and creates the base config. You add `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` and write component/store tests. If vitest isn't installed yet, install it yourself.
- **Checkout page** was rebuilt by Claude with full Paystack integration. Read `src/app/(site)/checkout/page.tsx` carefully before editing — it has: PaystackButton dynamic import, Nigerian states dropdown, delivery option fetch, form validation, and order creation flow.
- **PaystackButton** is at `src/app/(site)/checkout/PaystackButton.tsx` — a client component using `react-paystack`.
- The delivery API now accepts an optional `country` field (G18 adds this). Default to `'Nigeria'` if G18 isn't done yet.

**⚠ Claude audit notes from Batch 3:**
- PostHogPageView needed a `<Suspense>` boundary because `useSearchParams()` triggers dynamic rendering. Claude wrapped it in `<Suspense fallback={null}>` in the site layout. Don't remove this.
- All other C16-C17 work was clean.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C16, C17**. Read `task.md` for full specs. Work order: **C16 → C17**.

**Summary:**
- **C16** — Build Category filter page (`src/app/(site)/shop/[category-slug]/page.tsx`). Server component. Fetch category by slug, then fetch products in that category. Same grid layout as the shop page. Use `notFound()` if slug invalid. Use `supabaseServer`, `Image` from `next/image`.
- **C17** — Set up PostHog analytics. Create `PostHogProvider.tsx` and `PostHogPageView.tsx` in `src/components/`. Add them to `src/app/(site)/layout.tsx`. Track page views + add-to-cart events. Use `posthog-js` (already installed).

**⚠ Claude audit notes from previous batches:**
- Checkout page (C7) was still a placeholder — Claude rebuilt it with full Paystack integration, delivery calculation, cart state, and form validation.
- `collections/[slug]/page.tsx` (C12) had bare `<img>` tags that C13 missed — Claude fixed.
- Several unused imports were cleaned up from admin files.
- The waitlist API route had a `source` field that doesn't exist in the DB — Claude fixed.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 3 (2026-02-21)

You have 1 new task: **C15**. Read `task.md` for full spec. Summary:

- **C15** — Improve the product detail page for the "no variants" case. In `ProductPurchasePanel.tsx`: if NO variants exist, show a WhatsApp enquiry button (`https://wa.me/${NEXT_PUBLIC_WHATSAPP_NUMBER}?text=...`) instead of the size selector. If variants exist but stock is 0, show an out-of-stock message. Add `NEXT_PUBLIC_WHATSAPP_NUMBER` to `.env.example`. Keep all other existing logic unchanged.

**Work order: C15 only.**

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 2 (2026-02-21)

You have 4 new tasks: **C11, C12, C13, C14**. Read `task.md` for full specs. Summary:

- **C11** — Wire Homepage (`src/app/(site)/page.tsx`) to real Supabase data. Fetch is_featured products + collections. Server component. Use `supabaseServer` from `@/lib/supabase`.
- **C12** — Build Collection detail page (`src/app/(site)/collections/[slug]/page.tsx`). Hero + products in that collection. Server component. Use `notFound()` if slug not found.
- **C13** — Replace all `<img>` tags with Next.js `<Image />` across: `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/app/(site)/shop/page.tsx`, `src/app/(site)/collections/page.tsx`, `src/app/(site)/products/[slug]/page.tsx`, `src/app/(site)/cart/page.tsx`. Also check `next.config.js` and add `images.remotePatterns` for any external image domains (Cloudinary, Instagram CDN, etc).
- **C14** — Wire "Notify Me" CTA on collections page. Create `src/app/(site)/collections/_components/NotifyMeButton.tsx` (client component). POST to `/api/waitlist`. **Do C14 last** — it depends on Gemini finishing G13 first.

**Work order: C11 → C12 → C13 → C14**

---

## ⚠ NEW TASKS ASSIGNED — Batch 6 (2026-02-21)

You have 2 new tasks: **C22, C23**. Read `task.md` for full specs. Work order: **C22 → C23**.

**Summary:**
- **C22** — Add CSV upload to `/admin/products/page.tsx`. Parse CSV, insert products/variants/images, show preview, handle errors.
- **C23** — On cart page, detect abandoned cart (>30min), show modal offering recovery link via email/WhatsApp. Call `/api/abandoned-cart/recover`.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C18, C19**. Read `task.md` for full specs. Work order: **C18 → C19**.

**Summary:**
- **C18** — Add international order support to the checkout page. Add a country selector (Nigeria default, plus Ghana, Kenya, South Africa, UK, US, Canada, Other). When non-Nigeria, swap the state dropdown for a text input. Pass `country` to the delivery API and include it in the order's delivery_address JSONB.
- **C19** — Write frontend tests using Vitest + React Testing Library. Test the Zustand cart store (add/remove/update/clear/computed values) and the PaystackButton component (render, disabled state, amount format). Vitest will already be installed by Gemini's G19 task.

**⚠ Important notes:**
- **C19 depends on G19** — Gemini installs vitest and creates the base config. You add `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` and write component/store tests. If vitest isn't installed yet, install it yourself.
- **Checkout page** was rebuilt by Claude with full Paystack integration. Read `src/app/(site)/checkout/page.tsx` carefully before editing — it has: PaystackButton dynamic import, Nigerian states dropdown, delivery option fetch, form validation, and order creation flow.
- **PaystackButton** is at `src/app/(site)/checkout/PaystackButton.tsx` — a client component using `react-paystack`.
- The delivery API now accepts an optional `country` field (G18 adds this). Default to `'Nigeria'` if G18 isn't done yet.

**⚠ Claude audit notes from Batch 3:**
- PostHogPageView needed a `<Suspense>` boundary because `useSearchParams()` triggers dynamic rendering. Claude wrapped it in `<Suspense fallback={null}>` in the site layout. Don't remove this.
- All other C16-C17 work was clean.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C16, C17**. Read `task.md` for full specs. Work order: **C16 → C17**.

**Summary:**
- **C16** — Build Category filter page (`src/app/(site)/shop/[category-slug]/page.tsx`). Server component. Fetch category by slug, then fetch products in that category. Same grid layout as the shop page. Use `notFound()` if slug invalid. Use `supabaseServer`, `Image` from `next/image`.
- **C17** — Set up PostHog analytics. Create `PostHogProvider.tsx` and `PostHogPageView.tsx` in `src/components/`. Add them to `src/app/(site)/layout.tsx`. Track page views + add-to-cart events. Use `posthog-js` (already installed).

**⚠ Claude audit notes from previous batches:**
- Checkout page (C7) was still a placeholder — Claude rebuilt it with full Paystack integration, delivery calculation, cart state, and form validation.
- `collections/[slug]/page.tsx` (C12) had bare `<img>` tags that C13 missed — Claude fixed.
- Several unused imports were cleaned up from admin files.
- The waitlist API route had a `source` field that doesn't exist in the DB — Claude fixed.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 3 (2026-02-21)

You have 1 new task: **C15**. Read `task.md` for full spec. Summary:

- **C15** — Improve the product detail page for the "no variants" case. In `ProductPurchasePanel.tsx`: if NO variants exist, show a WhatsApp enquiry button (`https://wa.me/${NEXT_PUBLIC_WHATSAPP_NUMBER}?text=...`) instead of the size selector. If variants exist but stock is 0, show an out-of-stock message. Add `NEXT_PUBLIC_WHATSAPP_NUMBER` to `.env.example`. Keep all other existing logic unchanged.

**Work order: C15 only.**

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 2 (2026-02-21)

You have 4 new tasks: **C11, C12, C13, C14**. Read `task.md` for full specs. Summary:

- **C11** — Wire Homepage (`src/app/(site)/page.tsx`) to real Supabase data. Fetch is_featured products + collections. Server component. Use `supabaseServer` from `@/lib/supabase`.
- **C12** — Build Collection detail page (`src/app/(site)/collections/[slug]/page.tsx`). Hero + products in that collection. Server component. Use `notFound()` if slug not found.
- **C13** — Replace all `<img>` tags with Next.js `<Image />` across: `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/app/(site)/shop/page.tsx`, `src/app/(site)/collections/page.tsx`, `src/app/(site)/products/[slug]/page.tsx`, `src/app/(site)/cart/page.tsx`. Also check `next.config.js` and add `images.remotePatterns` for any external image domains (Cloudinary, Instagram CDN, etc).
- **C14** — Wire "Notify Me" CTA on collections page. Create `src/app/(site)/collections/_components/NotifyMeButton.tsx` (client component). POST to `/api/waitlist`. **Do C14 last** — it depends on Gemini finishing G13 first.

**Work order: C11 → C12 → C13 → C14**

---

## ⚠ NEW TASKS ASSIGNED — Batch 6 (2026-02-21)

You have 2 new tasks: **C22, C23**. Read `task.md` for full specs. Work order: **C22 → C23**.

**Summary:**
- **C22** — Add CSV upload to `/admin/products/page.tsx`. Parse CSV, insert products/variants/images, show preview, handle errors.
- **C23** — On cart page, detect abandoned cart (>30min), show modal offering recovery link via email/WhatsApp. Call `/api/abandoned-cart/recover`.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C18, C19**. Read `task.md` for full specs. Work order: **C18 → C19**.

**Summary:**
- **C18** — Add international order support to the checkout page. Add a country selector (Nigeria default, plus Ghana, Kenya, South Africa, UK, US, Canada, Other). When non-Nigeria, swap the state dropdown for a text input. Pass `country` to the delivery API and include it in the order's delivery_address JSONB.
- **C19** — Write frontend tests using Vitest + React Testing Library. Test the Zustand cart store (add/remove/update/clear/computed values) and the PaystackButton component (render, disabled state, amount format). Vitest will already be installed by Gemini's G19 task.

**⚠ Important notes:**
- **C19 depends on G19** — Gemini installs vitest and creates the base config. You add `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` and write component/store tests. If vitest isn't installed yet, install it yourself.
- **Checkout page** was rebuilt by Claude with full Paystack integration. Read `src/app/(site)/checkout/page.tsx` carefully before editing — it has: PaystackButton dynamic import, Nigerian states dropdown, delivery option fetch, form validation, and order creation flow.
- **PaystackButton** is at `src/app/(site)/checkout/PaystackButton.tsx` — a client component using `react-paystack`.
- The delivery API now accepts an optional `country` field (G18 adds this). Default to `'Nigeria'` if G18 isn't done yet.

**⚠ Claude audit notes from Batch 3:**
- PostHogPageView needed a `<Suspense>` boundary because `useSearchParams()` triggers dynamic rendering. Claude wrapped it in `<Suspense fallback={null}>` in the site layout. Don't remove this.
- All other C16-C17 work was clean.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C16, C17**. Read `task.md` for full specs. Work order: **C16 → C17**.

**Summary:**
- **C16** — Build Category filter page (`src/app/(site)/shop/[category-slug]/page.tsx`). Server component. Fetch category by slug, then fetch products in that category. Same grid layout as the shop page. Use `notFound()` if slug invalid. Use `supabaseServer`, `Image` from `next/image`.
- **C17** — Set up PostHog analytics. Create `PostHogProvider.tsx` and `PostHogPageView.tsx` in `src/components/`. Add them to `src/app/(site)/layout.tsx`. Track page views + add-to-cart events. Use `posthog-js` (already installed).

**⚠ Claude audit notes from previous batches:**
- Checkout page (C7) was still a placeholder — Claude rebuilt it with full Paystack integration, delivery calculation, cart state, and form validation.
- `collections/[slug]/page.tsx` (C12) had bare `<img>` tags that C13 missed — Claude fixed.
- Several unused imports were cleaned up from admin files.
- The waitlist API route had a `source` field that doesn't exist in the DB — Claude fixed.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 3 (2026-02-21)

You have 1 new task: **C15**. Read `task.md` for full spec. Summary:

- **C15** — Improve the product detail page for the "no variants" case. In `ProductPurchasePanel.tsx`: if NO variants exist, show a WhatsApp enquiry button (`https://wa.me/${NEXT_PUBLIC_WHATSAPP_NUMBER}?text=...`) instead of the size selector. If variants exist but stock is 0, show an out-of-stock message. Add `NEXT_PUBLIC_WHATSAPP_NUMBER` to `.env.example`. Keep all other existing logic unchanged.

**Work order: C15 only.**

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 2 (2026-02-21)

You have 4 new tasks: **C11, C12, C13, C14**. Read `task.md` for full specs. Summary:

- **C11** — Wire Homepage (`src/app/(site)/page.tsx`) to real Supabase data. Fetch is_featured products + collections. Server component. Use `supabaseServer` from `@/lib/supabase`.
- **C12** — Build Collection detail page (`src/app/(site)/collections/[slug]/page.tsx`). Hero + products in that collection. Server component. Use `notFound()` if slug not found.
- **C13** — Replace all `<img>` tags with Next.js `<Image />` across: `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/app/(site)/shop/page.tsx`, `src/app/(site)/collections/page.tsx`, `src/app/(site)/products/[slug]/page.tsx`, `src/app/(site)/cart/page.tsx`. Also check `next.config.js` and add `images.remotePatterns` for any external image domains (Cloudinary, Instagram CDN, etc).
- **C14** — Wire "Notify Me" CTA on collections page. Create `src/app/(site)/collections/_components/NotifyMeButton.tsx` (client component). POST to `/api/waitlist`. **Do C14 last** — it depends on Gemini finishing G13 first.

**Work order: C11 → C12 → C13 → C14**

---

## ⚠ NEW TASKS ASSIGNED — Batch 6 (2026-02-21)

You have 2 new tasks: **C22, C23**. Read `task.md` for full specs. Work order: **C22 → C23**.

**Summary:**
- **C22** — Add CSV upload to `/admin/products/page.tsx`. Parse CSV, insert products/variants/images, show preview, handle errors.
- **C23** — On cart page, detect abandoned cart (>30min), show modal offering recovery link via email/WhatsApp. Call `/api/abandoned-cart/recover`.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C18, C19**. Read `task.md` for full specs. Work order: **C18 → C19**.

**Summary:**
- **C18** — Add international order support to the checkout page. Add a country selector (Nigeria default, plus Ghana, Kenya, South Africa, UK, US, Canada, Other). When non-Nigeria, swap the state dropdown for a text input. Pass `country` to the delivery API and include it in the order's delivery_address JSONB.
- **C19** — Write frontend tests using Vitest + React Testing Library. Test the Zustand cart store (add/remove/update/clear/computed values) and the PaystackButton component (render, disabled state, amount format). Vitest will already be installed by Gemini's G19 task.

**⚠ Important notes:**
- **C19 depends on G19** — Gemini installs vitest and creates the base config. You add `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` and write component/store tests. If vitest isn't installed yet, install it yourself.
- **Checkout page** was rebuilt by Claude with full Paystack integration. Read `src/app/(site)/checkout/page.tsx` carefully before editing — it has: PaystackButton dynamic import, Nigerian states dropdown, delivery option fetch, form validation, and order creation flow.
- **PaystackButton** is at `src/app/(site)/checkout/PaystackButton.tsx` — a client component using `react-paystack`.
- The delivery API now accepts an optional `country` field (G18 adds this). Default to `'Nigeria'` if G18 isn't done yet.

**⚠ Claude audit notes from Batch 3:**
- PostHogPageView needed a `<Suspense>` boundary because `useSearchParams()` triggers dynamic rendering. Claude wrapped it in `<Suspense fallback={null}>` in the site layout. Don't remove this.
- All other C16-C17 work was clean.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C16, C17**. Read `task.md` for full specs. Work order: **C16 → C17**.

**Summary:**
- **C16** — Build Category filter page (`src/app/(site)/shop/[category-slug]/page.tsx`). Server component. Fetch category by slug, then fetch products in that category. Same grid layout as the shop page. Use `notFound()` if slug invalid. Use `supabaseServer`, `Image` from `next/image`.
- **C17** — Set up PostHog analytics. Create `PostHogProvider.tsx` and `PostHogPageView.tsx` in `src/components/`. Add them to `src/app/(site)/layout.tsx`. Track page views + add-to-cart events. Use `posthog-js` (already installed).

**⚠ Claude audit notes from previous batches:**
- Checkout page (C7) was still a placeholder — Claude rebuilt it with full Paystack integration, delivery calculation, cart state, and form validation.
- `collections/[slug]/page.tsx` (C12) had bare `<img>` tags that C13 missed — Claude fixed.
- Several unused imports were cleaned up from admin files.
- The waitlist API route had a `source` field that doesn't exist in the DB — Claude fixed.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 3 (2026-02-21)

You have 1 new task: **C15**. Read `task.md` for full spec. Summary:

- **C15** — Improve the product detail page for the "no variants" case. In `ProductPurchasePanel.tsx`: if NO variants exist, show a WhatsApp enquiry button (`https://wa.me/${NEXT_PUBLIC_WHATSAPP_NUMBER}?text=...`) instead of the size selector. If variants exist but stock is 0, show an out-of-stock message. Add `NEXT_PUBLIC_WHATSAPP_NUMBER` to `.env.example`. Keep all other existing logic unchanged.

**Work order: C15 only.**

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 2 (2026-02-21)

You have 4 new tasks: **C11, C12, C13, C14**. Read `task.md` for full specs. Summary:

- **C11** — Wire Homepage (`src/app/(site)/page.tsx`) to real Supabase data. Fetch is_featured products + collections. Server component. Use `supabaseServer` from `@/lib/supabase`.
- **C12** — Build Collection detail page (`src/app/(site)/collections/[slug]/page.tsx`). Hero + products in that collection. Server component. Use `notFound()` if slug not found.
- **C13** — Replace all `<img>` tags with Next.js `<Image />` across: `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/app/(site)/shop/page.tsx`, `src/app/(site)/collections/page.tsx`, `src/app/(site)/products/[slug]/page.tsx`, `src/app/(site)/cart/page.tsx`. Also check `next.config.js` and add `images.remotePatterns` for any external image domains (Cloudinary, Instagram CDN, etc).
- **C14** — Wire "Notify Me" CTA on collections page. Create `src/app/(site)/collections/_components/NotifyMeButton.tsx` (client component). POST to `/api/waitlist`. **Do C14 last** — it depends on Gemini finishing G13 first.

**Work order: C11 → C12 → C13 → C14**

---

## ⚠ NEW TASKS ASSIGNED — Batch 6 (2026-02-21)

You have 2 new tasks: **C22, C23**. Read `task.md` for full specs. Work order: **C22 → C23**.

**Summary:**
- **C22** — Add CSV upload to `/admin/products/page.tsx`. Parse CSV, insert products/variants/images, show preview, handle errors.
- **C23** — On cart page, detect abandoned cart (>30min), show modal offering recovery link via email/WhatsApp. Call `/api/abandoned-cart/recover`.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 4 (2026-02-21)

You have 2 new tasks: **C18, C19**. Read `task.md` for full specs. Work order: **C18 → C19**.

**Summary:**
- **C18** — Add international order support to the checkout page. Add a country selector (Nigeria default, plus Ghana, Kenya, South Africa, UK, US, Canada, Other). When non-Nigeria, swap the state dropdown for a text input. Pass `country` to the delivery API and include it in the order's delivery_address JSONB.
- **C19** — Write frontend tests using Vitest + React Testing Library. Test the Zustand cart store (add/remove/update/clear/computed values) and the PaystackButton component (render, disabled state, amount format). Vitest will already be installed by Gemini's G19 task.

**⚠ Important notes:**
- **C19 depends on G19** — Gemini installs vitest and creates the base config. You add `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
