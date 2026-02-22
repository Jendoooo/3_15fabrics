# GEMINI.md — Gemini Agent Workspace

**This file belongs to Gemini.**
- Gemini reads AND writes this file
- Other agents (Claude, Codex) read this file but do NOT edit it
- Always append to the Progress Log when completing work

---

## Your Role

You are a **coding agent** for the 315 Fabrics project. You implement assigned tasks from `task.md`.

**Before starting any session:**
1. Read `CLAUDE.md` — full project brief, stack, file structure, DB schema
2. Read `task.md` — find tasks assigned to GEMINI, pick up the first incomplete one
3. Read this file — see what you've done before and any blockers

**After completing a task:**
1. Mark it done in `task.md` — change `[ ]` to `[x]`, append `| Done: YYYY-MM-DD HH:MM`
2. Log what you did in the Progress Log below — **write detailed rationale, not just a summary**

**Progress log format (required):**
```
### [Task ID] — [Task name] | Done: YYYY-MM-DD HH:MM
- **What I did:** [files changed, functions added/modified]
- **Why I approached it this way:** [key decisions, trade-offs, alternatives considered]
- **Tricky parts:** [any edge cases, gotchas, or non-obvious choices]
- **What Claude should verify:** [specific things worth double-checking]
```
This detail saves Claude tokens when auditing — the more specific you are, the faster the review.

---

## Project Context Quick Reference

- **Brand:** 315 Fabrics — fabric store, Epe Lagos, Instagram @3_15fabrics
- **Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase, Paystack, Resend, Fonnte, Cloudinary, PostHog, Upstash Redis
- **DB:** Supabase — see migrations at `supabase/migrations/`
- **Order format:** `315-YYYY-XXXXXX` (NOT `IBY-`)
- **WhatsApp:** `2349066609177`
- **Cart key:** `315fabrics-cart` (NOT `iby-closet-cart`)
- **Fabric purchase model:** `unit_type` ('yard' | 'bundle'), `minimum_quantity` (min yards), `yards_ordered` in order_items
- **Variants:** colorways only — `color` = colorway name, `size = null` always
- **Pages:** `src/app/(site)/` route group for customer-facing pages
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
- **CRITICAL:** `export const dynamic = 'force-dynamic'` must ALWAYS be placed AFTER all import statements — never between them. This has caused build failures repeatedly. In Next.js App Router, all `import` declarations must come first, then exports and code.
- **Yards logic:** In the cart and order, `quantity` field = yards ordered for yard-type products (or 1 for bundles). Line total = `unit_price × quantity`. Do NOT add separate price calculation logic — the existing subtotal math still works.

---

## ⚠ NEW TASKS — Batch 1 (2026-02-22)

You have 3 new tasks: **G1, G2, G3**. Read `task.md` for full specs. Work order: **G1 → G2 → G3**.

### G1: Schema migration + types.ts update
Create the new migration file and update types.

**Files to create/edit:**
- Create `supabase/migrations/20260222000001_315fabrics_schema.sql`
- Edit `src/lib/types.ts`

**Migration SQL:**
```sql
-- 315 Fabrics schema additions
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_type TEXT DEFAULT 'yard'
  CHECK (unit_type IN ('yard', 'bundle'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS minimum_quantity NUMERIC NOT NULL DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS fabric_type TEXT;

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS yards_ordered NUMERIC;
```

**types.ts changes:**
- In `Product` type: add `unit_type: string`, `minimum_quantity: number`, `fabric_type: string | null`
- In `OrderItem` type: add `yards_ordered: number | null`
- In the `Database` type at the bottom: the Row types for products and order_items will automatically reflect the Product and OrderItem interfaces — no separate changes needed there.

### G2: Backend branding + order number + cart store lib
Rebrand the backend and update core logic files.

**Files to edit:**

**`src/app/api/orders/route.ts`:**
- Change order number generation prefix from `IBY-` to `315-`. Find the line(s) where the order number is assembled (e.g. the random alphanumeric string construction) and change the prefix string.
- Accept `yards_ordered` from each item in the request body. When inserting into `order_items`, include `yards_ordered: item.yards_ordered ?? item.quantity` (fall back to quantity if not provided).

