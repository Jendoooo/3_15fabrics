# GEMINI.md — Gemini Agent Workspace

**This file belongs to Gemini.**
- Gemini reads AND writes this file
- Other agents (Claude, Codex) read this file but do NOT edit it
- Always append to the Progress Log when completing work

---

## Your Role

You are a **coding agent** for the iby_closet project. You implement assigned tasks from `task.md`.

**Before starting any session:**
1. Read `CLAUDE.md` — full project brief, stack, file structure, DB schema
2. Read `task.md` — find tasks assigned to GEMINI, pick up the first incomplete one
3. Read this file — see what you've done before and any blockers

**After completing a task:**
1. Mark it done in `task.md` — change `[ ]` to `[x]`, append `| Done: YYYY-MM-DD HH:MM`
2. Log what you did in the Progress Log below

---

## Project Context Quick Reference

- **Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase, Paystack, Resend, Fonnte, Cloudinary, PostHog, Upstash Redis
- **DB:** Supabase — see migration at `supabase/migrations/20240221000000_initial_schema.sql`
- **Components:** `src/components/` (Header, Footer)
- **Pages:** `src/app/` (shop, collections, products/[slug], cart, checkout, track)
- **Order format:** `IBY-YYYYXXXX`
- **Full brief:** `CLAUDE.md`
- **All tasks:** `task.md`

---

## Coding Standards

- TypeScript strict — no `any` types
- Tailwind only for styling — no inline styles, no CSS modules
- Server Components by default; add `'use client'` only when needed (event handlers, hooks, browser APIs)
- All Supabase queries go through `src/lib/supabase.ts` client
- API routes in `src/app/api/` using Next.js Route Handlers
- Environment variables must exist in `.env.example` — never hardcode secrets
- Mobile-first — test layouts at 375px width first
- **⚠ CRITICAL:** `export const dynamic = 'force-dynamic'` must ALWAYS be placed AFTER all import statements — never between them. This has caused ESLint build failures multiple times (G16, G32, G35). In Next.js App Router, all `import` declarations must come first, then exports and code.

---

## Progress Log

