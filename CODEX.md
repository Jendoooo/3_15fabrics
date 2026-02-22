# CODEX.md — Codex Agent Workspace

**This file belongs to Codex (OpenAI ChatGPT/Codex).**
- Codex reads AND writes this file
- Other agents (Claude, Gemini) read this file but do NOT edit it
- Always append to the Progress Log when completing work

---

## Your Role

You are a **frontend coding agent** for the 315 Fabrics project. You implement assigned tasks from `task.md`.

**Before starting any session:**
1. Read `CLAUDE.md` — full project brief, stack, schema, file structure
2. Read `task.md` — find tasks assigned to CODEX, pick up the first incomplete one
3. Read this file — see what you've done before and any blockers

**After completing a task:**
1. Mark it done in `task.md` — change `[ ]` to `[x]`, append `| Done: YYYY-MM-DD HH:MM`
2. Log what you did in the Progress Log below — **write detailed rationale, not just a summary**

**Progress log format (required):**
```
### [Task ID] — [Task name] | Done: YYYY-MM-DD HH:MM
- **What I did:** [files changed, components modified, state added]
- **Why I approached it this way:** [key decisions — e.g. why server component vs client, why this layout]
- **Tricky parts:** [edge cases, TypeScript challenges, hydration concerns]
- **What Claude should verify:** [specific things worth double-checking in the UI or types]
```
This detail saves Claude tokens when auditing — the more specific you are, the faster the review.

---

## Project Context Quick Reference

- **Brand:** 315 Fabrics — fabric store, Epe Lagos, Instagram @3_15fabrics
- **Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase, Paystack, Resend, Fonnte, Cloudinary, PostHog, Upstash Redis
- **Customer pages:** `src/app/(site)/` route group (NOT `src/app/` directly)
- **Admin pages:** `src/app/admin/`
- **Cart store:** `src/lib/cart-store.ts` — Zustand, persisted to localStorage
- **Cart key:** `315fabrics-cart`
- **CartItem type includes:** `unit_type: 'yard' | 'bundle'` and `minimum_quantity: number` (added in G2)
- **Variants:** colorways only — `color` = colorway name, `size = null` always
- **Yards logic:** `quantity` = yards ordered for yard-type products, or 1 for bundles. Line total = `unit_price × quantity`.
- **Order format:** `315-YYYY-XXXXXX`
- **WhatsApp:** `2349066609177`
- **Full brief:** `CLAUDE.md`
- **All tasks:** `task.md`

---

## Coding Standards

- TypeScript strict — no `any` types
- Tailwind only for styling — no inline styles, no CSS modules
- Server Components by default; add `'use client'` only when needed (event handlers, hooks, browser APIs)
- `'use client'` required for: Zustand cart reads, useState/useEffect, onClick handlers, PostHog events
- Mobile-first — layouts at 375px width first
- Use `<Image>` from `next/image` — never bare `<img>` tags
- Use `<Link>` from `next/link` for internal navigation

---

## Architecture Notes

- All customer-facing pages are in `src/app/(site)/` route group — this shares `(site)/layout.tsx` (Header + Footer + BackToTop + PostHog)
- Admin panel is in `src/app/admin/` with separate `admin/layout.tsx`
- ProductCard component: `src/components/ProductCard.tsx` — use for all product grids
- Cart store: `src/lib/cart-store.ts` — import `useCartStore` hook
- Supabase: import `supabaseServer` for server components/API routes, `supabaseBrowser` for client components
- Delivery calculation: `POST /api/delivery/calculate` with `{ state, city, country }`
- Order creation: `POST /api/orders` — handles both yard and bundle types

---

## ⚠ NEW TASKS — Batch 1 (2026-02-22)

You have 3 new tasks: **C1, C2, C3**. Read `task.md` for full specs. Work order: **C1 → C2 → C3**.

**Note on C1 dependency:** C1 reads `CartItem` from `src/lib/cart-store.ts` which is updated by Gemini in G2. G2 adds `unit_type` and `minimum_quantity` to CartItem. Work from the spec below — don't wait for G2 to complete, just add the same fields in your component.

---

### C1: ProductPurchasePanel full rewrite for fabric UX

**File:** `src/app/(site)/products/[slug]/ProductPurchasePanel.tsx`

Read the existing file first. This is a complete rewrite of the purchase panel for fabric-specific buying.