**`src/lib/email.ts`:**
- Replace every occurrence of `iby_closet`, `iby closet`, `IBY`, `iby-closet`, `Ibrahim Hamed` with `315 Fabrics` or `315fabrics` as appropriate.
- Update sender/from name to "315 Fabrics".
- Update WhatsApp number to `2349066609177` wherever it appears.
- All tracking links already use `NEXT_PUBLIC_APP_URL` — verify this is still the case.

**`src/lib/cart-store.ts`:**
- Add `unit_type: 'yard' | 'bundle'` to the `CartItem` type.
- Add `minimum_quantity: number` to the `CartItem` type.
- Rename the localStorage key from `'iby-closet-cart'` to `'315fabrics-cart'` (in the `persist` config at the bottom: `name: '315fabrics-cart'`).
- No changes needed to `addItem`, `removeItem`, `updateQuantity`, or `getTotals` — they all use `quantity` which works as-is.

**`src/app/api/delivery/calculate/route.ts`:**
- Find and rename the service label "Iby Logistics Same-day" to "315 Fabrics Delivery". Also update any other "iby" or "Iby" references in the delivery options objects.

**`package.json`:**
- Change `"name": "iby_closet"` to `"name": "315-fabrics"`.

### G3: Seed fabric categories + fix hardcoded URLs
Seed the 6 fabric categories into the DB and fix hardcoded iby-closet.com URLs.

**Files to create/edit:**

**Create `scripts/seed_fabric_categories.js`:**
Follow the exact same pattern as `scripts/seed_collection_and_variants.js` or other existing scripts in `/scripts/` (they load `.env.local` via dotenv and use the Supabase JS client). Insert these 6 categories (upsert on `slug` to avoid duplicates):

```js
const categories = [
  { name: 'Ankara & African Print', slug: 'ankara-african-print', sort_order: 1 },
  { name: 'French Lace & Swiss Voile', slug: 'french-lace-swiss-voile', sort_order: 2 },
  { name: 'Aso-Oke & Traditional', slug: 'asoke-traditional', sort_order: 3 },
  { name: 'Senator & Corporate', slug: 'senator-corporate', sort_order: 4 },
  { name: 'Wedding & Asoebi', slug: 'wedding-asoebi', sort_order: 5 },
  { name: 'New Arrivals', slug: 'new-arrivals', sort_order: 6 },
];
```

Use `.upsert(categories, { onConflict: 'slug' })`. Log success or errors.

**Edit `src/app/sitemap.ts`:**
- Find the hardcoded base URL (currently `https://iby-closet.com` or similar constant).
- Replace with: `const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';`
- Use `BASE_URL` wherever the hardcoded URL was used.

**Edit `src/app/robots.ts`:**
- Find the hardcoded sitemap URL (currently `https://iby-closet.com/sitemap.xml`).
- Replace with: `\`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/sitemap.xml\``

---

## ⚠ NEW TASKS — Batch 2 (2026-02-22)

You have 1 new task: **G4**. Complete G1 → G2 → G3 → G4 in order.

**Note on G1 update:** The migration `20260222000001_315fabrics_schema.sql` already exists and was run. G1 now means: create the NEW gender migration (`20260222000002_gender_column.sql`) + update `types.ts` with ALL new fields (unit_type, minimum_quantity, fabric_type, yards_ordered, gender). See `task.md` for exact spec.

---

### G4: Instagram Import Pipeline

**File to create:** `scripts/seed_from_instagram.js`

This script reads `IGPOSTS_USERS_3_15fabrics_100.xlsx` (100 Instagram posts from @3_15fabrics) and seeds all non-video posts as **draft products** into Supabase, with images uploaded to Cloudinary.

**Excel columns available:** Media ID, Shortcode, Date(GMT), Caption, Image URL, Image URLs (newline-separated carousel URLs), Thumbnail URL, Is Carousel (YES/NO), Is Video (YES/NO), Post URL, Likes, Comments.