- [2026-02-21 04:44] Initialized Next.js 14 App Router project (TypeScript, Tailwind CSS). Installed core dependencies: @supabase/supabase-js, react-paystack, resend, cloudinary, posthog-js, @upstash/redis, lucide-react, date-fns. Created Supabase schema migration (`supabase/migrations/20240221000000_initial_schema.sql`) with tables: contacts, categories, collections, products, product_images, product_variants, customers, addresses, orders, order_items, delivery_tracking, waitlist, abandoned_carts.
- [2026-02-21 05:15] Scaffolded base UI pages: `src/app/shop/page.tsx`, `src/app/collections/page.tsx`, `src/app/products/[slug]/page.tsx`, `src/app/cart/page.tsx`, `src/app/checkout/page.tsx`, `src/app/checkout/success/page.tsx`, `src/app/track/page.tsx`. Created `src/components/Header.tsx` (sticky nav) and `src/components/Footer.tsx` (links + waitlist form).
- [2026-02-21 05:18] Added agent tracking files. Integrated logo images.
- [2026-02-21 05:40] Read `CLAUDE.md` and `task.md` and completed all Gemini tasks (G1-G8): Set up `.env.example`, created typed Supabase client in `src/lib/supabase.ts`, defined db types in `src/lib/types.ts`. Built backend API endpoints for: contacts (`POST /api/contacts`), order creation (`POST /api/orders`), public order tracking (`GET /api/orders/[orderNumber]`), Paystack webhook (`POST /api/paystack/webhook`), and delivery calculation (`POST /api/delivery/calculate`). Marked tasks done in `task.md`.
- [2026-02-21 06:19] Completed Tasks G9-G12. Built Admin Collections CRUD pages and forms. Built Admin Contacts view with bulk CSV export and Fonnte WhatsApp broadcast functionality. Built Admin Manual Order Entry screen with real-time product search and variant handling. Built mobile-friendly Admin Quick Sale POS screen for walk-ins. Marked all 4 tasks as completed in `task.md` and fixed related backend schema generic TS types.
- [2026-02-21 07:01] Processed raw Instagram HTML dumps to extract real product names, prices, descriptions, and high-resolution images. Downloaded 34 unique product images locally to `public/images/instagram` and wrote a Node.js script to automatically seed these products into the Supabase `products` and `product_images` tables. This ensures the frontend will have access strictly to genuine app data rather than placeholders.
- [2026-02-21 07:17] Debugged Shop page crash caused by React Hydration Mismatch related to `toLocaleString` formatting. Replaced with manual numeric string parsing. Also debugged and restored Next.js global Tailwind styling which stripped CSS components due to conflicting `prefers-color-scheme: dark` variables.
- [2026-02-21 08:30] Completed tasks G13-G15. Built the `POST /api/waitlist` route to capture email and WhatsApp signups. Created and executed `scripts/seed_collection_and_variants.js` to seed the "Rhythm & Thread" collection, link all active products, and automatically generate shoe/shirt/hat sizes and stock quantities. Built a custom cookie-based authentication system for the admin panel using Next.js Middleware (`src/middleware.ts`), completely replacing the client-side Supabase auth checks. Added safe logout routing. Marked all tasks completed in `task.md`.
- [2026-02-21 08:24] Handled Task G16 by implementing Upstash Redis connection (`src/lib/redis.ts`) and global cache helper (`src/lib/cache.ts`). Automatically fetched, mapped and injected cached products, collections and images straight into `shop/page.tsx` and `page.tsx` frontend views with explicit TTL configuration.
- [2026-02-21 08:26] Handled Task G17 by importing the Resend email service mapping (`src/lib/email.ts`) and formatting dynamic HTML receipt emails that automatically fire synchronously upon checkout creation (`POST /api/orders`) and asynchronous webhooks updates via Paystack payloads (`POST /api/paystack/webhook`).
- [2026-02-21 08:42] Handled Task G18 by updating the `api/delivery/calculate` route to respond to varied country conditions and supply default international DHL delivery options where relevant. Handled Task G19 by installing Vitest, creating a robust custom chainable Supabase mock layer within an isolated `setup.ts` test configurator, and writing validation assertions targeting parameter validation within the delivery calculation route and the database insert validations mapped globally via tests across `POST /api/orders`.
- [2026-02-21 09:27] Handled Batch 5 tasks G20 and G21. Added a responsive full-screen mobile menu layer inside `Header.tsx` which integrates smooth scroll-locking and uses native icons. Built a reusable `<ProductCard>` element holding localized rendering structures and hover animations, and then purged repetitive inline grid loops across the four shop/collection directories (replacing them with the robust core component).
- [2026-02-21 09:37] Handled Batch 6 tasks G22 and G23. Upgraded the `/admin/orders/page.tsx` with a dynamic real-time client-side search overlay to index through arrays containing `order_number` or `customer_name` variables alongside the previously existing category and status selection filters. Engineered the backend `POST /api/abandoned-cart/recover` route combining email (Resend) and HTTP webhook (Fonnte API for WhatsApp) multi-channel configurations structured directly into Supabase database inserts.
- [2026-02-21 10:11] Ad-hoc debugging: Fixed serious React Hydration Mismatch issues occurring across `src/components/Header.tsx`, `src/app/(site)/cart/page.tsx` and `ProductPurchasePanel.tsx`. The mismatches were caused by direct synchronous server-side rendering of client-persisted Zustand properties (`useCartStore`). This effectively detached the React Event Listeners on mount, preventing the "Add to Cart" button from firing. Added mounted checks (`useEffect`) to delay rendering cart properties to the client phase, securing interactions for the 'test-checkout-tee'.
- [2026-02-21 10:45] Handled Batch 7 tasks G24, G25, and G26. Added Next.js `generateMetadata` exports mapped to cached Supabase reads across `products/[slug]/page.tsx`, `collections/[slug]/page.tsx`, and the root `layout.tsx` for dynamic SEO. Handled order inventory decrements directly inside the checkout `POST /api/orders` flow safely avoiding transactional rollbacks on 0 stock. Lastly, developed the `GET /api/admin/stats` proxy utilizing parallel data aggregation fetches, secured strictly behind the `iby_admin_session` cookie pattern targeting Codex's dashboard tasks.
- [2026-02-21 11:15] Handled Batch 8 tasks G27 and G28. Engineered the core Cloudinary bulk asset uploader routing at `POST /api/upload/image` enforcing strict Node.js upload streaming and `multipart/form-data` conversion via Buffer formats inside restricted sizes, securing straight to Cloudinary instances securely via environmental mappings. Engineered and implemented dynamic backend caching invalidation handlers at `src/lib/invalidate-cache.ts` that safely hooks into fresh `PATCH` & `DELETE` product + collection modification webhooks utilizing Next.js layout `revalidatePath` and `redis.del` patterns. Generated Next.js implicit `robots.ts` config.
- [2026-02-21 12:15] Completed Batch 9 frontend tasks (G29-G33). Integrated Framer Motion for scroll/hover animations across homepage, shop, and product lists (G29). Conducted a full copy audit to replace placeholder defaults with the brand's intended voice and functional contact links (G30). Implemented sleek, editorial black empty-state fallbacks for products and lookbooks lacking imagery (G31). Elevated the Homepage with a gradient hero override, a brand pillar marquee strip, and an Instagram CTA section (G32). Finally, restructured the global Footer into an elegant modern 3-column + isolated newsletter row layout wielding proper internal routing and external Lucide social icons (G33).
- [2026-02-22 04:15] Completed Batch 10 tasks (G34, G35). Upgraded the homepage hero to a full-bleed campaign photo and replaced structural gradients. Inserted a new static horizontal lookbook teaser scroll strip and a founder quote block. Injected dynamic fallback mapping to safely render static local images on product and collection cards across both the Homepage and Collections index when database imagery is missing, effectively removing all plain-text black box fallbacks.
- [2026-02-22 04:30] Completed Batch 11 task G36. Replaced the static multi-image list on the product detail page with an interactive `ProductImageGallery.tsx` client component that wields an active preview and clickable thumbnail row. Rectified Next.js top-level import ordering bugs throwing ESLint violations in `src/app/(site)/products/[slug]/page.tsx`.
- [2026-02-22 04:47] Completed Batch 12 task G37. Extracted the lookbook scroll strip into a dedicated client component (`LookbookStrip.tsx`) featuring native scrollBy method buttons for seamless desktop navigation. Shifted the homepage hero image's focal point dynamically via `object-[center_25%]`. Lastly, enforced standard portrait-anchoring via `object-top` utilities across featured collection cards located on both the homepage and collections index.
- [2026-02-22 04:56] Completed Batch 13 tasks (G38, G39, G40). Added an intelligent "You May Also Like" cross-sell strip rendering `<ProductCard>` dynamically on the product page. Refactored the Collection detail page into a sleek single full-bleed hero format applying fallback mechanisms safely. Implemented a globally available fixed `<BackToTop>` scroll button encapsulated cleanly inside `layout.tsx`.

