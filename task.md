# task.md — 315 Fabrics Shared Task Board

**All agents (Claude, Gemini, Codex) read this file.**
**All agents mark their OWN tasks done directly in this file.**
**Only Claude adds new tasks, changes assignments, or edits the Unassigned Queue.**

---

## Rules

1. To mark a task done: change `[ ]` → `[x]` and append `| Done: YYYY-MM-DD HH:MM`
2. Do NOT edit another agent's task lines
3. Do NOT edit the Unassigned Queue — only Claude manages that
4. If blocked: add `  ⚠ BLOCKED: [reason]` on the next line under your task and stop
5. Tasks are self-contained — enough info to execute without asking Claude
6. Work in order top-to-bottom within your section unless a task is blocked

---

## Agent Roles

| Agent | Responsibility |
|---|---|
| **Gemini** | Backend + data layer: schema migrations, TypeScript types, all API routes, email templates, lib/ utilities |
| **Codex** | Frontend + state: Zustand cart store UI, all customer-facing page components, admin form fields |
| **Claude** | Senior engineer + auditor: reviews all code, fixes bugs, architecture decisions, assigns new batches |

---

## Unassigned Queue
*(Staging area — Claude moves items into agent sections when ready)*

- [ ] Visual redesign: warm earth tones, gold accents, celebratory palette (Tailwind config + globals.css)
- [ ] Admin session cookie rename: `iby_admin_session` → `315fabrics_admin_session` (across middleware, auth route, all API routes)
- [ ] Delete `/size-guide` route (replaced by `/yardage-guide`)
- [ ] Cart page: update display to show "X yards" unit label and line total for yard-type items
- [ ] Checkout page: review and update any hardcoded iby_closet copy (success messages, labels)
- [ ] FAQ page: rewrite content for fabric store (shipping, bundles, yardage questions)
- [ ] Contact page: update WhatsApp number to 2349066609177, Instagram to @3_15fabrics
- [ ] Track page: update "IBY-" to "315-" in the help text / order format example
- [ ] Public /collections page: update to show fabric categories (populate from seeded categories)
- [ ] Seed a test fabric product (yarn-based + bundle type) to verify the checkout flow end to end
- [ ] Set up new Supabase project + run both migrations (infrastructure — user action, not code)
- [ ] Set up new Paystack account for the sister's store (infrastructure — user action, not code)
- [ ] Update .env.local with 315 Fabrics credentials (user action)
- [ ] Admin: product bulk CSV template — update column headers for fabric fields (unit_type, fabric_type, minimum_quantity)

---

## GEMINI — Backend + Data Layer
*(Work top-to-bottom. Mark each done before starting the next.)*

### Batch 1 — Assigned 2026-02-22

- [x] **TASK G1:** Create gender migration + update types.ts with all new fields. | Done: 2026-02-22 09:40
  **Context:** Migration `20260222000001_315fabrics_schema.sql` already exists and was run in DB. Do NOT recreate it.
  **(1)** Create `supabase/migrations/20260222000002_gender_column.sql`:
  ```sql
  ALTER TABLE products ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'unisex'
    CHECK (gender IN ('men', 'women', 'unisex'));
  COMMENT ON COLUMN products.gender IS 'Intended wearer: men, women, or unisex';
  ```
  **(2)** Update `src/lib/types.ts` — add ALL new fields to existing types:
  - In `Product` type: add `unit_type: string`, `minimum_quantity: number`, `fabric_type: string | null`, `gender: 'men' | 'women' | 'unisex'`
  - In `OrderItem` type: add `yards_ordered: number | null`
  - Do not change any other types.