**Script pattern — follow exactly:**
```js
// At top:
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const cloudinary = require('cloudinary').v2;
const XLSX = require('xlsx');
// node-fetch v2 (CommonJS compatible): const fetch = require('node-fetch');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

**Main logic (async IIFE):**
1. `const wb = XLSX.readFile('./IGPOSTS_USERS_3_15fabrics_100.xlsx');`
2. `const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);`
3. Filter: `rows.filter(r => r['Is Video'] !== 'YES')`
4. For each row, build product and upsert + upload images. Full spec in `task.md` G4.

**Helper — uploadToCloudinary(url, publicId):**
```js
async function uploadToCloudinary(url, publicId) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: '315fabrics/instagram', public_id: publicId },
      (error, result) => error ? reject(error) : resolve(result.secure_url)
    ).end(buffer);
  });
}
```

**Emoji strip helper:**
```js
function stripEmojis(str) {
  return str.replace(/[\u{1F000}-\u{1FFFF}|\u{2600}-\u{27BF}|\u{1F900}-\u{1F9FF}|\u{FE00}-\u{FEFF}]/gu, '').trim();
}
```

**Fabric type detection:**
```js
function detectFabricType(caption) {
  if (!caption) return null;
  const c = caption.toLowerCase();
  if (c.includes('ankara')) return 'Ankara';
  if (c.includes('lace')) return 'French Lace';
  if (c.includes('voile')) return 'Swiss Voile';
  if (c.includes('aso-oke') || c.includes('asooke')) return 'Aso-Oke';
  if (c.includes('senator')) return 'Senator';
  if (c.includes('cotton')) return 'Cotton';
  return null;
}
```

**Do NOT run the script** — just create it. The user will run it manually after verifying Cloudinary credentials in `.env.local`.

---

## ⚠ NEW TASKS — Batch 3 (2026-02-22)

You have 2 new tasks: **G5, G6**. Work order: G5 → G6.

---

### G5: Admin session cookie + Cloudinary folder + admin UI branding

**Files to edit:**

**(1) Admin session cookie rename** — find every file that reads, sets, or deletes the cookie named `'iby_admin_session'` and rename it to `'315fabrics_admin_session'`. Files to check (read each before editing):
- `src/middleware.ts` — cookie check in admin path guard
- `src/app/api/admin/auth/route.ts` — cookie is SET on login
- `src/app/api/admin/logout/route.ts` — cookie is DELETED
- `src/app/api/admin/collections/[id]/route.ts` — auth check
- `src/app/api/admin/orders/[id]/route.ts` — auth check; also fix any `iby_closet` in email text and fix `https://iby-closet.com/track` URL → use `` `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/track` ``
- `src/app/api/admin/products/[id]/route.ts` — auth check
- `src/app/api/admin/stats/route.ts` — auth check

**(2) Cloudinary upload folder** — `src/app/api/upload/image/route.ts`:
- Change folder from `'iby_closet/products'` → `'315fabrics/products'`
- Also rename cookie check from `iby_admin_session` → `315fabrics_admin_session`

**(3) Admin sidebar** — `src/app/admin/_components/AdminSidebar.tsx`:
- Update brand name/logo text from `iby_closet` → `315 Fabrics`. Keep layout unchanged.

**(4) Admin login page** — `src/app/admin/login/page.tsx`:
- Update any visible `iby_closet` brand text to `315 Fabrics`.

**(5) Abandoned cart email URL** — `src/app/api/abandoned-cart/recover/route.ts`:
- Fix hardcoded `https://iby-closet.com/cart` → `` `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/cart` ``

**Verification:** After editing, `grep -r "iby_admin_session" src/` should return 0 results. `grep -r "iby_closet" src/` should also return 0 results.

---

### G6: FAQ page rewrite + track page fix

**Files to edit:**

**(1) Rewrite `src/app/(site)/faq/page.tsx`** — read the file first. Keep the same accordion/section layout and component structure. Replace ALL content with fabric store Q&As. Also:
- Update metadata: `title: 'FAQ'`, description referencing 315 Fabrics fabric store
- Replace all `@iby_closet` → `@3_15fabrics`, all old WhatsApp numbers → `2349066609177`, all `IBY-XXXXXXXX` order format examples → `315-YYYY-XXXXXX`

New Q&A content by section:

**Ordering & Yards:**
- "How do I know how many yards I need?" — "Check our [Yardage Guide](/yardage-guide) for a breakdown by outfit type. When in doubt, add an extra half yard."
- "What is the minimum order?" — "Each product listing shows the minimum. Most fabrics start at 5 yards."
- "Can I order a custom amount of yards?" — "Yes, for yard-type products you choose how many yards you need (subject to stock)."
- "What does 'bundle' mean?" — "A bundle is a fixed set of yards sold as one complete unit — perfect for a single outfit."

**Fabric Types:**
- "What types of fabric do you sell?" — "We carry Ankara, French Lace, Swiss Voile, Aso-Oke, Senator, and Cotton. New arrivals drop regularly."
- "Do you do asoebi group orders?" — "Yes! WhatsApp us at +234 906 660 9177 for bulk pricing for events and wedding groups."

**Payment:**
- "How do I pay?" — "Online via card or bank transfer through Paystack (secure). You can also place orders via WhatsApp and pay by bank transfer."
- "Is payment secure?" — "Yes — all online payments are processed by Paystack, a trusted Nigerian payment gateway."

**Delivery:**
- "Do you deliver nationwide?" — "Yes, we deliver across Nigeria."
- "How long does delivery take?" — "Lagos: 2–5 working days. Outside Lagos: 3–7 working days."
- "How much is delivery?" — "Delivery fee is calculated at checkout based on your location."

**Returns & Quality:**
- "What if my fabric is faulty?" — "Contact us within 48 hours of receiving your order. WhatsApp +234 906 660 9177 with photos and your order number."
- "Are your fabrics authentic?" — "Yes — all fabrics are sourced directly from trusted suppliers. We don't sell substandard goods."

**(2) Fix `src/app/(site)/track/page.tsx`** — read the file. Find any order number format example text (e.g. `IBY-2026-XXXXXX` or similar). Change it to `315-2026-XXXXXX`. Only change the example/display text — do not touch form logic, API calls, or state.

---

## ⚠ NEW TASKS — Batch 4 (2026-02-22)

You have 8 new tasks: **G7 → G8 → G9 → G10 → G11 → G12 → G13 → G14**. Work strictly in order.

---

### G7: Order email — yards display

**File:** `src/lib/email.ts` — read the full file first.

Find the HTML order confirmation email template (there will be an order items loop). Fix the item row:
- Replace `Size: ${item.size || 'N/A'}` with `` `${item.yards_ordered ?? item.quantity} yards — ${item.color || 'Standard'}` ``
- This shows e.g. "5 yards — Wine Red" instead of "Size: N/A"

Also update the **WhatsApp notification** (Fonnte message body, likely also in this file or in `src/app/api/admin/orders/[id]/route.ts`). Find where the message lists order items and apply the same fix: show yards + colorway, not size.

No other changes to email.ts.

---

### G8: Repurpose collections page as "Shop by Fabric Type"

**File:** `src/app/(site)/collections/page.tsx` — read first.

Replace the entire component. The current version shows editorial campaigns (iby_closet). New version shows the 6 fabric categories.

**What to remove:** `NotifyMeButton`, `StaggerContainer`, `StaggerItem`, `Collection` type, all fallback image references to `/images/instagram/` (these files were deleted).

**New query:**
```ts
const { data: categories } = await supabaseServer
  .from('categories')
  .select('id, name, slug')
  .order('sort_order', { ascending: true });
```

**New UI:**
- Title: "Shop by Fabric Type"
- White background, black text
- 2-column mobile, 3-column md+ grid
- Each card: `<Link href={"/shop/" + category.slug}>`, border-neutral-200 border, p-8, hover:border-black transition
- Inside card: `<p className="text-lg uppercase tracking-widest">{category.name}</p>` + `<span className="mt-3 block text-xs uppercase tracking-widest text-neutral-400 group-hover:text-black transition-colors">Shop →</span>`

**Critical:** `export const dynamic = 'force-dynamic'` must go AFTER all import statements.

---

### G9: Homepage — show fabric categories in "Shop by Category" section

**File:** `src/app/(site)/page.tsx` — read first.

The homepage currently queries `collections` for its "Shop by Category" grid. Change this:

1. In the `cachedFetch` block, replace the collections query with:
```ts
const { data: featuredCategories } = await supabaseServer
  .from('categories')
  .select('id, name, slug')
  .order('sort_order', { ascending: true })
  .limit(6);
// ...
return { products, productImageMap, categories: (featuredCategories ?? []) };
```

2. Rename `FeaturedCollection` type → `FabricCategory = Pick<Category, 'id' | 'name' | 'slug'>`.

3. Update the "Shop by Category" JSX grid:
- Each card: `<Link href={"/shop/" + category.slug}>` (not `/collections/...`)
- Since categories have no cover_image, use a text-only card: dark grey background (`bg-neutral-900`), white text, centered, `aspect-video` or `min-h-[140px]` with flex items-center justify-center
- Category name: `text-sm uppercase tracking-widest text-white text-center`

4. Change "All Categories" link: `href="/shop"` (not `/collections`)

5. Remove `Collection` from the `type` import at the top.

---

### G10: Seed test products script

**Create `scripts/seed_test_products.js`** — follow the same pattern as other scripts (dotenv + supabase). Insert 2 products with variants and images. Use upsert on slug.

**Product 1 (yard-type):**
```js
{ name: 'Rich Ankara Print — Test', slug: 'test-ankara-print', description: 'Test product for checkout.', price: 5000, status: 'active', unit_type: 'yard', minimum_quantity: 5, fabric_type: 'Ankara', gender: 'unisex', is_featured: true }
```
Variants: `{ color: 'Wine Red', size: null, stock_quantity: 20 }`, `{ color: 'Navy Blue', size: null, stock_quantity: 15 }`
Image: `{ image_url: 'https://placehold.co/600x800/222/fff?text=Ankara+Test', is_primary: true, sort_order: 0 }`

**Product 2 (bundle-type):**
```js
{ name: 'Senator Bundle — Test', slug: 'test-senator-bundle', description: 'Test bundle product.', price: 35000, status: 'active', unit_type: 'bundle', minimum_quantity: 8, fabric_type: 'Senator', gender: 'men', is_featured: false }
```
Variants: `{ color: 'Charcoal Grey', size: null, stock_quantity: 10 }`, `{ color: 'Champagne', size: null, stock_quantity: 8 }`
Image: `{ image_url: 'https://placehold.co/600x800/333/ccc?text=Senator+Bundle', is_primary: true, sort_order: 0 }`

Log: "✓ Product 1 created", etc. **Do NOT run** — create only.

---

### G11: Add sort param to shop page

**File:** `src/app/(site)/shop/page.tsx` — read first.

Add `sort` to `searchParams`:
```ts
type ShopPageProps = {
  searchParams?: {
    gender?: string | string[];
    sort?: string | string[];
  };
};
```

Extract and validate sort:
```ts
const sortParam = Array.isArray(searchParams?.sort) ? searchParams?.sort[0] : searchParams?.sort;
const sort = (['newest', 'price-asc', 'price-desc'] as const).includes(sortParam as 'newest' | 'price-asc' | 'price-desc') ? (sortParam as 'newest' | 'price-asc' | 'price-desc') : 'newest';
```

Apply to Supabase query (after the gender filter, before closing the chain):
```ts
if (sort === 'price-asc') productsQuery = productsQuery.order('price', { ascending: true });
else if (sort === 'price-desc') productsQuery = productsQuery.order('price', { ascending: false });
else productsQuery = productsQuery.order('created_at', { ascending: false });
```

Update cachedFetch key: `` `shop:products:${gender ?? 'all'}:${sort}` ``

Pass `sort={sort}` as an additional prop to `<ShopFilter>`. Update ShopFilter's props type to accept `sort?: string` (no logic change in ShopFilter yet — C9 adds the sort UI separately).

---

### G12: Admin manual order form — yards + cleanup

**File:** `src/app/admin/orders/new/page.tsx` — read first.

**(1)** Grep for `iby_closet`, `IBY-`, old WhatsApp — fix any found.

**(2)** Find where order items are added (the per-item form row). Each item should have a "Yards Ordered" input alongside the quantity. Add a `yardsOrdered` field (number, default = quantity) per item in the form state. When building the order payload for `POST /api/orders`, include `yards_ordered: item.yardsOrdered ?? item.quantity` per item.

---

### G13: Admin quick-sale — yards + cleanup