## ⚠ NEW TASKS — Batch 13 (2026-02-22)

You have 3 new tasks: **G38, G39, G40**. Read `task.md` for full specs. Work order: **G38 → G39 → G40**.

**Summary:**
- **G38** — Related products strip on product detail page. Below the accordions, show up to 4 other active products from the same collection (or random active products if no collection match). Each as a `<ProductCard>`. Fetched server-side in `products/[slug]/page.tsx`.
- **G39** — Collection detail page hero upgrade. If a cover image exists, show it full-bleed with gradient scrim + collection name overlaid. If no cover image, use `COLLECTION_FALLBACK` map (`rhythm-and-thread → post_22, back-in-the-90s → post_24, default → post_20`). Add release date badge and description below the name in the hero. File: `src/app/(site)/collections/[slug]/page.tsx`.
- **G40** — "Back to top" floating button. `src/components/BackToTop.tsx` (`'use client'`). Fixed position `bottom-6 right-6`, circle, bg-black text-white, ChevronUp icon from lucide-react. Appears only when user has scrolled >400px (`useEffect` + `window.addEventListener('scroll', ...)`). Smooth scroll to top on click. Add to `src/app/(site)/layout.tsx`.

**Context:**
- `ProductCard` is at `src/components/ProductCard.tsx` — import and use it
- The `COLLECTION_FALLBACK` map is the same pattern used in `page.tsx` — copy it
- `collections/[slug]/page.tsx` already has `supabaseServer` and collection data — extend it
- `(site)/layout.tsx` already imports Header, Footer, PostHogProvider — add `<BackToTop />` before `</body>`
- After all 3 tasks, append to `GEMINI_DETAILED.md`