- [x] **TASK G2:** Backend branding overhaul + cart-store lib update. | Done: 2026-02-22 09:41
  **(1) `src/app/api/orders/route.ts`:** Change order number prefix from `IBY-` to `315-`. Find where the random alphanumeric string is assembled and change only the prefix string. Also: when inserting each item into `order_items`, include `yards_ordered: item.yards_ordered ?? item.quantity` (use quantity as fallback since for fabrics quantity IS yards).
  **(2) `src/lib/email.ts`:** Read the file. Replace ALL occurrences of `iby_closet`, `iby closet`, `IBY`, `iby-closet`, `Ibrahim Hamed` with `315 Fabrics` (or `315fabrics` in slugs/IDs). Update sender/from name to "315 Fabrics". Replace old WhatsApp number with `2349066609177`. Verify tracking links use `NEXT_PUBLIC_APP_URL` (don't change if they already do).
  **(3) `src/lib/cart-store.ts`:** Add `unit_type: 'yard' | 'bundle'` and `minimum_quantity: number` to the `CartItem` type. Change the persist storage key from `'iby-closet-cart'` to `'315fabrics-cart'` (in the `name:` field of the `persist` config). No changes to addItem/removeItem/updateQuantity/getTotals logic.
  **(4) `src/app/api/delivery/calculate/route.ts`:** Find "Iby Logistics Same-day" (or any similar "Iby" label) and rename to "315 Fabrics Delivery". Update any other "iby" references in service option labels.
  **(5) `package.json`:** Change `"name": "iby_closet"` to `"name": "315-fabrics"`.

- [x] **TASK G3:** Seed fabric categories + fix hardcoded URLs. | Done: 2026-02-22 09:41
  **(1)** Create `scripts/seed_fabric_categories.js`. Follow the exact pattern of other scripts in `/scripts/` (load `.env.local` with dotenv, use `@supabase/supabase-js` createClient with service role key). Insert 6 categories using `.upsert([...], { onConflict: 'slug' })`:
  ```js
  [
    { name: 'Ankara & African Print', slug: 'ankara-african-print', sort_order: 1 },
    { name: 'French Lace & Swiss Voile', slug: 'french-lace-swiss-voile', sort_order: 2 },
    { name: 'Aso-Oke & Traditional', slug: 'asoke-traditional', sort_order: 3 },
    { name: 'Senator & Corporate', slug: 'senator-corporate', sort_order: 4 },
    { name: 'Wedding & Asoebi', slug: 'wedding-asoebi', sort_order: 5 },
    { name: 'New Arrivals', slug: 'new-arrivals', sort_order: 6 },
  ]
  ```
  Log success or error. Do NOT run the script — just create it. (Running requires real Supabase credentials.)
  **(2)** Edit `src/app/sitemap.ts`: Replace the hardcoded `https://iby-closet.com` base URL constant with `const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';`. Use `BASE_URL` throughout.
  **(3)** Edit `src/app/robots.ts`: Replace the hardcoded sitemap URL with `` `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/sitemap.xml` ``.

### Batch 2 — Assigned 2026-02-22

- [x] **TASK G4:** Instagram import pipeline — seed draft products from `IGPOSTS_USERS_3_15fabrics_100.xlsx`. | Done: 2026-02-22 09:43
  **Create `scripts/seed_from_instagram.js`.**
  **(0) Check dependencies.** If `xlsx`, `cloudinary`, `node-fetch` (or `axios`) are not in `package.json`, install them as dev dependencies: `npm install --save-dev xlsx node-fetch`. `cloudinary` should already be present.
  **(1) Script setup.** Follow the same dotenv + supabase pattern as other scripts in `/scripts/`. Also initialise Cloudinary: `cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET })`.
  **(2) Read the Excel.** `const wb = XLSX.readFile('./IGPOSTS_USERS_3_15fabrics_100.xlsx'); const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);`
  **(3) For each row where `row['Is Video'] !== 'YES'`:**
  - Build product data:
    - `name`: first 60 chars of `row['Caption']`, trimmed and emoji-stripped; fallback to `'Fabric Post'` if null/empty
    - `slug`: `row['Shortcode']` (already unique and URL-safe)
    - `description`: `row['Caption'] ?? null`
    - `status`: `'draft'`
    - `unit_type`: `'yard'`
    - `minimum_quantity`: 1
    - `is_featured`: false
    - `price`: 0 (placeholder — Ayodei sets real prices in admin)
    - `fabric_type`: keyword-scan Caption for "Ankara","Lace","Voile","Aso-Oke","Senator","Cotton" → set matching value or null
    - `gender`: `'unisex'`
  - **Image handling:**
    - Primary image URL = `row['Thumbnail URL']` (always present for non-video posts)
    - For carousel posts (`row['Is Carousel'] === 'YES'`), additional URLs = `row['Image URLs']?.split('\n').filter(Boolean) ?? []`
    - All image URLs to process = `[thumbnailUrl, ...carouselUrls].filter(Boolean).slice(0, 4)` (cap at 4)
    - For each image URL: download with `node-fetch`, pipe to `cloudinary.uploader.upload_stream({ folder: '315fabrics/instagram', public_id: shortcode + '_' + index })`. Capture returned `secure_url`.
  - **Insert to DB:**
    - Upsert product: `supabase.from('products').upsert({ ...productData }, { onConflict: 'slug' })` — skip if exists
    - For each uploaded Cloudinary URL: insert into `product_images`: `{ product_id, image_url: cloudinaryUrl, is_primary: (index === 0), sort_order: index }`
  - Log: `✓ Created: [name] | slug: [slug]` or `⚠ Skipped (exists): [slug]` or `✗ Error: [slug] — [message]`
  **(4) Summary log at end:** `Done. Created: X, Skipped: Y, Errors: Z`
  **Do NOT run the script** — just create it. Tell user to run `node scripts/seed_from_instagram.js` after adding Cloudinary env vars.

---

## CODEX — Frontend + State Layer
*(Work top-to-bottom. Mark each done before starting the next. Read `src/lib/types.ts` and `src/lib/cart-store.ts` for current types.)*

### Batch 1 — Assigned 2026-02-22

- [x] **TASK C1:** Rewrite `src/app/(site)/products/[slug]/ProductPurchasePanel.tsx` for fabric purchasing. Read the existing file first. | Done: 2026-02-22 09:46
  **New props:** Add `unitType: 'yard' | 'bundle'` and `minimumQuantity: number` to `ProductPurchasePanelProps`.
  **Remove size selector entirely.** Replace with a **Colourway selector**: label "Colourway", one button per variant showing `variant.color ?? 'Default'`. Selected state: `border-black bg-black text-white`.
  **Yard-type UX (`unitType === 'yard'`):** Numeric input (type="number", min=minimumQuantity, max=selectedVariant?.stock_quantity, step=0.5, default=minimumQuantity). Label: "Yards". Show line total text: `"{yards} yards × ₦{unitPrice.toLocaleString('en-NG')} = ₦{(yards * unitPrice).toLocaleString('en-NG')}"`. Show stock: `"{selectedVariant.stock_quantity} yards in stock"`. Button: "Add to Cart".
  **Bundle-type UX (`unitType === 'bundle'`):** No quantity input. Show `"Complete set — {minimumQuantity} yards"`. Quantity locked at 1. Button: "Order This Bundle".
  **WhatsApp fallback (no variants):** Keep existing "Enquire on WhatsApp" CTA.
  **addItem call:** `quantity` = yards entered (yard) or 1 (bundle). Include `unit_type: unitType`, `minimum_quantity: minimumQuantity` in the item object.
  **Also update `src/app/(site)/products/[slug]/page.tsx`:** Pass `unitType={(productData.unit_type ?? 'yard') as 'yard' | 'bundle'}` and `minimumQuantity={productData.minimum_quantity ?? 1}` to `<ProductPurchasePanel>`.

- [x] **TASK C2:** Global branding + copy updates. *(Items 1-5, 7-9 completed by Claude 2026-02-22. Only item 6 (yardage guide page) remains — see C5.)* | Done: 2026-02-22 (partial — see C5 for remainder)

- [x] **TASK C3:** Add fabric-specific fields to admin product form. **File:** `src/app/admin/_components/ProductForm.tsx`. Read the entire file first. | Done: 2026-02-22 09:46
  **Add useState** for: `unitType: 'yard' | 'bundle'` (default: product?.unit_type ?? 'yard'), `minimumQuantity: number` (default: product?.minimum_quantity ?? 1), `fabricType: string` (default: product?.fabric_type ?? '').
  **Add 3 new form fields** after the Status field (match existing form styling — border cards, uppercase tracking-widest labels, border-neutral-200 inputs):
  - Fabric Type: `<select>` with options: Ankara, French Lace, Swiss Voile, Senator, Aso-Oke, Cotton, Other
  - Sold By: Radio buttons "Per Yard" (value: 'yard') / "Bundle Only" (value: 'bundle')
  - Minimum Yards / Bundle Size: `<input type="number" min={0.5} step={0.5}>`. Label changes reactively: "Minimum Yards to Order" (yard) or "Bundle Size (total yards in set)" (bundle). Show helper text explaining the field.
  **Variants section:** Rename "Size" column header → "Colorway / Pattern". Keep the size input field but add `placeholder="(not used for fabrics)"` and visually de-emphasize it (`opacity-50`).
  **Form submission:** Include `unit_type: unitType`, `minimum_quantity: minimumQuantity`, `fabric_type: fabricType || null` in the product upsert/insert payload.

### Batch 2 — Assigned 2026-02-22

- [x] **TASK C4:** Gender filter on shop page + gender field in admin product form. | Done: 2026-02-22 09:46
  **File 1: `src/app/(site)/shop/page.tsx`** — Read first. Add gender filter pills above the product grid.
  - The page is a server component that already accepts search params. Add `gender` to the destructured search params.
  - Add filter to Supabase query: if `gender` param is `'men'`, `'women'`, or `'unisex'`, add `.eq('gender', gender)` to the products query.
  - Render filter pills above the grid:
    ```tsx
    <div className="flex gap-2 mb-8">
      {['all','men','women','unisex'].map((g) => (
        <Link key={g} href={g === 'all' ? '/shop' : `/shop?gender=${g}`}
          className={`px-4 py-1.5 text-xs uppercase tracking-widest border transition-colors ${
            (gender ?? 'all') === g ? 'bg-black text-white border-black' : 'border-neutral-300 hover:border-black'
          }`}>
          {g === 'all' ? 'All' : g.charAt(0).toUpperCase() + g.slice(1)}
        </Link>
      ))}
    </div>
    ```
  **File 2: `src/app/admin/_components/ProductForm.tsx`** — Add gender dropdown **after the Fabric Type field** (from C3). Add `const [gender, setGender] = useState<string>(product?.gender ?? 'unisex')` to state. Add this field:
  ```tsx
  <div>
    <label className="mb-1 block text-xs uppercase tracking-widest">Gender</label>
    <select value={gender} onChange={(e) => setGender(e.target.value)}
      className="w-full border border-neutral-200 bg-white px-3 py-2 text-sm">
      <option value="unisex">Unisex</option>
      <option value="women">Women</option>
      <option value="men">Men</option>
    </select>
  </div>
  ```
  Include `gender` in the product upsert/insert payload. Do not change any other form logic.

- [x] **TASK C5:** Create yardage guide page (left over from C2). | Done: 2026-02-22 09:46
  **Create `src/app/(site)/yardage-guide/page.tsx`** — server component, no data fetching.
  Export: `export const metadata: Metadata = { title: 'Yardage Guide' };`
  Content layout (match visual style of `src/app/(site)/faq/page.tsx` — white bg, max-w-3xl, editorial padding):
  - h1: "Yardage Guide"
  - Intro paragraph: "Not sure how many yards you need? Here's a quick guide for common Nigerian styles."
  - A clean table with columns "Style" and "Yards Needed":
    | Buba + Iro (traditional) | 6–8 yards |
    | Gown (fitted/midi) | 4–5 yards |
    | Gown (maxi/flared) | 5–7 yards |
    | Agbada (3-piece set) | 12–15 yards |
    | Kaftan (men's) | 4–5 yards |
    | Men's shirt | 2.5–3 yards |
    | Trousers | 2–2.5 yards |
    | Aso-Oke wrapper (per piece) | 2 yards |
    | Asoebi group order | Contact us for bulk pricing |
  - "Tips for Ordering" section (h2), then 3 bullet points:
    - "When in doubt, buy an extra half yard — it's better to have extra than to run short."
    - "For group asoebi orders, measure per outfit style and multiply by number of guests."
    - "Not sure? WhatsApp us at +234 906 660 9177 and we'll help you work it out."
  - CTA link at bottom: "← Back to Shop" pointing to `/shop`.

### Batch 3 — Assigned 2026-02-22

- [x] **TASK G5:** Admin session cookie + Cloudinary folder + admin UI branding cleanup. Read each file before editing. | Done: 2026-02-22 10:05
  **(1) Admin session cookie rename across ALL files** — rename `'iby_admin_session'` → `'315fabrics_admin_session'` in:
  - `src/middleware.ts` — cookie check in the admin path guard
  - `src/app/api/admin/auth/route.ts` — where cookie is SET on login
  - `src/app/api/admin/logout/route.ts` — where cookie is DELETED
  - `src/app/api/admin/collections/[id]/route.ts` — auth check
  - `src/app/api/admin/orders/[id]/route.ts` — auth check + fix any `iby_closet` in email text + fix `https://iby-closet.com/track` URL → use `` `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/track` ``
  - `src/app/api/admin/products/[id]/route.ts` — auth check
  - `src/app/api/admin/stats/route.ts` — auth check
  **(2) Cloudinary upload folder** — `src/app/api/upload/image/route.ts`: change folder from `'iby_closet/products'` → `'315fabrics/products'`. Also rename the cookie check from `iby_admin_session` to `315fabrics_admin_session`.
  **(3) Admin sidebar** — `src/app/admin/_components/AdminSidebar.tsx`: update brand name/logo text from `iby_closet` → `315 Fabrics`. Keep layout unchanged.
  **(4) Admin login page** — `src/app/admin/login/page.tsx`: update any visible `iby_closet` brand text to `315 Fabrics`.
  **(5) Abandoned cart email** — `src/app/api/abandoned-cart/recover/route.ts`: fix hardcoded `https://iby-closet.com/cart` → use `` `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/cart` ``.

- [x] **TASK G6:** FAQ page rewrite + track page fix. Read each file before editing. | Done: 2026-02-22 10:06
  **(1) Rewrite `src/app/(site)/faq/page.tsx`** — keep the same accordion/section layout but replace ALL content with fabric store Q&As:
  - Update metadata: `title: 'FAQ'`, description referencing 315 Fabrics fabric store
  - Replace ALL `@iby_closet` → `@3_15fabrics`, all `2349131410602` → `2349066609177`, all `IBY-XXXXXXXX` → `315-YYYY-XXXXXX`
  - Rewrite Q&A categories and questions for a fabric store context. Suggested sections and Q&As:
    **Ordering & Yards:** "How do I know how many yards I need?" (link to yardage guide), "What is the minimum order?" (depends on product — check listing), "Can I order a custom amount of yards?" (yes for yard-type products), "What does 'bundle' mean?" (fixed set of yards, one price)
    **Fabric Types:** "What types of fabric do you sell?" (Ankara, French Lace, Swiss Voile, Aso-Oke, Senator, Cotton), "Do you do asoebi group orders?" (yes — WhatsApp for bulk pricing)
    **Payment:** "How do I pay?" (online via card/bank transfer through Paystack, or WhatsApp order), "Is payment secure?" (yes — Paystack)
    **Delivery:** "Do you deliver nationwide?" (yes, across Nigeria), "How long does delivery take?" (2–5 working days Lagos, 3–7 outside Lagos), "How much is delivery?" (calculated at checkout based on location)
    **Returns & Quality:** "What if my fabric is faulty?" (contact within 48 hours, WhatsApp), "Are your fabrics authentic?" (yes — sourced directly from trusted suppliers)
  **(2) Fix `src/app/(site)/track/page.tsx`** — find any reference to `IBY-2026-XXXXXX` format example and change to `315-2026-XXXXXX`. Only change the display text/example, not any functional logic.

---

## CODEX — Batch 3 — Assigned 2026-02-22

- [x] **TASK C6:** Cart page — show yard count and unit label per item. Read `src/app/(site)/cart/page.tsx` first. | Done: 2026-02-22 10:06
  The cart items already have `unit_type` and `quantity` (= yards for yard-type). Update the cart item display:
  - For each item where `item.unit_type === 'yard'`: show `"{item.quantity} yards"` next to (or instead of) the plain quantity number. Line total should show `{item.quantity} yds × ₦{price} = ₦{total}`.
  - For `unit_type === 'bundle'`: show `"Bundle (1 set)"` instead of quantity.
  - The subtotal calculation doesn't change — `item.unit_price × item.quantity` is already correct.
  - Match existing cart item styling — don't change layout, just update text labels for the quantity/unit display.

- [x] **TASK C7:** Delete size-guide page + fix track page format example. Read files before editing. | Done: 2026-02-22 10:06
  **(1) Delete `src/app/(site)/size-guide/page.tsx`** — this page is superseded by `/yardage-guide`. Simply delete the file. (The `/size-guide` URL will 404, which is acceptable — no redirect needed yet.)
  **(2) Check `src/app/(site)/track/page.tsx`** — find the order number format example text (something like "e.g. IBY-2026-XXXXXX" or similar). Update it to show `315-2026-XXXXXX` format. Only change the example text — do not touch any form logic, API calls, or state.

### Batch 4 — Assigned 2026-02-22

- [x] **TASK G7:** Update order confirmation email item display for fabric yards. | Done: 2026-02-22 10:23
  **File:** `src/lib/email.ts` — read first. Find the order items loop inside the HTML email template (look for `item.name`, `item.size`). Update each item row:
  - Change `Size: ${item.size || 'N/A'}` → `"${item.yards_ordered ?? item.quantity} yards — ${item.color || 'Standard'}"` (shows yards and colorway)
  - Also update the subject line for order confirmation from plain "Your order [number] is confirmed" to "Your 315 Fabrics order [number] is confirmed — we'll be in touch shortly"
  - Update the WhatsApp notification text (Fonnte call — likely in the same file or in the orders API): where it lists order items, replace "Size: ..." with "${yards} yards — ${color}". Find all places that mention item details in the notification.

- [x] **TASK G8:** Repurpose `src/app/(site)/collections/page.tsx` as "Shop by Fabric Type" page. | Done: 2026-02-22 10:23
  Read the file first. Replace the ENTIRE component — it currently shows editorial campaign collections (iby_closet concept). The new version queries the `categories` table and shows a clean card grid.
  **New component:**
  ```tsx
  // Remove imports for: NotifyMeButton, StaggerContainer, StaggerItem, Collection type
  // Add: Category type (Pick<Category, 'id' | 'name' | 'slug'>)

  // Query:
  const { data: categories } = await supabaseServer
    .from('categories')
    .select('id, name, slug')
    .order('sort_order', { ascending: true });
  ```
  **New UI:** Page title "Shop by Fabric Type". White background, black text. 2-column grid (md: 3-column). Each card: link to `/shop/${category.slug}`, shows category name in large uppercase text with an arrow →. Simple border card — no images needed (we have no category photos yet).
  Example card: `border border-neutral-200 p-8 hover:border-black transition-colors group` with `text-lg uppercase tracking-widest` for name and a subtle `→` that slides on hover.
  Export `export const dynamic = 'force-dynamic'` AFTER imports.

- [x] **TASK G9:** Update homepage `src/app/(site)/page.tsx` "Shop by Category" section to show fabric categories from DB (not collections). | Done: 2026-02-22 10:23
  Read the file first. The homepage currently fetches `collections` table for the "Shop by Category" section. Replace this:
  - Change the `featuredCollections` query to instead query the `categories` table: `supabaseServer.from('categories').select('id, name, slug').order('sort_order', { ascending: true }).limit(6)`
  - Rename the returned key from `collections` to `categories`
  - Update the "Shop by Category" grid: render category cards with `href="/shop/${category.slug}"` (not `/collections/[slug]`). Since categories have no cover_image, use a text-only card design (black bg, white category name, centered, `aspect-square` or `aspect-video` with no image — just dark card). Same hover scale as before.
  - Change the "All Categories" `<Link href="/collections">` to `<Link href="/shop">` (the shop page has category filter built in via ShopFilter)
  - Update the type annotation (rename `FeaturedCollection` to `FabricCategory` = `Pick<Category, 'id' | 'name' | 'slug'>`)
  - Remove the `Collection` import from types.

- [x] **TASK G10:** Create `scripts/seed_test_products.js` — insert 2 test products for checkout testing. Follow the same dotenv + supabase pattern as other scripts. | Done: 2026-02-22 10:23
  **Product 1 — yard-type:**
  ```js
  { name: 'Rich Ankara Print — Test', slug: 'test-ankara-print', description: 'A vibrant test Ankara product for checkout testing.', price: 5000, status: 'active', unit_type: 'yard', minimum_quantity: 5, fabric_type: 'Ankara', gender: 'unisex', is_featured: true }
  ```
  Then insert 2 variants: `{ product_id, color: 'Wine Red', size: null, stock_quantity: 20 }` and `{ product_id, color: 'Navy Blue', size: null, stock_quantity: 15 }`.
  Then insert 1 product_image: `{ product_id, image_url: 'https://placehold.co/600x800/222/fff?text=Ankara+Test', is_primary: true, sort_order: 0 }`.
  **Product 2 — bundle-type:**
  ```js
  { name: 'Senator Bundle — Test', slug: 'test-senator-bundle', description: 'A test Senator bundle product.', price: 35000, status: 'active', unit_type: 'bundle', minimum_quantity: 8, fabric_type: 'Senator', gender: 'men', is_featured: false }
  ```
  Then 2 variants: `{ color: 'Charcoal Grey', size: null, stock_quantity: 10 }` and `{ color: 'Champagne', size: null, stock_quantity: 8 }`.
  Then 1 image: `{ image_url: 'https://placehold.co/600x800/333/ccc?text=Senator+Bundle', is_primary: true, sort_order: 0 }`.
  Use upsert on `slug` to avoid duplicates. Log results. **Do NOT run** — just create the script.

- [x] **TASK G11:** Add `sort` param to `src/app/(site)/shop/page.tsx` server component. | Done: 2026-02-22 10:23
  Read the file first. Currently `searchParams` only has `gender`. Add `sort` to the destructuring:
  ```ts
  const sortParam = Array.isArray(searchParams?.sort) ? searchParams?.sort[0] : searchParams?.sort;
  const sort = ['newest', 'price-asc', 'price-desc'].includes(sortParam ?? '') ? sortParam : 'newest';
  ```
  Update the Supabase query to apply sort:
  - `newest` → `.order('created_at', { ascending: false })` (already the default)
  - `price-asc` → `.order('price', { ascending: true })`
  - `price-desc` → `.order('price', { ascending: false })`
  Update the cachedFetch key to `shop:products:${gender ?? 'all'}:${sort}` so different sorts get separate cache entries.
  Pass `sort` as a new prop to `<ShopFilter sort={sort ?? 'newest'} />` — ShopFilter may not use it yet (C9 adds the UI), but wire up the prop so data is correct.

- [x] **TASK G12:** Review admin manual order form `src/app/admin/orders/new/page.tsx`. Read the file first. | Done: 2026-02-22 10:23
  **(1)** Search for any remaining `iby_closet`, `IBY-`, or old WhatsApp numbers — fix them.
  **(2)** The order item row should have a "Yards Ordered" field. Find where order items (product lines) are entered in the form. If there's a `quantity` field per item, add a `yardsOrdered` input next to it (or replace it with clearer labeling: "Qty / Yards" with a note). When submitting, include `yards_ordered: item.yardsOrdered ?? item.quantity` in the payload sent to `POST /api/orders`.

- [x] **TASK G13:** Review admin quick-sale page `src/app/admin/quick-sale/page.tsx`. Read the file first. | Done: 2026-02-22 10:23
  **(1)** Search for any remaining `iby_closet`, `IBY-` references — fix them.
  **(2)** When it builds the order payload and calls `POST /api/orders`, ensure each item includes `yards_ordered: item.quantity` (since for a quick-sale, quantity entered = yards). This is a one-line addition to the item object.

- [x] **TASK G14:** Update admin products list page `src/app/admin/products/page.tsx`. Read the file first. | Done: 2026-02-22 10:23
  Add `fabric_type` and `unit_type` columns to the product table so Ayodei can see fabric details at a glance:
  - In the Supabase select query, add `fabric_type, unit_type` to the selected fields
  - In the table header row, add columns: "Fabric Type" and "Sold By"
  - In each table row, show: `fabric_type ?? '—'` and `unit_type === 'bundle' ? 'Bundle' : 'Per Yard'`
  - Keep all existing columns and logic unchanged — just add these 2 new columns

---

## CODEX — Batch 4 — Assigned 2026-02-22

- [x] **TASK C8:** Checkout success page — fabric-specific copy. Read `src/app/(site)/checkout/success/page.tsx` first. | Done: 2026-02-22 10:23
  Update copy to be fabric-focused:
  - Main heading: "Order Confirmed" (keep as-is if already correct — just remove any "🎉" emoji or "styled" language that sounds like fashion not fabric)
  - If there's a message like "Your order has been placed": update to "Your fabric order has been confirmed."
  - If there's a sub-message about delivery: update to "We'll send you a WhatsApp message to confirm delivery timing."
  - If there are any `IBY-` format references in the display (other than the order number itself which comes from DB): change to `315-`
  - Do NOT change the order number display logic itself (it reads from params/DB)

- [x] **TASK C9:** Sort UI on shop page. Read `src/app/(site)/shop/page.tsx` first. | Done: 2026-02-22 10:23
  After G11 adds the server-side `sort` param, add UI for it:
  Add sort pills **below** the gender pills, labeled "Sort by:". Same pill style (border, uppercase, tracking-widest, black active state):
  ```tsx
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price ↑' },
    { value: 'price-desc', label: 'Price ↓' },
  ];
  ```
  Each pill links to the current page with `?sort=[value]` — preserve the existing `gender` param if present (e.g. `?gender=women&sort=price-asc`).
  The active sort comes from the `sort` prop that G11 passes down (or read from `searchParams` directly).
  Keep the sort pills in the server component (no client state needed — they're just links).

---

## CODEX — Batch 5 — Assigned 2026-02-22

- [x] **TASK C10:** Replace the application logo with the new 3:15 Fabrics logo. | Done: 2026-02-22 10:28
  - The user has provided the logo. Please ask the user to save it to `public/images/logo.png` (or similar) and update the `<Image>` tags in `src/components/Header.tsx`, `src/components/Footer.tsx`, and `AdminSidebar.tsx` to use this new logo instead of text/old images.

---

## GEMINI — Batch 5 — Assigned 2026-02-22

- [x] **TASK G15:** Fix founder name across codebase. Read each file before editing. | Done: 2026-02-22 10:45
  **(1) `src/app/(site)/brand/page.tsx`** — change ALL occurrences of `Ayodei` → `Ayodeji`. The full correct name is **Ayodeji Modinat Ayeola-Musari**. Check metadata description too.
  **(2)** Grep `src/` for any remaining `Ayodei` (without the `j`) and fix all instances.

- [ ] **TASK G16:** Run the Instagram product seed script to populate the products table.
  **Pre-requisite:** `.env.local` must have `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` set. If not present, log `⚠ BLOCKED: Missing Cloudinary credentials`.
  **(1)** Run `node scripts/seed_from_instagram.js`
  **(2)** Log the output (how many products created/skipped/errored)
  **(3)** After seeding, tell the user to activate a few products via admin or SQL: `UPDATE products SET status = 'active', is_featured = true WHERE status = 'draft' LIMIT 8;`

- [ ] **TASK G17:** Create production schema safety-net script.
  Create `scripts/ensure_production_schema.js` — follows the same dotenv + supabase pattern. Runs these statements via supabase-js raw SQL (use `.rpc('exec_sql', { sql: ... })` or just note them for the user to paste into SQL Editor):
  ```sql
  ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_type TEXT DEFAULT 'yard' CHECK (unit_type IN ('yard', 'bundle'));
  ALTER TABLE products ADD COLUMN IF NOT EXISTS minimum_quantity NUMERIC NOT NULL DEFAULT 1;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS fabric_type TEXT;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'unisex' CHECK (gender IN ('men', 'women', 'unisex'));
  ALTER TABLE order_items ADD COLUMN IF NOT EXISTS yards_ordered NUMERIC;
  ```
  **Do NOT run** — create only.

---

## CODEX — Batch 6 — Assigned 2026-02-22

- [x] **TASK C11:** Design overhaul — warm earth-tone brand palette. Read `tailwind.config.ts` and `src/app/globals.css` first. | Done: 2026-02-22 10:45
  **(1) `tailwind.config.ts`** — extend theme with brand colors:
  - `brand.earth: '#8B6914'` (warm brown)
  - `brand.gold: '#C5A55A'` (rich gold accent)
  - `brand.cream: '#FFF8F0'` (warm cream bg)
  - `brand.forest: '#2D5A27'` (deep green matching logo)
  - `brand.dark: '#1A1A1A'` (charcoal)
  Also add fontFamily: `display: ['Playfair Display', 'serif']`
  **(2) `src/app/globals.css`** — add Google Font import: `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');`. Update `:root` vars: `--background: #FFF8F0; --foreground: #1A1A1A;`
  **(3) `src/app/layout.tsx`** — if there is a font import, keep it for body. Add Playfair Display as the display font class.

- [x] **TASK C12:** Homepage hero redesign with new brand identity. Read `src/app/(site)/page.tsx` first. | Done: 2026-02-22 10:45
  **(1)** Replace the black hero with a warm, premium design:
  - Background: `bg-brand-cream` or warm gradient
  - Title: keep "315 Fabrics" but use `font-display` (Playfair Display)
  - Subtitle: "Every great outfit starts with great fabric"
  - Founder credit: "Curated by Ayodeji — Epe, Lagos" in small gold text
  - CTA buttons: `bg-brand-forest text-white` for primary, `border-brand-gold text-brand-gold` for secondary
  **(2)** Update "Pillars strip": `bg-brand-cream border-brand-gold/20`
  **(3)** Update "Shop by Category" cards: add gold border on hover (`hover:border-brand-gold`)
  **(4)** Instagram CTA section: `bg-brand-dark` with gold accents

- [x] **TASK C13:** ProductCard empty state + Header/Footer warm tones. Read each file first. | Done: 2026-02-22 10:45
  **(1) `src/components/ProductCard.tsx`** — when `imageUrl` is null, show a `bg-brand-cream` placeholder with centered "No Image" text instead of broken image. Keep same aspect ratio.
  **(2) `src/components/Header.tsx`** — update background from `bg-white/90` to `bg-brand-cream/95`. Mobile menu from `bg-[#0a0a0a]` to `bg-brand-dark`.
  **(3) `src/components/Footer.tsx`** — background from `bg-black` to `bg-brand-dark`. Section headings: add `text-brand-gold`.

---

## GEMINI — Batch 6 — Assigned 2026-02-22

- [ ] **TASK G18:** Add default product variants to all variant-less products.
  Many Instagram-imported products have no variants (0 rows in `product_variants`), which means the cart can only add them with `variant_id: 'default'`. Create a script `scripts/seed_default_variants.js` that:
  1. Finds all active products with 0 variants
  2. Inserts a default variant `{ color: 'Standard', size: null, stock_quantity: 50 }` for each
  3. Logs the count
  Run the script after creating it.

- [ ] **TASK G19:** Update the contact page with TikTok + Facebook links.
  **File:** `src/app/(site)/contact/page.tsx` — read first.
  Add TikTok and Facebook social links alongside existing Instagram and WhatsApp:
  - TikTok: `https://www.tiktok.com/@315fabrics`
  - Facebook: `https://web.facebook.com/profile.php?id=100057922604897`
  Keep the same card layout. Add 2 new contact cards for TikTok and Facebook.

- [ ] **TASK G20:** End-to-end checkout flow test.
  **Pre-req:** Paystack test keys must be in `.env.local` (they are — from IBY Closet).
  1. Start the dev server (`npm run dev`)
  2. Navigate to a product page, add to cart, go to checkout
  3. Verify the checkout form renders, Paystack payment modal loads
  4. Test with Paystack test card: `4084 0840 8408 4081`, any future expiry, any CVV
  5. Verify order confirmation page shows
  6. Report any errors or issues found

---

## CLAUDE — Audits + Architecture

- [x] Fork from iby_closet, audit full codebase | Done: 2026-02-22
- [x] Create CLAUDE.md, GEMINI.md, CODEX.md, task.md for 315 Fabrics | Done: 2026-02-22
- [x] Assign Batch 1-4
- [x] Review Vercel Application Error (Digest: 2605223714).
  - **Diagnosis:** The Vercel runtime exception is almost certainly caused by the production database missing the recent Supabase migrations (specifically the `categories` table or `unit_type` columns). When `page.tsx` or `shop.tsx` loads, it crashes because Supabase throws an error, which is caught and re-thrown by our `cachedFetch` error handler, crashing the Next.js static render or SSR.
  - **Resolution:** The human user must run the SQL migrations on the Supabase project linked to the Vercel environment!
---

## GEMINI — Batch 7 — Full UI/UX Overhaul — Assigned 2026-02-22

> Context: 80% of remaining work. Site was forked from IBY Closet (fashion). Needs structural adaptation for a Nigerian fabric store.

### Hero and First Impressions

- [ ] **G21:** Homepage hero — add a real fabric hero image. Use generate_image tool or download a royalty-free fabric image. Save to public/images/hero-fabric.jpg. Update hero in page.tsx to use as full-width background with text overlay.

- [ ] **G22:** Brand page — add Ayodeji photo. Find personal photo from product_images. Save to public/images/founder.jpg. Update brand/page.tsx with portrait beside story text.

### Product and Shopping Experience

- [ ] **G23:** Seed default product variants for all variant-less products. Create + run scripts/seed_default_variants.js. Insert { color: 'Standard', size: null, stock_quantity: 50 } per product with 0 variants.

- [ ] **G24:** Product detail page — warm brand styling. bg-brand-cream, forest green Add to Cart, font-display headings, fix fallback image, add Share on WhatsApp button.

- [ ] **G25:** Cart page — warm brand styling + yards display. bg-brand-cream, bg-brand-forest checkout button, show X yards in line items.

- [ ] **G26:** Checkout — verify Paystack integration end-to-end. Test full flow with test card 4084 0840 8408 4081.

### Content Pages

- [ ] **G27:** Lookbook page — replace placeholder. Query top 12 product images. Display in masonry grid. Title: Our Fabric Collection.

- [ ] **G28:** Yardage guide page — add real content. Table with outfit types and yard counts (blouse 2-3, iro and buba 5-6, agbada 8-10, senator 5, asoebi 5-6, gele 2).

- [ ] **G29:** Contact page — add TikTok + Facebook cards. TikTok: https://www.tiktok.com/@315fabrics. Facebook: https://web.facebook.com/profile.php?id=100057922604897.

### Mobile and Polish

- [ ] **G30:** Mobile responsiveness audit at 375px. Fix hero text, filter pills, product detail stacking, cart layout, footer columns.

- [ ] **G31:** Loading + empty states. Update loading.tsx with brand colors. Add skeleton shimmer for product grid.

- [ ] **G32:** SEO meta tags audit. Verify all pages have proper title + description.

- [ ] **G33:** Create scripts/ensure_production_schema.js safety-net script. All ALTER TABLE statements. Do NOT run.

---

## CODEX — Batch 8 — Admin and Backend — Assigned 2026-02-22

> Context: 20% of work — admin-facing features.

- [ ] **C16:** Admin products — inline price editor. Each row gets editable price input that saves on blur via PATCH.

- [ ] **C17:** Checkout success page — warm brand styling. bg-brand-cream, font-display heading, text-brand-forest order number.

- [ ] **C18:** Admin dashboard — summary cards (total products, orders this month, revenue, pending orders).

- [ ] **C19:** Admin orders — WhatsApp notification sent badge.