**New props to add:**
```typescript
type ProductPurchasePanelProps = {
  productId: string;
  productName: string;
  unitPrice: number;           // price per yard (yard-type) or bundle price (bundle-type)
  productStatus: string;
  primaryImageUrl: string | null;
  variants: VariantOption[];   // colorways only — variant.color is the colorway name
  unitType: 'yard' | 'bundle'; // NEW
  minimumQuantity: number;     // NEW — min yards (yard-type) or total yards (bundle label)
};
```

**Remove from VariantOption type:** `size` is no longer relevant but keep it in the type to avoid TS errors — just don't display it.

**New UI behaviour:**

**Colourway selector (replaces size selector):**
- Label: "Colourway" (not "Size")
- Show one button per variant, displaying `variant.color ?? 'Default'`
- Selected: `border-black bg-black text-white`
- Disabled (out of stock): `opacity-50 cursor-not-allowed`

**Yard-type products (`unitType === 'yard'`):**
- Show a numeric input below the colourway selector. Label: "Yards"
- Input: `type="number"`, `min={minimumQuantity}`, `max={selectedVariant?.stock_quantity ?? minimumQuantity}`, `step={0.5}`, default value = `minimumQuantity`
- Show line total below input: `"${yards} yards × ₦${unitPrice.toLocaleString('en-NG')} = ₦${(yards * unitPrice).toLocaleString('en-NG')}"`
- Button: "Add to Cart"
- Stock message: "X yards in stock" below the input

**Bundle-type products (`unitType === 'bundle'`):**
- No yard quantity input — quantity is locked at 1
- Show text below colourway: `"Complete set — ${minimumQuantity} yards"` (e.g. "Complete set — 5 yards")
- Button: "Order This Bundle"

**WhatsApp fallback (if no variants at all):**
- Keep existing WhatsApp CTA: "Enquire on WhatsApp"

**addItem call — use `quantity` to mean yards:**
```typescript
addItem({
  product_id: productId,
  slug: productSlug,
  variant_id: selectedVariant.id,
  product_name: productName,
  size: '',          // always empty for fabrics
  color: selectedVariant.color ?? 'Default',
  unit_price: unitPrice,
  quantity: yards,   // yards entered for yard-type, or 1 for bundle-type
  image_url: primaryImageUrl ?? '',
  unit_type: unitType,
  minimum_quantity: minimumQuantity,
});
```

**Also update `src/app/(site)/products/[slug]/page.tsx`:**
- Add `unitType={productData.unit_type as 'yard' | 'bundle'}` and `minimumQuantity={productData.minimum_quantity}` props when rendering `<ProductPurchasePanel>`.
- `productData.unit_type` might be `null` for legacy products — fall back to `'yard'` if null: `unitType={(productData.unit_type ?? 'yard') as 'yard' | 'bundle'}`.
- `productData.minimum_quantity` might be `null` — fall back to `1`: `minimumQuantity={productData.minimum_quantity ?? 1}`.

---

### C2: Global branding + copy updates

Update all visible text from iby_closet → 315 Fabrics branding. Read each file before editing.

**`src/components/Header.tsx`:**
- Brand name text → "315 Fabrics" (or use logo if one exists — check `public/` for 315fabrics logo files; if none exist, use text)
- In both desktop nav and mobile menu links: change "Size Guide" to "Yardage Guide", change `href="/size-guide"` to `href="/yardage-guide"`
- Update mobile menu Instagram/WhatsApp links to @3_15fabrics and `2349066609177` if hardcoded

**`src/components/Footer.tsx`:**
- Brand name → "315 Fabrics"
- Tagline → "Premium fabrics, sourced from around the world. Based in Epe, Lagos."
- Instagram href → `https://instagram.com/3_15fabrics`, display text "@3_15fabrics"
- WhatsApp href → `https://wa.me/2349066609177`
- Copyright → `© {new Date().getFullYear()} 315 Fabrics. All rights reserved.`
- Explore links: keep Shop, Collections — change "Size Guide" to "Yardage Guide" (href `/yardage-guide`), keep FAQ, Contact
- Change "Brand" link label to "About Us" if present (href stays `/brand`)

**`src/app/layout.tsx`:**
- `metadata.title` default → "315 Fabrics"
- `metadata.description` → "Premium asoebi fabrics — Ankara, French Lace, Swiss Voile, Aso-Oke, Senator and more. Based in Epe, Lagos. Shop online."