---

## ⚠ NEW TASK — Batch 12 (2026-02-22)

You have 1 new task: **G37**. Read `task.md` for full spec.

**Summary:** Three UI polish fixes — hero image crop on desktop, lookbook carousel arrows for desktop, collection card image top-anchoring. All in `src/app/(site)/page.tsx`, `src/app/(site)/collections/page.tsx`, and a new client component.

---

## ⚠ NEW TASK — Batch 11 (2026-02-22)

You have 1 new task: **G36**. Read `task.md` for full spec.

**Summary:** Build `ProductImageGallery.tsx` (`'use client'`) for the product detail page. Clicking thumbnails changes the large displayed image. Replace the current static image block in `products/[slug]/page.tsx` with this component. Also fix the `export const dynamic` import-order bug in that file.

**Key implementation notes:**
- `useState` for `selectedIndex: number` (default 0)
- Selected thumbnail: `ring-2 ring-black ring-offset-1`, others: `opacity-60 hover:opacity-100`
- Only render thumbnail strip if `images.length > 1`
- Empty fallback: centred `productName` white text on `bg-neutral-900`
- `export const dynamic` in `products/[slug]/page.tsx` is between imports — move after all imports

---

## ⚠ NEW TASKS — Batch 10 (2026-02-22)

You have 2 new tasks: **G34, G35**. Read `task.md` for full specs. Work order: **G34 → G35**.

**Summary:**
- **G34** — Homepage (`src/app/(site)/page.tsx` + `src/app/globals.css`): Replace the gradient hero with a full-bleed photo (`/images/instagram/post_16.jpg`), add local image fallbacks for products and collections, add a horizontally-scrollable lookbook teaser strip (5 photos), add a brand teaser block (`product_100.jpg` + founder quote). Keep the editorial pillar strip added by G32.
- **G35** — Collections index (`src/app/(site)/collections/page.tsx`): Add `COLLECTION_FALLBACK` map and always render an `<Image>` on collection cards (never a text placeholder).