**File:** `src/app/admin/quick-sale/page.tsx` — read first.

**(1)** Grep for any `iby_closet`, `IBY-` — fix.

**(2)** When the component builds the order payload for `POST /api/orders`, each item object should include `yards_ordered: item.quantity`. This is typically a one-line addition to the item object in the payload construction.

---

### G14: Admin products list — show fabric_type and unit_type columns

**File:** `src/app/admin/products/page.tsx` — read first.

Add `fabric_type` and `unit_type` to the select query and to the rendered table:
- Add to Supabase select: `fabric_type, unit_type`
- Add to table header: "Fabric Type" and "Sold By" columns (keep all existing columns)
- In each row: `{product.fabric_type ?? '—'}` and `{product.unit_type === 'bundle' ? 'Bundle' : 'Per Yard'}`
- TypeScript: update the type alias to include these fields
- No other layout or logic changes

---

## Progress Log

- **[2026-02-22]** Gemini: Completed Batch 1 and Batch 2 tasks (G1, G2, G3, G4).
  - **G1:** Created gender migration script (`20260222000002_gender_column.sql`) and added new fields to `types.ts` (`unit_type`, `minimum_quantity`, `fabric_type`, `gender` to `Product`; `yards_ordered` to `OrderItem`).
  - **G2:** Rebranded backend items from iby_closet to 315 Fabrics. Updated `orders/route.ts` prefix to `315-` and included `yards_ordered`. Rebranded `email.ts` templates. Added `unit_type` and `minimum_quantity` to `CartItem` in `cart-store.ts` and renamed key to `315fabrics-cart`. Renamed delivery options in `delivery/calculate/route.ts`. Updated `package.json` name to `315-fabrics`.
  - **G3:** Created `seed_fabric_categories.js` script to seed 6 categories. Updated `sitemap.ts` and `robots.ts` to use `NEXT_PUBLIC_APP_URL` instead of hardcoded `iby-closet.com`.
  - **G4:** Installed `xlsx` and `node-fetch`. Created `seed_from_instagram.js` to parse `IGPOSTS_USERS_3_15fabrics_100.xlsx` and insert non-video posts as draft products, generating slugs, default fields, downloading and re-uploading associated images to Cloudinary, and inserting into `product_images`.

### Batch 3 — Assigned 2026-02-22 | Done: 2026-02-22 10:06
- **What I did:** 
  - (G5) Renamed admin session cookie from `iby_admin_session` to `315fabrics_admin_session` across middleware, auth route, logout route, and dynamic API admin routes (collections, orders, products, stats, image upload). Updated `src/app/api/upload/image/route.ts` Cloudinary folder to `315fabrics/products`. Rebranded `AdminSidebar.tsx` and `login/page.tsx` from `iby_closet` to `315 Fabrics`. Fixed URL and text in abandoned cart recovery API to use environment variables and mention 315 Fabrics.
  - (G6) Completely rewrote `src/app/(site)/faq/page.tsx` with new Q&A content regarding yardage, fabrics, returns, and updated metadata. Fixed the default track page format example from `IBY-2026-XXXXXX` to `315-2026-XXXXXX` in `src/app/(site)/track/page.tsx`.
- **Why I approached it this way:** 
  - Replaced using precise targeted multi-replace tool chunks to avoid breaking the surrounding component structure, keeping styling unchanged.
- **Tricky parts:**
  - In `faq/page.tsx`, adjusting the metadata inline alongside the structural FAQ array definitions. In abandoned-cart, handling the fallback `http://localhost:3000` for `NEXT_PUBLIC_APP_URL`.
- **What Claude should verify:**
  - Verify if any other admin session names or tracking URLs remain hardcoded (A grep for `iby_closet` and `iby_admin_session` was run, replacing all discovered instances).

---

## Notes for Future Batches

- The `product_variants` table's `size` column will always be `null` for 315 Fabrics — it's used only for colorways. Do not create size-based variants.
- If building admin features, the admin session cookie is still `iby_admin_session` for now (rename scheduled for Batch 2).
- The `collections` table is available but not a primary UX concept yet — fabric categories are the main navigation. Collections can be used for curated "asoebi sets for events" in future.