**`src/app/(site)/layout.tsx`:**
- Update OpenGraph `siteName` → "315 Fabrics"
- Update metadata template → `'%s — 315 Fabrics'`
- Update description if hardcoded

**`src/app/(site)/loading.tsx`:**
- Change the pulsing brand text from "iby_closet" (or whatever it currently says) to "315 FABRICS"

**Create `src/app/(site)/yardage-guide/page.tsx`** (new file — server component, no data fetching):
```
export const metadata = { title: 'Yardage Guide' };
export default function YardageGuidePage() { ... }
```
Page content:
- h1: "Yardage Guide"
- Intro: "Not sure how many yards you need? Here's a quick guide for common Nigerian styles."
- Table with columns: "Style", "Yards Needed":
  | Style | Yards Needed |
  | Buba + Iro (traditional) | 6–8 yards |
  | Gown (fitted/midi) | 4–5 yards |
  | Gown (maxi/flared) | 5–7 yards |
  | Agbada (3-piece set) | 12–15 yards |
  | Kaftan (men's) | 4–5 yards |
  | Men's shirt | 2.5–3 yards |
  | Trousers | 2–2.5 yards |
  | Aso-Oke wrapper (per piece) | 2 yards |
  | Asoebi group order | Contact us for bulk pricing |
- Tips section: "Tips for Ordering" with 3 bullet points: "When in doubt, buy an extra half yard — it's better to have extra than to run short.", "For group asoebi orders, measure per outfit style and multiply by number of guests.", "Not sure? WhatsApp us at +234 906 660 9177 and we'll help you work it out."
- Keep the same page style (server component, same visual pattern as existing size-guide/faq pages — white background, editorial text, consistent padding)

**`src/app/(site)/brand/page.tsx`:**
- Read the file first
- Replace "Ibrahim Hamed" → "Our Founder" (placeholder until name confirmed)
- Replace all "iby_closet" → "315 Fabrics"
- Instagram link → `https://instagram.com/3_15fabrics`
- WhatsApp → `https://wa.me/2349066609177`
- Update brand story text to fabric-focused: "Every great outfit starts with great fabric. At 315 Fabrics, we source the finest Ankara, French Lace, Swiss Voile, Aso-Oke, and more — so you can create looks that tell your story. Based in Epe, Lagos, we serve customers across Nigeria and beyond."
- Keep existing page layout/structure — only change text content and links

**`src/app/(site)/page.tsx`:**
- Find the brand pillar/marquee strip text and replace: "Designed in Lagos · Founder-Led · Themed Collections" → "Sourced Globally · Sold in Epe, Lagos · Premium Fabrics"
- Update Instagram CTA link: @iby_closet → @3_15fabrics, href → `https://instagram.com/3_15fabrics`
- If there's a founder quote section referencing Ibrahim, update it to: "The right fabric makes the outfit. We make sure you always find yours." (remove any attribution to "Ibrahim Hamed")

**`src/app/(site)/lookbook/page.tsx`:**
- Read the file first
- Replace the entire page content with a "Coming Soon" state:
  - Full-screen black background (`min-h-screen bg-black text-white flex items-center justify-center`)
  - Centred text block: h1 "The Lookbook" (text-4xl font-light uppercase tracking-[0.3em]), subtitle "Campaign photos and editorial content are coming soon." (text-sm text-neutral-400 tracking-widest mt-4), then an Instagram link "@3_15fabrics" → `https://instagram.com/3_15fabrics` styled as a border button (border border-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-colors mt-8 inline-block)
- Keep the `metadata` export if it exists, just update the title
- This can be a server component (no client state needed)

---

### C3: Admin ProductForm — add fabric-specific fields

**File:** `src/app/admin/_components/ProductForm.tsx`

Read the entire file first to understand its structure. Then add 3 new fields, keeping all existing logic unchanged.

**State additions** (in the component's useState section):
```typescript
const [unitType, setUnitType] = useState<'yard' | 'bundle'>(product?.unit_type as 'yard' | 'bundle' ?? 'yard');
const [minimumQuantity, setMinimumQuantity] = useState<number>(product?.minimum_quantity ?? 1);
const [fabricType, setFabricType] = useState<string>(product?.fabric_type ?? '');
```

**Form field 1 — Fabric Type dropdown** (add after the Status field):
```tsx
<div>
  <label className="mb-1 block text-xs uppercase tracking-widest">Fabric Type</label>
  <select
    value={fabricType}
    onChange={(e) => setFabricType(e.target.value)}
    className="w-full border border-neutral-200 bg-white px-3 py-2 text-sm"
  >
    <option value="">— Select Fabric Type —</option>
    <option value="Ankara">Ankara</option>
    <option value="French Lace">French Lace</option>
    <option value="Swiss Voile">Swiss Voile</option>
    <option value="Senator">Senator</option>
    <option value="Aso-Oke">Aso-Oke</option>
    <option value="Cotton">Cotton</option>
    <option value="Other">Other</option>
  </select>
</div>
```

**Form field 2 — Unit Type toggle** (add after Fabric Type):
```tsx
<div>
  <label className="mb-1 block text-xs uppercase tracking-widest">Sold By</label>
  <div className="flex gap-4">
    <label className="flex items-center gap-2 text-sm">
      <input type="radio" value="yard" checked={unitType === 'yard'} onChange={() => setUnitType('yard')} />
      Per Yard
    </label>
    <label className="flex items-center gap-2 text-sm">
      <input type="radio" value="bundle" checked={unitType === 'bundle'} onChange={() => setUnitType('bundle')} />
      Bundle Only (fixed set)
    </label>
  </div>
</div>
```

**Form field 3 — Minimum Quantity** (add after Unit Type):
```tsx
<div>
  <label className="mb-1 block text-xs uppercase tracking-widest">
    {unitType === 'yard' ? 'Minimum Yards to Order' : 'Bundle Size (total yards in set)'}
  </label>
  <input
    type="number"
    min={0.5}
    step={0.5}
    value={minimumQuantity}
    onChange={(e) => setMinimumQuantity(parseFloat(e.target.value) || 1)}
    className="w-full border border-neutral-200 px-3 py-2 text-sm"
    placeholder={unitType === 'yard' ? 'e.g. 5' : 'e.g. 6'}
  />
  <p className="mt-1 text-xs text-neutral-500">
    {unitType === 'yard'
      ? 'Customers cannot order fewer yards than this.'
      : 'The number of yards included in this bundle set.'}
  </p>
</div>
```

**Variants section update:**
- Find the "Size" column header in the variants table/grid and change it to "Colorway / Pattern"
- Find the size input field in each variant row — keep it in the DOM but add `placeholder="(not used for fabrics)"` and `className="... opacity-50"` to visually de-emphasize it
- The `color` input stays the primary field for colorway names

**Form submission update:**
- In the create/update product call, include `unit_type: unitType`, `minimum_quantity: minimumQuantity`, `fabric_type: fabricType || null` in the product data object passed to Supabase.

---

## ⚠ NEW TASKS — Batch 2 (2026-02-22)

You have 2 new tasks: **C4 and C5**. Work order: C1 → C3 → C4 → C5. (C2 is marked done — Claude handled most of it.)

**Status update on C2:** Claude already did items 1–5 and 7–9 of C2 (Header, Footer, layout.tsx files, loading.tsx, brand/page.tsx, lookbook/page.tsx, page.tsx). The only remaining C2 item is the yardage guide page — that is now **C5**.

---

### C4: Gender Filter on Shop Page + Admin Gender Dropdown

**File 1: `src/app/(site)/shop/page.tsx`**
Read the file first. It is a server component. Add a `gender` search param:
- Destructure: `const { category, search, gender } = searchParams` (or however searchParams is currently destructured)
- Add to Supabase products query: if `gender && ['men','women','unisex'].includes(gender)`, add `.eq('gender', gender)` to the query chain
- Add gender filter pills above the product grid (before or after any existing category filter):
```tsx
<div className="flex gap-2 mb-8 flex-wrap">
  {(['all', 'men', 'women', 'unisex'] as const).map((g) => {
    const href = g === 'all' ? '/shop' : `/shop?gender=${g}`;
    const active = (gender ?? 'all') === g;
    return (
      <Link key={g} href={href}
        className={`px-4 py-1.5 text-xs uppercase tracking-widest border transition-colors ${
          active ? 'bg-black text-white border-black' : 'border-neutral-300 text-neutral-600 hover:border-black hover:text-black'
        }`}>
        {g === 'all' ? 'All' : g.charAt(0).toUpperCase() + g.slice(1)}
      </Link>
    );
  })}
</div>
```

**File 2: `src/app/admin/_components/ProductForm.tsx`**
Add after the Fabric Type `<select>` (from C3):
- State: `const [gender, setGender] = useState<string>(product?.gender ?? 'unisex');`
- Field:
```tsx
<div>
  <label className="mb-1 block text-xs uppercase tracking-widest">Gender</label>
  <select
    value={gender}
    onChange={(e) => setGender(e.target.value)}
    className="w-full border border-neutral-200 bg-white px-3 py-2 text-sm"
  >
    <option value="unisex">Unisex</option>
    <option value="women">Women</option>
    <option value="men">Men</option>
  </select>
</div>
```
- Include `gender` in the product upsert/insert payload.

---

### C5: Yardage Guide Page (remaining from C2)

**Create `src/app/(site)/yardage-guide/page.tsx`** — server component, no data fetching. Read `src/app/(site)/faq/page.tsx` first to match the visual style (white bg, max-w-3xl, editorial padding, section spacing).

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Yardage Guide',
  description: 'Not sure how many yards you need? Use this guide for common Nigerian outfit styles.',
};

export default function YardageGuidePage() { ... }
```

**Page content:**
- Hero section (black bg, white text, same as brand/faq pages): h1 "Yardage Guide", subtitle "How many yards do you need?"
- Main content section (white bg, max-w-3xl, centered, py-20 px-6):
  - Intro: "Not sure how many yards you need? Here's a quick guide for common Nigerian styles."
  - Table (use `<table>` with border-collapse, clean styling — thead with "Style" and "Yards Needed" headers, tbody rows alternating subtle bg):
    | Style | Yards Needed |
    |---|---|
    | Buba + Iro (traditional) | 6–8 yards |
    | Gown (fitted/midi) | 4–5 yards |
    | Gown (maxi/flared) | 5–7 yards |
    | Agbada (3-piece set) | 12–15 yards |
    | Kaftan (men's) | 4–5 yards |
    | Men's shirt | 2.5–3 yards |
    | Trousers | 2–2.5 yards |
    | Aso-Oke wrapper (per piece) | 2 yards |
    | Asoebi group order | Contact us for bulk pricing |
  - h2: "Tips for Ordering" (uppercase tracking-widest)
  - ul with 3 items:
    - "When in doubt, buy an extra half yard — it's better to have extra than to run short."
    - "For group asoebi orders, measure per outfit style and multiply by number of guests."
    - "Not sure? WhatsApp us at +234 906 660 9177 and we'll help you work it out."
- CTA at bottom: `<Link href="/shop">← Back to Shop</Link>`

---

## Progress Log

- **[2026-02-22 09:46]** Completed C1, C3, C4, and C5. Rewrote `src/app/(site)/products/[slug]/ProductPurchasePanel.tsx` for colourway + yard/bundle UX and updated `src/app/(site)/products/[slug]/page.tsx` to pass `unitType`/`minimumQuantity`. Added fabric fields (`fabric_type`, `unit_type`, `minimum_quantity`) and `gender` support to `src/app/admin/products/_components/ProductForm.tsx`, including payload updates and variant UI adjustments. Added server-side gender filtering + pills in `src/app/(site)/shop/page.tsx`. Created `src/app/(site)/yardage-guide/page.tsx` with hero, yardage table, ordering tips, and back-to-shop CTA. Ran ESLint on all touched files with no errors.

### [C6] - Cart yards display | Done: 2026-02-22 10:06
- **What I did:** Updated `src/app/(site)/cart/page.tsx` item rendering to derive `itemUnitType` with a legacy fallback (`item.unit_type ?? 'yard'`), display quantity labels as `"{quantity} yards"` for yard items and `"Bundle (1 set)"` for bundle items, and render the requested line-total label format (`yds x unit = total`) in the existing total text area.
- **Why I approached it this way:** I kept the existing cart row structure and quantity-control placement intact to satisfy the "no layout change" constraint, limiting edits to the text content and label composition logic.
- **Tricky parts:** Persisted legacy cart entries may not include `unit_type`; handling that runtime case safely without changing cart store typings required a local fallback in the render path.
- **What Claude should verify:** Check mobile width behavior for long quantity labels inside the quantity control, and confirm expected copy for both `yard` and `bundle` items in cart rows.

### [C7] - Remove size guide and update track example | Done: 2026-02-22 10:06
- **What I did:** Deleted `src/app/(site)/size-guide/page.tsx`, removed the empty `src/app/(site)/size-guide/` directory, and updated the order-format helper text in `src/app/(site)/track/page.tsx` to `315-2026-XXXXXX`.
- **Why I approached it this way:** The task explicitly requested route removal (accepting 404 behavior) and a copy-only update on track page, so I avoided any redirect or logic changes.
- **Tricky parts:** None functionally; the key risk was accidental edits to tracking logic, which I avoided by changing only the display line.
- **What Claude should verify:** Confirm `/size-guide` returns 404 and `/track` now shows the `315-` format example while API behavior remains unchanged.

### [C8] - Checkout success fabric copy | Done: 2026-02-22 10:23
- **What I did:** Updated `src/app/(site)/checkout/success/page.tsx` copy to fabric-focused language, including "Your fabric order has been confirmed.", delivery follow-up text via WhatsApp timing confirmation, and changed the secondary CTA label from "Continue Shopping" to "Back to Shop" while keeping `href="/shop"`.
- **Why I approached it this way:** I preserved all existing success-page mechanics (order query param read, cart clearing side effect, and tracking link logic) and limited the change to display copy/labels as requested.
- **Tricky parts:** `react/no-unescaped-entities` lint rule required wording that avoids raw apostrophes in JSX text nodes.
- **What Claude should verify:** Confirm the success page still clears cart and shows the same order number behavior, and verify updated copy tone aligns with fabric-first brand voice.

### [C9] - Shop sort pills UI | Done: 2026-02-22 10:23
- **What I did:** Verified `src/app/(site)/shop/page.tsx` now includes server-side `sort` parsing, sorted product query ordering (`newest`, `price-asc`, `price-desc`), cache-key scoping by sort, and sort pills rendered below gender pills with a "Sort by:" label and links preserving the selected `gender` query param.
- **Why I approached it this way:** C9 depends on G11; the required G11 wiring was already present in the file, so I validated and retained it rather than duplicating logic, then verified it still matches the C9 UI contract.
- **Tricky parts:** Ensuring query-string preservation across both gender and sort controls without introducing client state.
- **What Claude should verify:** Confirm sort pill links produce expected URL combinations (`/shop`, `/shop?sort=price-asc`, `/shop?gender=women&sort=price-desc`) and that server-side ordering reflects each selection.

---

### [C10] - Replace Application Logo | Done: 2026-02-22 10:28
- **What I did:** Updated `Header.tsx`, `Footer.tsx` and `AdminSidebar.tsx` to use the `next/image` component to display the new `logo.png`. Used inline styling (e.g., adding a light bounding box) to maintain contrast against dark backgrounds.
- **Why I approached it this way:** The requirement was strictly to swap the text element to an image representation. The image needed to look correct in both light (`AdminSidebar`/`Header`) and dark (`Footer`/Slide-in Menu) environments.
- **Tricky parts:** Ensuring the correct use of `next/image` sizes to prevent overflow, and preventing unreadable contrast for dark backgrounds. 
- **What Claude should verify:** That the logo scales correctly on mobile, and the white-bordered style in the Footer/Header slide-in effectively sets off the green logo on dark backgrounds.

---

## ⚠ NEW TASKS — Batch 3 (2026-02-22)

You have 2 new tasks: **C6, C7**. Work order: C6 → C7.

---

### C6: Cart page — yards display

**File:** `src/app/(site)/cart/page.tsx` — read the entire file first.

The cart items already have `unit_type` and `quantity` (where quantity = yards for yard-type products). Update the cart item display so the units are clearly labeled:

- For items where `item.unit_type === 'yard'`:
  - Show `"{item.quantity} yards"` instead of a plain number for the quantity column
  - Line total label should read: `{item.quantity} yds × ₦{price.toLocaleString('en-NG')} = ₦{total.toLocaleString('en-NG')}`
- For items where `item.unit_type === 'bundle'` (or undefined):
  - Show `"Bundle (1 set)"` instead of a plain `1`
- The subtotal calculation (`item.unit_price × item.quantity`) does NOT change — only the display labels
- Match existing cart item styling — don't change the layout, only update text for quantity and unit labels

**Note:** If `unit_type` is not set on a cart item (legacy items), treat it as `'yard'` for display purposes.

---

### C7: Delete size-guide + fix track page format

**(1) Delete `src/app/(site)/size-guide/page.tsx`** — this page is superseded by `/yardage-guide`. Simply delete the file (the URL will 404, which is acceptable — no redirect needed). Check if there is a `src/app/(site)/size-guide/` directory; if so, delete the whole folder.

**(2) Fix `src/app/(site)/track/page.tsx`** — read the file first. Find the order number format example text (something like "e.g. IBY-2026-XXXXXX" or "Format: IBY-..." in a placeholder or help text). Change it to show `315-2026-XXXXXX` format. Only change the example/display text — do NOT touch form logic, API calls, state, or any functional code.

---

## ⚠ NEW TASKS — Batch 4 (2026-02-22)

You have 2 new tasks: **C8, C9**. Work order: C8 → C9. Note: C9 depends on G11 (Gemini adds the sort param to the server component first).

---

### C8: Checkout success page — fabric copy

**File:** `src/app/(site)/checkout/success/page.tsx` — read the entire file first.

Update copy to be fabric-focused (not fashion/clothing):
- If heading says something like "Order Confirmed ✓" — keep but remove any emojis
- Find the sub-message about what happens next. Change to: `"Your fabric order has been confirmed. We'll send you a WhatsApp message to confirm delivery timing and track your package."`
- If there's a line about "Your style is on its way" or similar fashion copy — change to: `"Your fabric is on its way."`
- If the page has a "Continue Shopping" or similar CTA — update label to `"Back to Shop"` pointing to `/shop`
- If there's any `IBY-` in display text (not the actual order number from DB) — fix to `315-`
- Do NOT change the order number display logic, the Paystack reference lookup, or any API calls

---

### C9: Sort UI on shop page

**File:** `src/app/(site)/shop/page.tsx` — read first. **Requires G11 to be done** (Gemini adds `sort` prop to ShopFilter and the server-side sort param).

After G11 is complete, add sort pills to the shop page **below** the gender pills. The `sort` value comes from `searchParams.sort` (already extracted server-side by G11 — reuse the same logic).

Sort options:
```tsx
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
] as const;
```

Render sort pills with the same styling as the gender pills (border, uppercase, tracking-widest, black active state). Pill links must preserve the existing `gender` param:
```tsx
// build the href preserving gender
const sortHref = (sortValue: string) => {
  const params = new URLSearchParams();
  if (gender) params.set('gender', gender);
  if (sortValue !== 'newest') params.set('sort', sortValue);
  const qs = params.toString();
  return `/shop${qs ? '?' + qs : ''}`;
};
```

Add a "Sort by:" label before the pills: `<span className="text-xs uppercase tracking-widest text-neutral-500 mr-2">Sort by:</span>`

---

## ⚠ NEW TASKS — Batch 6 (2026-02-22)

You have 3 new tasks: **C11, C12, C13**. Work order: C11 → C12 → C13.

### C11: Design overhaul — warm earth-tone brand palette
**Files:** `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`
- Add brand colors: earth (#8B6914), gold (#C5A55A), cream (#FFF8F0), forest (#2D5A27), dark (#1A1A1A)
- Add `Playfair Display` font for headings via Google Fonts import
- Update CSS vars: `--background: #FFF8F0; --foreground: #1A1A1A`

### C12: Homepage hero redesign
**File:** `src/app/(site)/page.tsx`
- Replace black hero with warm `bg-brand-cream` design
- Title in Playfair Display, subtitle: "Every great outfit starts with great fabric"
- Founder credit: "Curated by Ayodeji — Epe, Lagos" in gold
- CTA: `bg-brand-forest` primary, `border-brand-gold` secondary
- Update pillars strip, category cards, and Instagram CTA with warm tones

### C13: ProductCard empty state + Header/Footer warm tones
- ProductCard: `bg-brand-cream` placeholder when no image
- Header: `bg-brand-cream/95` instead of white, `bg-brand-dark` for mobile menu
- Footer: `bg-brand-dark` instead of black, `text-brand-gold` section headings

---

## Notes for Future Batches

- The visual aesthetic (warm earth tones, gold accents) is NOW being implemented in C11-C13.
- The lookbook is set to "Coming Soon" for now — no gallery needed until the owner has campaign photos.
- Admin session cookie is now `315fabrics_admin_session` (renamed by Gemini G5).
- When products are seeded from Instagram, `product_variants.size` will be `null` for all rows — colorways only.