**Critical image list — only use filenames that exist:**
- Editorial: `post_0, post_1, post_4, post_5, post_7, post_8, post_10, post_12, post_14, post_16, post_18, post_19, post_20, post_22, post_24` (all `.jpg`)
- Product: `product_100–107, product_114, product_117, product_119, product_121–130, product_132, product_133` (all `.jpg`)
- DO NOT reference: product_108–113, 115, 116, 118, 120, 131 (files don't exist — 404s)
- All paths: `/images/instagram/[filename]` — no remotePatterns changes needed

**Key constraints for G34:**
- `products.map((product, i) => ...)` — must add index `i` for fallback array
- For `fill` prop: parent must have `position: relative` + `overflow-hidden` — the existing parents already do
- `scrollbar-hide` class goes in `globals.css` inside `@layer utilities`
- `FadeIn`, `Image`, `Link` are all already imported in `page.tsx`
- Do NOT undo the trust badges / pillar strip from G32

---

## ⚡ Load Redistribution Notice — Read This

Claude has redistributed work so Gemini carries ~70% of remaining tasks. Codex is finishing C27 (image upload UI) and C28 (shop filter) only. Gemini now also owns frontend tasks G29–G33.

**Frontend tasks are now in scope for Gemini** — this is intentional. The same coding standards apply: TypeScript strict, Tailwind only, `'use client'` only when needed.

**Batch 9 tasks for Gemini: G29, G30, G31, G32, G33** — all in `task.md`. Work top-to-bottom. G29 first (installs framer-motion which G32/G33 may use).

---

## ⚠ NEW TASKS ASSIGNED — Batch 5 (2026-02-21)

You have 2 new tasks: **G20, G21**. Read `task.md` for full specs. Work order: **G20 → G21**.

**Summary:**
- **G20** — Add a mobile hamburger menu to `src/components/Header.tsx`. The nav links are currently `hidden md:flex` — add a hamburger button visible only on mobile, opening a full-screen overlay menu (bg-black/95, white text) with all site links. Include close button, prevent body scroll when open.
- **G21** — Create a reusable `<ProductCard>` component at `src/components/ProductCard.tsx`. Extract the duplicated product card code (image + name + price) from shop page, homepage, collection detail, and category filter pages into one shared component. Update all 4 pages to use it.

**⚠ Claude audit notes from Batch 4 (G18-G19):**
- `vitest.config.ts` had `environmentMatchGlobs` which caused a TypeScript error during `next build` because it's not in the `InlineConfig` type. Claude excluded `vitest.config.ts` from `tsconfig.json` to fix this.
- All API logic from G18-G19 was correct.

**⚠ Context for G20:**
- The header already has `'use client'` and imports `useCartStore`.
- New pages exist now that need to be in the mobile menu: `/brand`, `/lookbook`, `/size-guide`, `/faq`, `/contact`.
- Keep the existing desktop nav unchanged.

**⚠ Context for G21:**
- The 4 files with duplicated card code: `src/app/(site)/shop/page.tsx`, `src/app/(site)/page.tsx`, `src/app/(site)/collections/[slug]/page.tsx`, `src/app/(site)/shop/[category-slug]/page.tsx`.
- Each currently has inline JSX for the product grid card. Extract into `<ProductCard slug={...} name={...} price={...} imageUrl={...} />`.
- Use Next.js `<Image>` with `fill` prop, `sizes` prop, and `object-cover`. Add hover scale effect.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 3 (2026-02-21)

You have 2 new tasks: **G16, G17**. Read `task.md` for full specs. Work order: **G16 → G17**.

**Summary:**
- **G16** — Set up Upstash Redis caching. Create `src/lib/redis.ts` and `src/lib/cache.ts`. Wrap the shop page and homepage server-side fetches in `cachedFetch()` with 5-min TTL. The `@upstash/redis` package is already installed.
- **G17** — Build email order confirmation via Resend. Create `src/lib/email.ts`, add `sendOrderConfirmation()` function. Call it from `POST /api/orders` (after order creation) and from `POST /api/paystack/webhook` (on `charge.success`). Wrap in try/catch so email failures don't break orders.

**⚠ Claude audit notes from G13-G15:**
- Waitlist route (G13) was inserting a `source` field that doesn't exist in the `waitlist` table — Claude removed it.
- Logout route was calling `cookies.delete()` without specifying `path=/admin`, meaning the cookie (set with `path=/admin`) wouldn't actually get deleted — Claude fixed it to use `cookies.set()` with `maxAge: 0` and `path: '/admin'`.
- Login page had unused imports (`supabaseBrowser`, `email`, `setEmail`) and an `any` type — Claude cleaned up.
- AdminSidebar had unused `supabaseBrowser` import — Claude removed.
- All other G13-G15 work was solid. The middleware, auth route, seed script, and cookie-based auth system are well implemented.

---

## ⚠ PREVIOUS TASKS ASSIGNED — Batch 2 (2026-02-21)

You have 3 pending tasks: **G13, G14, G15**. Read `task.md` for full specs. Work order: **G13 → G14 → G15**.

**Summary:**
- **G13** — `POST /api/waitlist` route (already in your queue, do this first — it's simple)
- **G14** — Seed the "Rhythm & Thread" collection + link all active products to it + seed product variants (sizes). Write a Node.js script in `scripts/seed_collection_and_variants.js` and run it. See task.md for exact sizes per product type.
- **G15** — Add cookie-based admin auth. `src/middleware.ts` (project root) checks for `iby_admin_session` cookie on `/admin/*` routes. New `POST /api/admin/auth` route sets the cookie on correct password. Update `src/app/admin/login/page.tsx` to wire the form to this route. Add logout button to admin layout.

**⚠ Important context from Claude:**
- The `scripts/` folder already has working examples (`scripts/fix_product_data.js`, `scripts/cleanup_products.js`) — follow the same `.env.local` loading pattern for G14.
- There are currently **12 active products** in the DB (Axis Tank Top, Groove Vest, Iby Wave Cap, Kng Chunky Loafers, Knitted Wool Jacket, Retro Leather Jacket, Rhythm Suit Set, Stride Pant, Tempo Stripe Shirt, The Anchor Pant, The Flow Shirt, Zia Stripe Shirt). The seed script for G14 must handle these exactly.
- Do NOT modify `src/app/admin/` layout or sidebar files — only add the logout button to the existing layout.
- For G15 middleware: use `import { NextResponse } from 'next/server'` — the middleware file goes at `src/middleware.ts` (inside src/), NOT at the project root.

---

## ⚠ NEW TASKS ASSIGNED — Batch 7 (2026-02-21)

You have 3 new tasks: **G24, G25, G26**. Read `task.md` for full specs. Work order: **G24 → G25 → G26**.

**Summary:**
- **G24** — Add `generateMetadata()` to product and collection detail pages for SEO. Also add a default `metadata` export to the site layout. Use the same `cachedFetch` helper so metadata doesn't double-fetch from Supabase.
- **G25** — Decrement stock in `product_variants` when an order is created (`POST /api/orders`). Floor at 0, don't fail the order if decrement errors. Only decrement when `variant_id` is non-null.
- **G26** — Build `GET /api/admin/stats` route returning `{ totalRevenue, totalOrders, totalProducts, todayOrders, totalContacts }`. Auth: check `iby_admin_session` cookie. Used by the new admin dashboard page (Codex builds C25).

**⚠ Claude audit notes from Batch 6 (G22-G23):**
- G22 (admin order search) and G23 (abandoned cart recovery API) were both correctly implemented. Clean work.
- `CODEX.md` got very bloated from duplicate task section appends — ignore the repetitive sections, only the Progress Log entries matter.
- The 3 build errors from Batch 5/6 output were fixed by Claude: unused `Image` import in `shop/[category-slug]/page.tsx`, `cartData?: any` param in `email.ts`, wrong arg count in `abandoned-cart/recover/route.ts`.
- `export const dynamic = 'force-dynamic'` import ordering was also fixed in `page.tsx` and `shop/page.tsx`.

---

## ⚠ NEW TASKS ASSIGNED — Batch 6 (2026-02-21)

You have 2 new tasks: **G22, G23**. Read `task.md` for full specs. Work order: **G22 → G23**.

**Summary:**
- **G22** — Add search bar and filter dropdowns to `/admin/orders/page.tsx`. Filters: order number, customer name, status, source. Update list in real time.
- **G23** — Create `/api/abandoned-cart/recover` (POST). Body: `{ email?, whatsapp_number? }`. Send recovery link via Resend or Fonnte. Log attempt in `abandoned_carts` table.
